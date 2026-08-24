import { Body, Controller, Delete, ForbiddenException, Get, Param, Patch, Post, Query, Req, UnauthorizedException, UseGuards } from '@nestjs/common';
import { AuthedRequest, JwtAuthGuard } from '../auth/jwt-auth.guard';
import { Roles } from '../auth/roles.decorator';
import { verifyTelegramInitData } from '../telegram/verify-init-data';
import { AboutDto, ApplyPercentDto, ChangeCredentialsDto, ContentDto, FinanceEntryDto, LoginDto, MoneyRequestDto, PromotionReportDto, RegisterDto, StatusDto, SupportDto, TelegramAuthDto, UserBalancesDto } from './platform.dto';
import { PlatformService } from './platform.service';

@Controller()
export class PlatformController {
  constructor(private readonly service: PlatformService) {}

  // --- Public: account creation / login ---
  @Post('auth/register') register(@Body() dto: RegisterDto) { return this.service.register(dto); }
  @Post('auth/login') login(@Body() dto: LoginDto) { return this.service.login(dto); }

  /** Telegram Mini App entry point: no password, initData signature is the proof of identity. */
  @Post('auth/telegram') telegramAuth(@Body() dto: TelegramAuthDto) {
    const botToken = process.env.TELEGRAM_BOT_TOKEN;
    if (!botToken) throw new UnauthorizedException('Telegram bot sozlanmagan');
    const telegramUser = verifyTelegramInitData(dto.initData, botToken);
    if (!telegramUser) throw new UnauthorizedException('Telegram ma’lumotlari yaroqsiz');
    return this.service.loginTelegram(String(telegramUser.id));
  }

  // --- Admin only: user management ---
  @UseGuards(JwtAuthGuard) @Roles('admin')
  @Get('users') users() { return this.service.listUsers(); }

  @UseGuards(JwtAuthGuard) @Roles('admin')
  @Patch('users/:id/balances') updateUserBalances(@Param('id') id: string, @Body() dto: UserBalancesDto) { return this.service.updateUserBalances(id, dto); }

  @UseGuards(JwtAuthGuard) @Roles('admin')
  @Post('users/apply-percent') applyPercent(@Body() dto: ApplyPercentDto) { return this.service.applyPercent(dto.product, dto.percent); }

  /** Full history of every percent change ever applied — so growth over time can be reconstructed later, not just the latest value. */
  @UseGuards(JwtAuthGuard) @Roles('admin')
  @Get('users/apply-percent/history') percentHistory() { return this.service.listPercentHistory(); }

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

  // --- Public: "Biz haqimizda" (About us) content — editable from the admin panel instead of hardcoded on the Website. ---
  @Get('about') about() { return this.service.getAbout(); }
  @UseGuards(JwtAuthGuard) @Roles('admin') @Patch('about') updateAbout(@Body() dto: AboutDto) { return this.service.updateAbout(dto); }

  // --- Public read / admin write: marketing content ---
  @Get('banners') banners() { return this.service.list('banners'); }
  @UseGuards(JwtAuthGuard) @Roles('admin') @Post('banners') createBanner(@Body() dto: ContentDto) { return this.service.createContent('banners', dto); }
  @UseGuards(JwtAuthGuard) @Roles('admin') @Patch('banners/:id') updateBanner(@Param('id') id: string, @Body() dto: Partial<ContentDto>) { return this.service.updateContent('banners', id, dto); }
  @UseGuards(JwtAuthGuard) @Roles('admin') @Delete('banners/:id') removeBanner(@Param('id') id: string) { return this.service.removeContent('banners', id); }
  /** Public — called once per card impression from the Website's Promotions page. */
  @Post('banners/:id/view') incrementBannerView(@Param('id') id: string) { return this.service.incrementContentView('banners', id); }

  @Get('videos') videos() { return this.service.list('videos'); }
  @UseGuards(JwtAuthGuard) @Roles('admin') @Post('videos') createVideo(@Body() dto: ContentDto) { return this.service.createContent('videos', dto); }
  @UseGuards(JwtAuthGuard) @Roles('admin') @Patch('videos/:id') updateVideo(@Param('id') id: string, @Body() dto: Partial<ContentDto>) { return this.service.updateContent('videos', id, dto); }
  @UseGuards(JwtAuthGuard) @Roles('admin') @Delete('videos/:id') removeVideo(@Param('id') id: string) { return this.service.removeContent('videos', id); }

  @UseGuards(JwtAuthGuard) @Get('notifications') notifications(@Req() req: AuthedRequest) { return this.service.listNotifications(req.user!.sub, req.user!.role === 'admin'); }
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

  @UseGuards(JwtAuthGuard) @Post('promotion-reports') createPromotionReport(@Body() dto: PromotionReportDto, @Req() req: AuthedRequest) { return this.service.createPromotionReport(req.user!.sub, dto); }
  @UseGuards(JwtAuthGuard) @Roles('admin') @Get('promotion-reports') promotionReports() { return this.service.listPromotionReports(); }
  @UseGuards(JwtAuthGuard) @Roles('admin') @Patch('promotion-reports/:id/status') promotionReportStatus(@Param('id') id: string, @Body() dto: StatusDto) { if (dto.status !== 'approved' && dto.status !== 'rejected') throw new ForbiddenException('Faqat tasdiqlash yoki rad etish mumkin'); return this.service.approvePromotionReport(id, dto.status); }
}
