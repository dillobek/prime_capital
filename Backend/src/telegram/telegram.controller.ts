import { Body, Controller, Post } from '@nestjs/common';
import { IsString, MinLength } from 'class-validator';
import { TelegramService } from './telegram.service';

class BroadcastDto { @IsString() @MinLength(2) title!: string; @IsString() @MinLength(2) message!: string; }

@Controller('telegram')
export class TelegramController {
  constructor(private readonly telegram: TelegramService) {}
  @Post('broadcast') broadcast(@Body() dto: BroadcastDto) { return this.telegram.broadcast(dto.title, dto.message); }
}
