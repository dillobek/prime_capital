import { IsEmail, IsIn, IsNumber, IsOptional, IsString, Min, MinLength } from 'class-validator';

export class RegisterDto {
  @IsString() @MinLength(2) name!: string;
  @IsEmail() email!: string;
  @IsString() @MinLength(6) password!: string;
  @IsOptional() @IsString() phone?: string;
}
export class LoginDto { @IsEmail() email!: string; @IsString() password!: string; }
export class ContentDto {
  @IsString() title!: string;
  @IsOptional() @IsString() description?: string;
  @IsOptional() @IsString() imageUrl?: string;
  @IsOptional() @IsString() url?: string;
  @IsOptional() @IsString() status?: string;
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
