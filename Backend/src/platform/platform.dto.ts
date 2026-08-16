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
  @IsString() userId!: string;
  @IsIn(['prime-capital', 'php-invest']) product!: string;
  @IsNumber() @Min(1) amount!: number;
  @IsOptional() @IsString() note?: string;
}
export class FinanceEntryDto {
  @IsString() userId!: string;
  @IsIn(['income', 'expense']) type!: 'income' | 'expense';
  @IsString() category!: string;
  @IsNumber() @Min(0) amount!: number;
  @IsOptional() @IsString() note?: string;
  @IsOptional() @IsString() date?: string;
}
export class SupportDto {
  @IsString() userId!: string;
  @IsString() subject!: string;
  @IsString() message!: string;
}
export class StatusDto { @IsIn(['pending', 'approved', 'rejected', 'resolved']) status!: string; }
