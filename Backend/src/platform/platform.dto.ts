import { Type } from 'class-transformer';
import { ArrayMaxSize, ArrayMinSize, IsArray, IsEmail, IsIn, IsNumber, IsOptional, IsString, Min, MinLength, ValidateNested } from 'class-validator';

export class RegisterDto {
  @IsString() @MinLength(2) name!: string;
  @IsEmail() email!: string;
  @IsString() @MinLength(6) password!: string;
  @IsOptional() @IsString() phone?: string;
}
export class LoginDto { @IsEmail() email!: string; @IsString() password!: string; }
export class TelegramAuthDto { @IsString() @MinLength(10) initData!: string; }
/** A single inline URL button — Telegram messages render these as inline keyboard buttons; the in-app notification modal renders them as link buttons. */
export class ButtonDto {
  @IsString() @MinLength(1) label!: string;
  @IsString() @MinLength(1) url!: string;
}
export class ContentDto {
  @IsString() title!: string;
  @IsOptional() @IsString() description?: string;
  // A notification carries at most one media item — either an image or a video, never both.
  @IsOptional() @IsString() imageUrl?: string;
  @IsOptional() @IsString() videoUrl?: string;
  @IsOptional() @IsString() url?: string;
  @IsOptional() @IsString() status?: string;
  @IsOptional() @IsArray() @ArrayMaxSize(3) @ValidateNested({ each: true }) @Type(() => ButtonDto) buttons?: ButtonDto[];
}
export class MoneyRequestDto {
  // userId is always taken from the JWT (see PlatformController) — never trust a client-supplied one.
  @IsOptional() @IsString() userId?: string;
  @IsIn(['prime-capital', 'php-invest']) product!: string;
  @IsNumber() @Min(1) amount!: number;
  @IsOptional() @IsString() note?: string;
}
export class FinanceEntryDto {
  @IsOptional() @IsString() userId?: string;
  @IsIn(['income', 'expense']) type!: 'income' | 'expense';
  @IsString() category!: string;
  @IsNumber() @Min(0) amount!: number;
  @IsOptional() @IsString() note?: string;
  @IsOptional() @IsString() date?: string;
}
export class SupportDto {
  @IsOptional() @IsString() userId?: string;
  @IsString() subject!: string;
  @IsString() message!: string;
}
export class StatusDto { @IsIn(['pending', 'approved', 'rejected', 'resolved']) status!: string; }
export class PromotionReportDto { @IsOptional() @IsNumber() @Min(0) phpInvestAmount?: number; @IsOptional() @IsNumber() @Min(0) primeCapitalAmount?: number; @IsOptional() @IsString() @MinLength(1) description?: string; @IsArray() @ArrayMinSize(1) @ArrayMaxSize(5) @IsString({ each: true }) images!: string[]; }
export class UserBalancesDto {
  @IsNumber() @Min(0) phpInvest!: number;
  @IsNumber() @Min(0) primeCapital!: number;
}
export class ApplyPercentDto {
  @IsIn(['prime-capital', 'php-invest']) product!: 'prime-capital' | 'php-invest';
  @IsNumber() percent!: number;
}
export class ChangeCredentialsDto {
  @IsEmail() email!: string;
  @IsString() @MinLength(6) currentPassword!: string;
  @IsString() @MinLength(6) newPassword!: string;
}
export class AboutDto {
  @IsOptional() @IsString() title?: string;
  @IsOptional() @IsString() body?: string;
}
