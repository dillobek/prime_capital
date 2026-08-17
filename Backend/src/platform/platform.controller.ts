import { Body, Controller, Delete, ForbiddenException, Get, Param, Patch, Post, Query, Req, UseGuards } from '@nestjs/common';
import { AuthedRequest, JwtAuthGuard } from '../auth/jwt-auth.guard';
import { Roles } from '../auth/roles.decorator';
import { ApplyPercentDto, ChangeCredentialsDto, ContentDto, FinanceEntryDto, LoginDto, MoneyRequestDto, RegisterDto, StatusDto, SupportDto, UserBalancesDto } from './platform.dto';
import { PlatformService } from './platform.service';

@Controller()
export class PlatformController {
  constructor(private readonly service: PlatformService) {}

  // --- Public: account creation / login ---
  @Post('auth/register') register(@Body() dto: RegisterDto) { return this.service.register(dto); }
  @Post('auth/login') login(@Body() dto: LoginDto) { return this.service.login(dto); }

  // --- Admin only: user management ---
  @UseGuards(JwtAuthGuard) @Roles('admin')
  @Get('users') users() { return this.service.listUsers(); }

  @UseGuards(JwtAuthGuard) @Roles('admin')
  @Patch('users/:id/balances') updateUserBalances(@Param('id') id: string, @Body() dto: UserBalancesDto) { return this.service.updateUserBalances(id, dto); }

  @UseGuards(JwtAuthGuard) @Roles('admin')
  @Post('users/apply-percent') applyPercent(@Body() dto: ApplyPercentDto) { return this.service.applyPercent(dto.product, dto.percent); }

  @UseGuards(JwtAuthGuard) @Roles('admin')
  @Post('settings/credentials') changeCredentials(@Body() dto: ChangeCredentialsDto) { return this.service.changeCredentials(dto); }

  // --- Authenticated: own profile (admin can view/edit any) ---
  @UseGuards(JwtAuthGuard)
  @Get('users/:id') profile(@Param('id') id: string, @Req() req: AuthedRequest) {
    if (req.user!.sub !== id && req.user!.role !== 'admin') throw new ForbiddenException('Faqat o‘z profilingizni ko‘ra olasiz');
    return this.service.profile(id);
  }

  @UseGuards(JwtAuthGuard)
  @Patch('users/:id') updateProfile(@Param('id') id: string, @Body() dto: Record<string, unknown>, @Req() req: AuthedRequest) {
    if (req.user!.sub !== id && req.user!.role !== 'admin') throw new ForbiddenException('Faqat o‘z profilingizni tahrirlay olasiz');
    return this.service.updateProfile(id, dto);
  }

  // --- Public read / admin write: marketing content ---
  @Get('banners') banners() { return this.service.list('banners'); }
  @UseGuards(JwtAuthGuard) @Roles('admin') @Post('banners') createBanner(@Body() dto: ContentDto) { return this.service.createContent('banners', dto); }
  @UseGuards(JwtAuthGuard) @Roles('admin') @Patch('banners/:id') updateBanner(@Param('id') id: string, @Body() dto: Partial<ContentDto>) { return this.service.updateContent('banners', id, dto); }
  @UseGuards(JwtAuthGuard) @Roles('admin') @Delete('banners/:id') removeBanner(@Param('id') id: string) { return this.service.removeContent('banners', id); }

  @Get('videos') videos() { return this.service.list('videos'); }
  @UseGuards(JwtAuthGuard) @Roles('admin') @Post('videos') createVideo(@Body() dto: ContentDto) { return this.service.createContent('videos', dto); }
  @UseGuards(JwtAuthGuard) @Roles('admin') @Patch('videos/:id') updateVideo(@Param('id') id: string, @Body() dto: Partial<ContentDto>) { return this.service.updateContent('videos', id, dto); }
  @UseGuards(JwtAuthGuard) @Roles('admin') @Delete('videos/:id') removeVideo(@Param('id') id: string) { return this.service.removeContent('videos', id); }

  @Get('notifications') notifications() { return this.service.list('notifications'); }
  @UseGuards(JwtAuthGuard) @Roles('admin') @Post('notifications') createNotification(@Body() dto: ContentDto) { return this.service.createContent('notifications', dto); }
  @UseGuards(JwtAuthGuard) @Roles('admin') @Patch('notifications/:id') updateNotification(@Param('id') id: string, @Body() dto: Partial<ContentDto>) { return this.service.updateContent('notifications', id, dto); }
  @UseGuards(JwtAuthGuard) @Roles('admin') @Delete('notifications/:id') removeNotification(@Param('id') id: string) { return this.service.removeContent('notifications', id); }

  // --- Money movement: user creates, admin approves/rejects ---
  @UseGuards(JwtAuthGuard) @Roles('admin')
  @Get('investments') investments() { return this.service.list('investments'); }

  @UseGuards(JwtAuthGuard)
  @Post('investments') invest(@Body() dto: MoneyRequestDto, @Req() req: AuthedRequest) { return this.service.createMoney('investments', { ...dto, userId: req.user!.sub }); }

  @UseGuards(JwtAuthGuard) @Roles('admin')
  @Patch('investments/:id/status') investmentStatus(@Param('id') id: string, @Body() dto: StatusDto) { return this.service.updateStatus('investments', id, dto.status); }

  @UseGuards(JwtAuthGuard) @Roles('admin')
  @Get('withdrawals') withdrawals() { return this.service.list('withdrawals'); }

  @UseGuards(JwtAuthGuard)
  @Post('withdrawals') withdraw(@Body() dto: MoneyRequestDto, @Req() req: AuthedRequest) { return this.service.createMoney('withdrawals', { ...dto, userId: req.user!.sub }); }

  @UseGuards(JwtAuthGuard) @Roles('admin')
  @Patch('withdrawals/:id/status') withdrawalStatus(@Param('id') id: string, @Body() dto: StatusDto) { return this.service.updateStatus('withdrawals', id, dto.status); }

  // --- Personal finance tracker: always scoped to the caller (admin included) ---
  @UseGuards(JwtAuthGuard)
  @Get('finance') finance(@Query('userId') userId: string | undefined, @Req() req: AuthedRequest) {
    const scope = req.user!.role === 'admin' && userId ? userId : req.user!.sub;
    return this.service.listFinance(scope);
  }

  @UseGuards(JwtAuthGuard)
  @Post('finance') addFinance(@Body() dto: FinanceEntryDto, @Req() req: AuthedRequest) { return this.service.createFinance({ ...dto, userId: req.user!.sub }); }

  @UseGuards(JwtAuthGuard)
  @Delete('finance/:id') removeFinance(@Param('id') id: string, @Req() req: AuthedRequest) {
    const owned = this.service.listFinance(req.user!.sub).some((entry) => entry.id === id);
    if (!owned && req.user!.role !== 'admin') throw new ForbiddenException('Faqat o‘z yozuvingizni o‘chira olasiz');
    return this.service.removeFinance(id);
  }

  // --- Support tickets: user opens, admin resolves ---
  @UseGuards(JwtAuthGuard) @Roles('admin')
  @Get('support') support() { return this.service.list('support'); }

  @UseGuards(JwtAuthGuard)
  @Post('support') createSupport(@Body() dto: SupportDto, @Req() req: AuthedRequest) { return this.service.createSupport({ ...dto, userId: req.user!.sub }); }

  @UseGuards(JwtAuthGuard) @Roles('admin')
  @Patch('support/:id/status') supportStatus(@Param('id') id: string, @Body() dto: StatusDto) { return this.service.updateStatus('support', id, dto.status); }
}
