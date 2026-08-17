import { Body, Controller, Get, Param, Patch, UseGuards } from '@nestjs/common';
import type { InvestmentProduct } from '@prime/contracts';
import { IsNumber } from 'class-validator';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { Roles } from '../auth/roles.decorator';
import { BalancesService } from './balances.service';

class UpdateBalanceDto {
  @IsNumber() amount!: number;
  @IsNumber() monthlyChange!: number;
}

@Controller('balances')
export class BalancesController {
  constructor(private readonly balances: BalancesService) {}
  @Get() findAll() { return this.balances.findAll(); }

  @UseGuards(JwtAuthGuard) @Roles('admin')
  @Patch(':id') update(@Param('id') id: InvestmentProduct, @Body() body: UpdateBalanceDto) { return this.balances.update(id, body); }
}
