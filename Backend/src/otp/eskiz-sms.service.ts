import { Injectable, Logger, ServiceUnavailableException } from '@nestjs/common';
import { toEskizMobilePhone } from '../common/phone.util';

/**
 * Thin client for Eskiz.uz's SMS API (https://documenter.getpostman.com/view/663428/RzfmES4z).
 * Auth is a separate bearer token (from /auth/login, email+password), cached
 * in memory and transparently refreshed on a 401 — Eskiz tokens are
 * long-lived (~30 days) so a full re-login per SMS would be wasteful.
 *
 * Sandbox/test Eskiz accounts only accept the fixed text "This is test from
 * Eskiz" until a real sender name + message template is approved by Eskiz
 * support for production — a custom OTP text will silently fail moderation
 * on a brand-new test account. This is an Eskiz-side constraint, not
 * something this service can work around.
 */
@Injectable()
export class EskizSmsService {
  private readonly logger = new Logger(EskizSmsService.name);
  private readonly baseUrl = process.env.ESKIZ_BASE_URL ?? 'https://notify.eskiz.uz/api';
  private readonly email = process.env.ESKIZ_EMAIL;
  private readonly password = process.env.ESKIZ_PASSWORD;
  // `?.trim() || '4546'` — not `?? '4546'` — because an empty `ESKIZ_FROM=`
  // line in .env makes process.env.ESKIZ_FROM `''`, not undefined, so `??`
  // would silently keep the empty string. An empty `from` gets accepted by
  // Eskiz's API (still returns 200) but the SMS never actually gets
  // delivered — exactly the "app says sent, phone gets nothing" symptom.
  private readonly from = process.env.ESKIZ_FROM?.trim() || '4546';
  private token: string | null = null;

  private async login(): Promise<string> {
    if (!this.email || !this.password) {
      throw new ServiceUnavailableException('SMS xizmati sozlanmagan (.env dagi ESKIZ_EMAIL / ESKIZ_PASSWORD yo‘q)');
    }
    const response = await fetch(`${this.baseUrl}/auth/login`, {
      method: 'POST',
      headers: { 'content-type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({ email: this.email, password: this.password }),
    });
    if (!response.ok) {
      this.logger.error(`Eskiz login muvaffaqiyatsiz (${response.status}): ${await response.text().catch(() => '')}`);
      throw new ServiceUnavailableException('SMS xizmatiga ulanib bo‘lmadi');
    }
    const data = (await response.json()) as { data?: { token?: string } };
    const token = data.data?.token;
    if (!token) throw new ServiceUnavailableException('SMS xizmatidan token olinmadi');
    this.token = token;
    return token;
  }

  async send(normalizedPhone: string, message: string): Promise<void> {
    const mobilePhone = toEskizMobilePhone(normalizedPhone);
    const token = this.token ?? (await this.login());

    const attempt = (bearer: string) =>
      fetch(`${this.baseUrl}/message/sms/send`, {
        method: 'POST',
        headers: { authorization: `Bearer ${bearer}`, 'content-type': 'application/x-www-form-urlencoded' },
        body: new URLSearchParams({ mobile_phone: mobilePhone, message, from: this.from }),
      });

    let response = await attempt(token);
    if (response.status === 401) {
      // Cached token expired/invalid — one silent re-login + retry.
      const fresh = await this.login();
      response = await attempt(fresh);
    }
    const bodyText = await response.text().catch(() => '');
    if (!response.ok) {
      this.logger.error(`Eskiz SMS yuborilmadi (${response.status}): ${bodyText}`);
      throw new ServiceUnavailableException('SMS yuborib bo‘lmadi, birozdan so‘ng qayta urinib ko‘ring');
    }
    // Eskiz ko'pincha 200 qaytaradi hatto xabar keyinchalik moderatsiya/
    // yetkazishda to'xtab qolsa ham (masalan, tasdiqlanmagan shablon yoki
    // sandbox hisob). Shuning uchun javobni har doim logga yozamiz — agar
    // SMS kelmasa, server logidan (`docker compose logs backend` yoki
    // `pnpm start` konsoli) haqiqiy sababini ko'rish mumkin.
    this.logger.log(`Eskiz SMS so'rovi qabul qilindi (${mobilePhone}, from=${this.from}): ${bodyText}`);
  }
}
