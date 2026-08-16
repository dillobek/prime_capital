import { Module } from '@nestjs/common';
import { BalancesModule } from './balances/balances.module';
import { DashboardModule } from './dashboard/dashboard.module';
import { PropertiesModule } from './properties/properties.module';
import { PlatformModule } from './platform/platform.module';

@Module({ imports: [BalancesModule, PropertiesModule, DashboardModule, PlatformModule] })
export class AppModule {}
