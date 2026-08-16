import { Module } from '@nestjs/common';
import { BalancesModule } from './balances/balances.module';
import { DashboardModule } from './dashboard/dashboard.module';
import { PropertiesModule } from './properties/properties.module';
import { PlatformModule } from './platform/platform.module';
import { TelegramModule } from './telegram/telegram.module';

@Module({ imports: [BalancesModule, PropertiesModule, DashboardModule, PlatformModule, TelegramModule] })
export class AppModule {}
