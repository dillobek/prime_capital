import { Body, Controller, Post, UseGuards } from '@nestjs/common';
import { IsString, MinLength } from 'class-validator';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { Roles } from '../auth/roles.decorator';
import { TelegramService } from './telegram.service';

class BroadcastDto { @IsString() @MinLength(2) title!: string; @IsString() @MinLength(2) message!: string; }

@Controller('telegram')
export class TelegramController {
  constructor(private readonly telegram: TelegramService) {}

  @UseGuards(JwtAuthGuard) @Roles('admin')
  @Post('broadcast') broadcast(@Body() dto: BroadcastDto) { return this.telegram.broadcast(dto.title, dto.message); }
}
