import { Injectable, NotFoundException } from '@nestjs/common';
import type { Balance, InvestmentProduct } from '@prime/contracts';

@Injectable()
export class BalancesService {
  private readonly balances: Balance[] = [
    { id: 'prime-capital', name: 'Prime Capital', amount: 2345678900, monthlyChange: 6.7, updatedAt: new Date().toISOString() },
    { id: 'php-invest', name: 'PHP Invest', amount: 1234567800, monthlyChange: -3.2, updatedAt: new Date().toISOString() },
  ];

  findAll() { return this.balances; }

  update(id: InvestmentProduct, input: Pick<Balance, 'amount' | 'monthlyChange'>) {
    const balance = this.balances.find((item) => item.id === id);
    if (!balance) throw new NotFoundException('Balans topilmadi');
    Object.assign(balance, input, { updatedAt: new Date().toISOString() });
    return balance;
  }
}
