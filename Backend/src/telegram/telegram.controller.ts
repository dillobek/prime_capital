import { Body, Controller, Post, UseGuards } from '@nestjs/common';
import { Type } from 'class-transformer';
import { ArrayMaxSize, IsArray, IsOptional, IsString, MinLength, ValidateNested } from 'class-validator';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { Roles } from '../auth/roles.decorator';
import { TelegramService } from './telegram.service';

class BroadcastButtonDto {
  @IsString() @MinLength(1) label!: string;
  @IsString() @MinLength(1) url!: string;
}
class BroadcastDto {
  @IsString() @MinLength(2) title!: string;
  @IsString() @MinLength(2) message!: string;
  // A broadcast carries at most one media item — either an image or a video, never both.
  @IsOptional() @IsString() imageUrl?: string;
  @IsOptional() @IsString() videoUrl?: string;
  @IsOptional() @IsArray() @ArrayMaxSize(3) @ValidateNested({ each: true }) @Type(() => BroadcastButtonDto) buttons?: BroadcastButtonDto[];
}

@Controller('telegram')
export class TelegramController {
  constructor(private readonly telegram: TelegramService) {}

  @UseGuards(JwtAuthGuard) @Roles('admin')
  @Post('broadcast') broadcast(@Body() dto: BroadcastDto) {
    return this.telegram.broadcast(dto.title, dto.message, { imageUrl: dto.imageUrl, videoUrl: dto.videoUrl, buttons: dto.buttons });
  }
}
