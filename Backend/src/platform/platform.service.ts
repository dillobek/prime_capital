import { Injectable, NotFoundException, UnauthorizedException, ConflictException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { compare, hash } from 'bcryptjs';
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

  constructor(private readonly jwt: JwtService) { this.load(); }
  private load() {
    if (!existsSync(this.dataFile)) return;
    try {
      const data = JSON.parse(readFileSync(this.dataFile, 'utf8')) as Record<string, RecordItem[]>;
      for (const key of ['users','banners','videos','notifications','investments','withdrawals','finance','support'] as const) if (Array.isArray(data[key])) this[key] = data[key];
    } catch { /* Keep safe seed data when storage is invalid. */ }
  }
  private save() {
    mkdirSync(dirname(this.dataFile), { recursive: true });
    writeFileSync(this.dataFile, JSON.stringify({ users:this.users,banners:this.banners,videos:this.videos,notifications:this.notifications,investments:this.investments,withdrawals:this.withdrawals,finance:this.finance,support:this.support }, null, 2));
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
    this.save();
    return { product, percent, affectedUsers: this.users.length };
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
