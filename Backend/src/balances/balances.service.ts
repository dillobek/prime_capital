import { Injectable, NotFoundException } from '@nestjs/common';
import type { Balance, InvestmentProduct } from '@prime/contracts';
import { PlatformService } from '../platform/platform.service';

/** Thin wrapper around PlatformService's real, per-user-derived balances — no more hardcoded demo numbers. */
@Injectable()
export class BalancesService {
  constructor(private readonly platform: PlatformService) {}

  findAll(): Balance[] { return this.platform.platformBalances(); }

  update(id: InvestmentProduct, input: Pick<Balance, 'amount' | 'monthlyChange'>) {
    const updated = this.platform.setBalanceOverride(id, input.amount, input.monthlyChange);
    if (!updated) throw new NotFoundException('Balans topilmadi');
    return updated;
  }
}
