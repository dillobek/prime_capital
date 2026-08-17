import { Injectable, NotFoundException, UnauthorizedException, ConflictException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { compare, hash, hashSync } from 'bcryptjs';
import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { dirname } from 'node:path';
import { ChangeCredentialsDto, ContentDto, FinanceEntryDto, LoginDto, MoneyRequestDto, RegisterDto, SupportDto, UserBalancesDto } from './platform.dto';

type RecordItem = Record<string, unknown> & { id: string; createdAt: string; status?: string };
const id = () => `${Date.now().toString(36)}${Math.random().toString(36).slice(2, 8)}`;
const now = () => new Date().toISOString();

@Injectable()
export class PlatformService {
  private readonly dataFile = process.env.DATA_FILE ?? '/app/data/platform.json';
  private users: RecordItem[] = [
    { id: 'admin', name: 'Administrator', email: 'admin@primecapital.uz', phone: '+998 90 000 00 00', passwordHash: '$2b$10$7fBoQz0P2MgeO/Qv8/O7Ze8vN/qdF5hrli5qbI/I7EAmhktGKQ4Yu', role: 'admin', phpInvest: 0, primeCapital: 0, status: 'active', createdAt: now() },
    { id: 'demo-user', name: 'Saydullo Xaydarov', email: 'saydullo@prime.uz', phone: '+998 90 123 45 67', passwordHash: '$2b$10$7fBoQz0P2MgeO/Qv8/O7Ze8vN/qdF5hrli5qbI/I7EAmhktGKQ4Yu', role: 'user', phpInvest: 400, primeCapital: 200, status: 'active', createdAt: now() },
  ];
  private banners: RecordItem[] = [{ id: 'banner-1', title: 'Prime joylarda kelajagingizni yarating', description: 'Ishonchli investitsiya, barqaror daromad.', imageUrl: '/property-banner.jpg', url: '/apartments', status: 'active', createdAt: now() }];
  private videos: RecordItem[] = [{ id: 'video-1', title: 'Investitsiyani qanday boshlash kerak?', description: 'Boshlang‘ich video dars', url: 'https://example.com/video', status: 'active', createdAt: now() }];
  private notifications: RecordItem[] = [{ id: 'notice-1', title: 'Avgust oyi natijalari', description: 'Prime Capital balansi 20% o‘sdi.', status: 'active', createdAt: now() }];
  private investments: RecordItem[] = [];
  private withdrawals: RecordItem[] = [];
  private finance: RecordItem[] = [
    { id: 'f1', userId: 'demo-user', type: 'income', category: 'Maosh', amount: 15000000, note: 'Avgust', date: now(), createdAt: now() },
    { id: 'f2', userId: 'demo-user', type: 'expense', category: 'Uy', amount: 3200000, note: 'Ijara', date: now(), createdAt: now() },
  ];
  private support: RecordItem[] = [];
  /** Last percent an admin applied to each product via applyPercent() — shown as the "monthly change" on real balance cards, never a fake number. */
  private lastPercent: Record<'prime-capital' | 'php-invest', number> = { 'prime-capital': 0, 'php-invest': 0 };
  /** Optional admin-set headline amount for a product's dashboard card. When null, the card shows the real sum of every user's balance. */
  private balanceOverrides: Record<'prime-capital' | 'php-invest', number | null> = { 'prime-capital': null, 'php-invest': null };

  constructor(private readonly jwt: JwtService) { this.load(); this.ensureAdminCredentials(); }
  private load() {
    if (!existsSync(this.dataFile)) return;
    try {
      const data = JSON.parse(readFileSync(this.dataFile, 'utf8')) as Record<string, RecordItem[]> & { lastPercent?: typeof this.lastPercent; balanceOverrides?: typeof this.balanceOverrides };
      for (const key of ['users','banners','videos','notifications','investments','withdrawals','finance','support'] as const) if (Array.isArray(data[key])) this[key] = data[key];
      if (data.lastPercent) this.lastPercent = data.lastPercent;
      if (data.balanceOverrides) this.balanceOverrides = data.balanceOverrides;
    } catch { /* Keep safe seed data when storage is invalid. */ }
  }
  /** Keeps the admin login in sync with ADMIN_EMAIL/ADMIN_PASSWORD from .env on every boot, so rotating the password is just an env change + restart. */
  private ensureAdminCredentials() {
    const email = process.env.ADMIN_EMAIL;
    const password = process.env.ADMIN_PASSWORD;
    if (!email && !password) return;
    let admin = this.users.find((item) => item.role === 'admin');
    if (!admin) {
      admin = { id: 'admin', name: 'Administrator', email: email ?? 'admin@primecapital.uz', phone: '', passwordHash: '', role: 'admin', phpInvest: 0, primeCapital: 0, status: 'active', createdAt: now() };
      this.users.push(admin);
    }
    if (email) admin.email = email;
    if (password) admin.passwordHash = hashSync(password, 10);
    this.save();
  }
  private save() {
    mkdirSync(dirname(this.dataFile), { recursive: true });
    writeFileSync(this.dataFile, JSON.stringify({ users:this.users,banners:this.banners,videos:this.videos,notifications:this.notifications,investments:this.investments,withdrawals:this.withdrawals,finance:this.finance,support:this.support,lastPercent:this.lastPercent,balanceOverrides:this.balanceOverrides }, null, 2));
  }
  async register(dto: RegisterDto) {
    if (this.users.some((user) => user.email === dto.email)) throw new ConflictException('Email already exists');
    const user = { id: id(), ...dto, passwordHash: await hash(dto.password, 10), role: 'user', phpInvest: 0, primeCapital: 0, status: 'active', createdAt: now() };
    delete (user as Partial<typeof user>).password;
    this.users.push(user);
    this.save();
    return this.session(user);
  }
  async login(dto: LoginDto) {
    const user = this.users.find((item) => item.email === dto.email);
    if (!user || !await compare(dto.password, String(user.passwordHash))) throw new UnauthorizedException('Email yoki parol noto‘g‘ri');
    return this.session(user);
  }
  registerTelegramUser(input: { telegramId: string; name: string; phone: string; username?: string }) {
    const existing = this.users.find((item) => item.telegramId === input.telegramId);
    if (existing) {
      Object.assign(existing, input, { status: 'active' });
      this.save();
      return this.profile(existing.id);
    }
    const user: RecordItem = {
      id: id(),
      ...input,
      role: 'user',
      status: 'active',
      phpInvest: 0,
      primeCapital: 0,
      createdAt: now(),
    };
    this.users.push(user);
    this.save();
    return this.profile(user.id);
  }
  findTelegramUser(telegramId: string) {
    const user = this.users.find((item) => item.telegramId === telegramId);
    return user ? this.profile(user.id) : undefined;
  }
  /** Used by POST /auth/telegram once the Mini App's initData signature is verified — no password needed for bot-registered users. */
  loginTelegram(telegramId: string) {
    const user = this.users.find((item) => item.telegramId === telegramId);
    if (!user) throw new UnauthorizedException('Avval Telegram bot orqali ro‘yxatdan o‘ting (/start)');
    return this.session(user);
  }
  updateTelegramPhoto(telegramId: string, photoUrl: string) {
    const user = this.users.find((item) => item.telegramId === telegramId);
    if (!user) return;
    user.photoUrl = photoUrl;
    this.save();
  }
  private session(user: RecordItem) {
    const { passwordHash: _, ...safeUser } = user;
    return { accessToken: this.jwt.sign({ sub: user.id, role: user.role, email: user.email }), user: safeUser };
  }
  listUsers() { return this.users.map(({ passwordHash: _, ...user }) => user); }
  profile(userId: string) { const user = this.users.find((item) => item.id === userId); if (!user) throw new NotFoundException(); const { passwordHash: _, ...safe } = user; return safe; }
  updateProfile(userId: string, dto: Record<string, unknown>) { const user = this.users.find((item) => item.id === userId); if (!user) throw new NotFoundException(); Object.assign(user, dto, { id: user.id, passwordHash: user.passwordHash }); this.save(); return this.profile(userId); }
  updateUserBalances(userId: string, dto: UserBalancesDto) { const user = this.users.find((item) => item.id === userId); if (!user) throw new NotFoundException(); Object.assign(user, dto); this.save(); return this.profile(userId); }
  applyPercent(product: 'prime-capital'|'php-invest', percent: number) {
    const field = product === 'prime-capital' ? 'primeCapital' : 'phpInvest';
    for (const user of this.users) user[field] = Math.round(Number(user[field] ?? 0) * (1 + percent / 100) * 100) / 100;
    this.lastPercent[product] = percent;
    this.save();
    return { product, percent, affectedUsers: this.users.length };
  }
  /** Real headline balances: sum of every user's balance per product (or an admin override), with the last applied percent as the change figure. Backs both the public /balances endpoint and the admin dashboard — no more hardcoded demo numbers. */
  platformBalances() {
    const sum = (field: 'primeCapital' | 'phpInvest') => this.users.reduce((total, user) => total + Number(user[field] ?? 0), 0);
    return [
      { id: 'prime-capital', name: 'Prime Capital', amount: this.balanceOverrides['prime-capital'] ?? sum('primeCapital'), monthlyChange: this.lastPercent['prime-capital'], updatedAt: now() },
      { id: 'php-invest', name: 'PHP Invest', amount: this.balanceOverrides['php-invest'] ?? sum('phpInvest'), monthlyChange: this.lastPercent['php-invest'], updatedAt: now() },
    ];
  }
  setBalanceOverride(product: 'prime-capital' | 'php-invest', amount: number, monthlyChange: number) {
    this.balanceOverrides[product] = amount;
    this.lastPercent[product] = monthlyChange;
    this.save();
    return this.platformBalances().find((item) => item.id === product);
  }
  async changeCredentials(dto: ChangeCredentialsDto) {
    const admin = this.users.find((item) => item.role === 'admin');
    if (!admin || !await compare(dto.currentPassword, String(admin.passwordHash))) throw new UnauthorizedException('Joriy parol noto‘g‘ri');
    admin.email = dto.email;
    admin.passwordHash = await hash(dto.newPassword, 10);
    this.save();
    return { success: true, email: admin.email };
  }
  list(store: 'banners'|'videos'|'notifications'|'investments'|'withdrawals'|'support') { return this[store]; }
  createContent(store: 'banners'|'videos'|'notifications', dto: ContentDto) { const item = { id: id(), ...dto, status: dto.status ?? 'active', createdAt: now() }; this[store].unshift(item); this.save(); return item; }
  updateContent(store: 'banners'|'videos'|'notifications', itemId: string, dto: Partial<ContentDto>) { const item = this[store].find((entry) => entry.id === itemId); if (!item) throw new NotFoundException(); Object.assign(item, dto); return item; }
  removeContent(store: 'banners'|'videos'|'notifications', itemId: string) { const index = this[store].findIndex((entry) => entry.id === itemId); if (index < 0) throw new NotFoundException(); const removed=this[store].splice(index, 1)[0]; this.save(); return removed; }
  createMoney(store: 'investments'|'withdrawals', dto: MoneyRequestDto) { const item = { id: id(), ...dto, status: 'pending', createdAt: now() }; this[store].unshift(item); return item; }
  updateStatus(store: 'investments'|'withdrawals'|'support', itemId: string, status: string) { const item = this[store].find((entry) => entry.id === itemId); if (!item) throw new NotFoundException(); item.status = status; return item; }
  listFinance(userId?: string) { return userId ? this.finance.filter((entry) => entry.userId === userId) : this.finance; }
  createFinance(dto: FinanceEntryDto) { const item = { id: id(), ...dto, date: dto.date ?? now(), createdAt: now() }; this.finance.unshift(item); return item; }
  removeFinance(itemId: string) { const index = this.finance.findIndex((entry) => entry.id === itemId); if (index < 0) throw new NotFoundException(); return this.finance.splice(index, 1)[0]; }
  createSupport(dto: SupportDto) { const item = { id: id(), ...dto, status: 'pending', createdAt: now() }; this.support.unshift(item); return item; }
}
