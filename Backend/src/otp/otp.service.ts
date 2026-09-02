import { ConflictException, Injectable, UnauthorizedException } from '@nestjs/common';
import { compare, hash } from 'bcryptjs';
import { randomInt } from 'node:crypto';
import { EskizSmsService } from './eskiz-sms.service';

type PendingCode = { codeHash: string; expiresAt: number; attempts: number; sentAt: number };
type VerifiedPhone = { expiresAt: number };

const CODE_TTL_MS = 5 * 60 * 1000; // kod 5 daqiqa amal qiladi
const RESEND_COOLDOWN_MS = 60 * 1000; // qayta yuborishdan oldin 1 daqiqa kutish
const MAX_ATTEMPTS = 5;
// Kod tasdiqlangandan keyin (yangi foydalanuvchi uchun) F.I.O kiritish oynasi —
// shu vaqt ichida qayta OTP so'ramasdan complete-profile chaqirsa bo'ladi.
const VERIFIED_GRACE_MS = 10 * 60 * 1000;

/**
 * One backend instance serves this application, so short-lived OTP state can
 * live in memory. The code itself is never kept in plaintext and becomes
 * invalid after a restart or successful verification.
 */
@Injectable()
export class OtpService {
  private readonly pending = new Map<string, PendingCode>();
  private readonly verified = new Map<string, VerifiedPhone>();

  constructor(private readonly sms: EskizSmsService) {}

  async requestOtp(phone: string) {
    const existing = this.pending.get(phone);
    if (existing && Date.now() - existing.sentAt < RESEND_COOLDOWN_MS) {
      const waitSeconds = Math.ceil((RESEND_COOLDOWN_MS - (Date.now() - existing.sentAt)) / 1000);
      throw new ConflictException(`Qayta yuborish uchun ${waitSeconds} soniya kuting`);
    }
    const code = String(randomInt(100_000, 1_000_000));
    const template = process.env.ESKIZ_OTP_TEMPLATE ?? 'Prime Capital ilovasiga kirish uchun bir martalik kod: {code} KODNI HECH KIMGA BERMANG.';
    await this.sms.send(phone, template.replace('{code}', code));
    this.pending.set(phone, {
      codeHash: await hash(code, 12),
      expiresAt: Date.now() + CODE_TTL_MS,
      attempts: 0,
      sentAt: Date.now(),
    });
    return { sentTo: phone, expiresInSeconds: CODE_TTL_MS / 1000, resendInSeconds: RESEND_COOLDOWN_MS / 1000 };
  }

  /**
   * Verifies + consumes the code. On success the phone is marked "verified"
   * for a grace window (see `consumeVerified`) so a brand-new user can
   * complete their profile right after without a second SMS.
   */
  async verifyCode(phone: string, code: string): Promise<void> {
    const entry = this.pending.get(phone);
    if (!entry) throw new UnauthorizedException('Avval SMS orqali kod so‘rang');
    if (Date.now() > entry.expiresAt) {
      this.pending.delete(phone);
      throw new UnauthorizedException('Kod muddati tugagan, qayta so‘rang');
    }
    if (entry.attempts >= MAX_ATTEMPTS) {
      this.pending.delete(phone);
      throw new UnauthorizedException('Urinishlar soni tugadi, kodni qayta so‘rang');
    }
    if (!await compare(code, entry.codeHash)) {
      entry.attempts += 1;
      throw new UnauthorizedException('Kod noto‘g‘ri');
    }
    this.pending.delete(phone);
    this.verified.set(phone, { expiresAt: Date.now() + VERIFIED_GRACE_MS });
  }

  /** Consumes the "verified" grace window — called once, right before creating a brand-new account for this phone. */
  consumeVerified(phone: string): void {
    const entry = this.verified.get(phone);
    if (!entry || Date.now() > entry.expiresAt) {
      this.verified.delete(phone);
      throw new UnauthorizedException('Telefon tasdiqlanmagan yoki muddati tugagan, qaytadan kod so‘rang');
    }
    this.verified.delete(phone);
  }
}
