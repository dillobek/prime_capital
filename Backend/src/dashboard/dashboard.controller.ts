import { Controller, Get } from '@nestjs/common';
import { BalancesService } from '../balances/balances.service';
import { PropertiesService } from '../properties/properties.service';

@Controller('dashboard')
export class DashboardController {
  constructor(private readonly balances: BalancesService, private readonly properties: PropertiesService) {}
  @Get() summary() {
    const listings = this.properties.findAll();
    return { users: 12458, activeListings: listings.filter((item) => item.status === 'active').length, balances: this.balances.findAll(), recentProperties: listings };
  }
}
