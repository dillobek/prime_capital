import { Controller, Get } from '@nestjs/common';
import { BalancesService } from '../balances/balances.service';
import { PlatformService } from '../platform/platform.service';
import { PropertiesService } from '../properties/properties.service';

@Controller('dashboard')
export class DashboardController {
  constructor(
    private readonly balances: BalancesService,
    private readonly properties: PropertiesService,
    private readonly platform: PlatformService,
  ) {}
  @Get() summary() {
    const listings = this.properties.findAll();
    // Real registered-user count and real per-product balances — no more hardcoded demo numbers.
    return { users: this.platform.listUsers().length, activeListings: listings.filter((item) => item.status === 'active').length, balances: this.balances.findAll(), recentProperties: listings };
  }
}
