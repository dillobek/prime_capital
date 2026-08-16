import { Module } from '@nestjs/common';
import { PlatformModule } from '../platform/platform.module';
import { TelegramService } from './telegram.service';

@Module({ imports: [PlatformModule], providers: [TelegramService] })
export class TelegramModule {}
