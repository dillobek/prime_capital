import { Transform } from 'class-transformer';
import { IsString, Matches, MinLength } from 'class-validator';
import { normalizeUzPhone } from '../common/phone.util';

const PHONE_PATTERN = /^\+998\d{9}$/;
const PHONE_MESSAGE = 'Telefon raqam +998 XX XXX XX XX formatida bo‘lishi kerak';

export class RequestOtpDto {
  @Transform(({ value }) => normalizeUzPhone(value))
  @IsString()
  @Matches(PHONE_PATTERN, { message: PHONE_MESSAGE })
  phone!: string;
}

export class VerifyOtpDto {
  @Transform(({ value }) => normalizeUzPhone(value))
  @IsString()
  @Matches(PHONE_PATTERN, { message: PHONE_MESSAGE })
  phone!: string;

  @IsString()
  @Matches(/^\d{6}$/, { message: 'Kod 6 ta raqamdan iborat bo‘lishi kerak' })
  code!: string;
}

export class CompleteOtpProfileDto {
  @Transform(({ value }) => normalizeUzPhone(value))
  @IsString()
  @Matches(PHONE_PATTERN, { message: PHONE_MESSAGE })
  phone!: string;

  @IsString()
  @MinLength(2)
  name!: string;
}
