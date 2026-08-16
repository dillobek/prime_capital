import { Module } from '@nestjs/common';
import { PlatformModule } from '../platform/platform.module';
import { TelegramService } from './telegram.service';
import { TelegramController } from './telegram.controller';

@Module({ imports: [PlatformModule], controllers: [TelegramController], providers: [TelegramService] })
export class TelegramModule {}
