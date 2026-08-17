import { Module } from '@nestjs/common';
import { BalancesModule } from '../balances/balances.module';
import { PlatformModule } from '../platform/platform.module';
import { PropertiesModule } from '../properties/properties.module';
import { DashboardController } from './dashboard.controller';

@Module({ imports: [BalancesModule, PropertiesModule, PlatformModule], controllers: [DashboardController] })
export class DashboardModule {}
