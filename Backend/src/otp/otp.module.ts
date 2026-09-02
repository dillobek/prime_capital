import { Module } from '@nestjs/common';
import { PlatformModule } from '../platform/platform.module';
import { EskizSmsService } from './eskiz-sms.service';
import { OtpController } from './otp.controller';
import { OtpService } from './otp.service';

@Module({
  imports: [PlatformModule],
  controllers: [OtpController],
  providers: [OtpService, EskizSmsService],
})
export class OtpModule {}
