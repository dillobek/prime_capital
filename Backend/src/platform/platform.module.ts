import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { PlatformController } from './platform.controller';
import { PlatformService } from './platform.service';

@Module({
  imports: [JwtModule.register({ secret: process.env.JWT_SECRET ?? 'prime-capital-local-secret', signOptions: { expiresIn: '7d' } })],
  controllers: [PlatformController],
  providers: [PlatformService],
  exports: [PlatformService],
})
export class PlatformModule {}
