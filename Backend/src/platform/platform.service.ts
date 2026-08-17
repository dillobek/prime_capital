import { Injectable, NotFoundException, UnauthorizedException, ConflictException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { compare, hash, hashSync } from 'bcryptjs';
import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { dirname } from 'node:path';
import { ChangeCredentialsDto, ContentDto, FinanceEntryDto, LoginDto, MoneyRequestDto, RegisterDto, SupportDto, UserBalancesDto } from './platform.dto';

type RecordItem = Record<string, unknown> & { id: string; createdAt: string; status?: string };
type Product = 'prime-capital' | 'php-invest';
type ProductPercent = Record<Product, number>;
type ProductOverride = Record<Product, number | null>;
type ProductDate = Record<Product, string | null>;
const id = () => `${Date.now().toString(36)}${Math.random().toString(36).slice(2, 8)}`;
const now = () => new Date().toISOString();

@Injectable()
export class PlatformService {
  private readonly dataFile = process.env.DATA_FILE ?? '/app/data/platform.json';
  // No placeholder/demo records — only the real admin account exists until real users register or an admin adds real content.
  private users: RecordItem[] = [
    { id: 'admin', name: 'Administrator', email: 'admin@primecapital.uz', phone: '+998 90 000 00 00', passwordHash: '$2b$10$7fBoQz0P2MgeO/Qv8/O7Ze8vN/qdF5hrli5qbI/I7EAmhktGKQ4Yu', role: 'admin', phpInvest: 0, primeCapital: 0, status: 'active', createdAt: now() },
  ];
  private banners: RecordItem[] = [];
  private videos: RecordItem[] = [];
  private notifications: RecordItem[] = [];
  private investments: RecordItem[] = [];
  private withdrawals: RecordItem[] = [];
  private finance: RecordItem[] = [];
  private support: RecordItem[] = [];
  /** Last percent an admin applied to each product via applyPercent() — shown as the "monthly change" on real balance cards, never a fake number. */
  private lastPercent: ProductPercent = { 'prime-capital': 0, 'php-invest': 0 };
  /** Optional admin-set headline amount for a product's dashboard card. When null, the card shows the real sum of every user's balance. */
  private balanceOverrides: ProductOverride = { 'prime-capital': null, 'php-invest': null };
  /** Date the last percent was applied per product — so the balance card can show "12% — 17.08.2026" instead of an unlabeled number. */
  private lastAppliedAt: ProductDate = { 'prime-capital': null, 'php-invest': null };
  /** Full history of every percent change ever applied, oldest first — so growth over time can be reconstructed later, not just the last value. */
  private percentHistory: RecordItem[] = [];

  constructor(private readonly jwt: JwtService) { this.load(); this.ensureAdminCredentials(); }
  private load() {
    if (!existsSync(this.dataFile)) return;
    try {
      const data = JSON.parse(readFileSync(this.dataFile, 'utf8')) as Record<string, RecordItem[]> & { lastPercent?: ProductPercent; balanceOverrides?: ProductOverride; lastAppliedAt?: ProductDate };
      for (const key of ['users','banners','videos','notifications','investments','withdrawals','finance','support','percentHistory'] as const) if (Array.isArray(data[key])) this[key] = data[key];
      if (data.lastPercent) this.lastPercent = data.lastPercent;
      if (data.balanceOverrides) this.balanceOverrides = data.balanceOverrides;
      if (data.lastAppliedAt) this.lastAppliedAt = data.lastAppliedAt;
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
    writeFileSync(this.dataFile, JSON.stringify({ users:this.users,banners:this.banners,videos:this.videos,notifications:this.notifications,investments:this.investments,withdrawals:this.withdrawals,finance:this.finance,support:this.support,lastPercent:this.lastPercent,balanceOverrides:this.balanceOverrides,lastAppliedAt:this.lastAppliedAt,percentHistory:this.percentHistory }, null, 2));
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
  /** percent > 0 grows every user's balance for this product (e.g. 12 → 100$ becomes 112$); percent < 0 shrinks it (e.g. -12 → 100$ becomes 88$). Every application is appended to percentHistory, never overwritten, so growth over time can be reconstructed later. */
  applyPercent(product: Product, percent: number) {
    const field = product === 'prime-capital' ? 'primeCapital' : 'phpInvest';
    for (const user of this.users) user[field] = Math.round(Number(user[field] ?? 0) * (1 + percent / 100) * 100) / 100;
    this.lastPercent[product] = percent;
    const appliedAt = now();
    this.lastAppliedAt[product] = appliedAt;
    this.percentHistory.unshift({ id: id(), product, percent, direction: percent < 0 ? 'down' : 'up', affectedUsers: this.users.length, createdAt: appliedAt });
    this.save();
    return { product, percent, affectedUsers: this.users.length };
  }
  /** Full percent-change history, newest first — powers a growth-over-time view later instead of only ever showing the latest percent. */
  listPercentHistory() { return this.percentHistory; }
  /** Real headline balances: sum of every user's balance per product (or an admin override), with the last applied percent + date as the change figure. Backs both the public /balances endpoint and the admin dashboard — no more hardcoded demo numbers. */
  platformBalances(): { id: Product; name: string; amount: number; monthlyChange: number; updatedAt: string }[] {
    const sum = (field: 'primeCapital' | 'phpInvest') => this.users.reduce((total, user) => total + Number(user[field] ?? 0), 0);
    return [
      { id: 'prime-capital', name: 'Prime Capital', amount: this.balanceOverrides['prime-capital'] ?? sum('primeCapital'), monthlyChange: this.lastPercent['prime-capital'], updatedAt: this.lastAppliedAt['prime-capital'] ?? now() },
      { id: 'php-invest', name: 'PHP Invest', amount: this.balanceOverrides['php-invest'] ?? sum('phpInvest'), monthlyChange: this.lastPercent['php-invest'], updatedAt: this.lastAppliedAt['php-invest'] ?? now() },
    ];
  }
  setBalanceOverride(product: Product, amount: number, monthlyChange: number) {
    this.balanceOverrides[product] = amount;
    this.lastPercent[product] = monthlyChange;
    this.lastAppliedAt[product] = now();
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
  createMoney(store: 'investments'|'withdrawals', dto: MoneyRequestDto) { const item = { id: id(), ...dto, status: 'pending', createdAt: now() }; this[store].unshift(item); this.save(); return item; }
  updateStatus(store: 'investments'|'withdrawals'|'support', itemId: string, status: string) { const item = this[store].find((entry) => entry.id === itemId); if (!item) throw new NotFoundException(); item.status = status; this.save(); return item; }
  listFinance(userId?: string) { return userId ? this.finance.filter((entry) => entry.userId === userId) : this.finance; }
  createFinance(dto: FinanceEntryDto) { const item = { id: id(), ...dto, date: dto.date ?? now(), createdAt: now() }; this.finance.unshift(item); this.save(); return item; }
  removeFinance(itemId: string) { const index = this.finance.findIndex((entry) => entry.id === itemId); if (index < 0) throw new NotFoundException(); const removed = this.finance.splice(index, 1)[0]; this.save(); return removed; }
  createSupport(dto: SupportDto) { const item = { id: id(), ...dto, status: 'pending', createdAt: now() }; this.support.unshift(item); this.save(); return item; }
}
