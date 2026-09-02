import { Body, Controller, Post } from '@nestjs/common';
import { PlatformService } from '../platform/platform.service';
import { CompleteOtpProfileDto, RequestOtpDto, VerifyOtpDto } from './otp.dto';
import { OtpService } from './otp.service';

/**
 * Phone + SMS-OTP login/registration for the Mobile app (and for anyone who
 * registered through the Telegram bot and wants to log in outside
 * Telegram). Three steps:
 *   1. POST /auth/otp/request         — sends a 6-digit code via SMS
 *   2. POST /auth/otp/verify          — checks the code; logs in existing
 *      users immediately, or answers `{ needsProfile: true }` for a phone
 *      number that isn't on file yet (including one only the Telegram bot
 *      ever recorded, matched via normalizeUzPhone — see PlatformService).
 *   3. POST /auth/otp/complete-profile — only for `needsProfile: true`:
 *      creates the account with just phone + name, no email/password.
 */
@Controller('auth/otp')
export class OtpController {
  constructor(private readonly otp: OtpService, private readonly platform: PlatformService) {}

  @Post('request')
  request(@Body() dto: RequestOtpDto) {
    return this.otp.requestOtp(dto.phone);
  }

  @Post('verify')
  async verify(@Body() dto: VerifyOtpDto) {
    await this.otp.verifyCode(dto.phone, dto.code);
    if (this.platform.hasUserWithPhone(dto.phone)) {
      return { needsProfile: false, ...this.platform.loginByPhone(dto.phone) };
    }
    return { needsProfile: true };
  }

  @Post('complete-profile')
  completeProfile(@Body() dto: CompleteOtpProfileDto) {
    this.otp.consumeVerified(dto.phone);
    return { needsProfile: false, ...this.platform.registerByPhone(dto.phone, dto.name) };
  }
}
