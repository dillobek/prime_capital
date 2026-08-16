import { Body, Controller, Delete, Get, Param, Patch, Post, Query } from '@nestjs/common';
import { ApplyPercentDto, ChangeCredentialsDto, ContentDto, FinanceEntryDto, LoginDto, MoneyRequestDto, RegisterDto, StatusDto, SupportDto, UserBalancesDto } from './platform.dto';
import { PlatformService } from './platform.service';

@Controller()
export class PlatformController {
  constructor(private readonly service: PlatformService) {}
  @Post('auth/register') register(@Body() dto: RegisterDto) { return this.service.register(dto); }
  @Post('auth/login') login(@Body() dto: LoginDto) { return this.service.login(dto); }
  @Get('users') users() { return this.service.listUsers(); }
  @Get('users/:id') profile(@Param('id') id: string) { return this.service.profile(id); }
  @Patch('users/:id') updateProfile(@Param('id') id: string, @Body() dto: Record<string, unknown>) { return this.service.updateProfile(id, dto); }
  @Patch('users/:id/balances') updateUserBalances(@Param('id') id: string, @Body() dto: UserBalancesDto) { return this.service.updateUserBalances(id, dto); }
  @Post('users/apply-percent') applyPercent(@Body() dto: ApplyPercentDto) { return this.service.applyPercent(dto.product, dto.percent); }
  @Post('settings/credentials') changeCredentials(@Body() dto: ChangeCredentialsDto) { return this.service.changeCredentials(dto); }

  @Get('banners') banners() { return this.service.list('banners'); }
  @Post('banners') createBanner(@Body() dto: ContentDto) { return this.service.createContent('banners', dto); }
  @Patch('banners/:id') updateBanner(@Param('id') id: string, @Body() dto: Partial<ContentDto>) { return this.service.updateContent('banners', id, dto); }
  @Delete('banners/:id') removeBanner(@Param('id') id: string) { return this.service.removeContent('banners', id); }
  @Get('videos') videos() { return this.service.list('videos'); }
  @Post('videos') createVideo(@Body() dto: ContentDto) { return this.service.createContent('videos', dto); }
  @Patch('videos/:id') updateVideo(@Param('id') id: string, @Body() dto: Partial<ContentDto>) { return this.service.updateContent('videos', id, dto); }
  @Delete('videos/:id') removeVideo(@Param('id') id: string) { return this.service.removeContent('videos', id); }
  @Get('notifications') notifications() { return this.service.list('notifications'); }
  @Post('notifications') createNotification(@Body() dto: ContentDto) { return this.service.createContent('notifications', dto); }
  @Patch('notifications/:id') updateNotification(@Param('id') id: string, @Body() dto: Partial<ContentDto>) { return this.service.updateContent('notifications', id, dto); }
  @Delete('notifications/:id') removeNotification(@Param('id') id: string) { return this.service.removeContent('notifications', id); }

  @Get('investments') investments() { return this.service.list('investments'); }
  @Post('investments') invest(@Body() dto: MoneyRequestDto) { return this.service.createMoney('investments', dto); }
  @Patch('investments/:id/status') investmentStatus(@Param('id') id: string, @Body() dto: StatusDto) { return this.service.updateStatus('investments', id, dto.status); }
  @Get('withdrawals') withdrawals() { return this.service.list('withdrawals'); }
  @Post('withdrawals') withdraw(@Body() dto: MoneyRequestDto) { return this.service.createMoney('withdrawals', dto); }
  @Patch('withdrawals/:id/status') withdrawalStatus(@Param('id') id: string, @Body() dto: StatusDto) { return this.service.updateStatus('withdrawals', id, dto.status); }
  @Get('finance') finance(@Query('userId') userId?: string) { return this.service.listFinance(userId); }
  @Post('finance') addFinance(@Body() dto: FinanceEntryDto) { return this.service.createFinance(dto); }
  @Delete('finance/:id') removeFinance(@Param('id') id: string) { return this.service.removeFinance(id); }
  @Get('support') support() { return this.service.list('support'); }
  @Post('support') createSupport(@Body() dto: SupportDto) { return this.service.createSupport(dto); }
  @Patch('support/:id/status') supportStatus(@Param('id') id: string, @Body() dto: StatusDto) { return this.service.updateStatus('support', id, dto.status); }
}
