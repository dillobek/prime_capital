import { Module } from '@nestjs/common';
import { BalancesModule } from '../balances/balances.module';
import { PropertiesModule } from '../properties/properties.module';
import { DashboardController } from './dashboard.controller';

@Module({ imports: [BalancesModule, PropertiesModule], controllers: [DashboardController] })
export class DashboardModule {}
