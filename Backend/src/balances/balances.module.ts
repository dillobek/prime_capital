import { Module } from '@nestjs/common';
import { PlatformModule } from '../platform/platform.module';
import { BalancesController } from './balances.controller';
import { BalancesService } from './balances.service';

@Module({ imports: [PlatformModule], controllers: [BalancesController], providers: [BalancesService], exports: [BalancesService] })
export class BalancesModule {}
