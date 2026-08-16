import { Injectable, NotFoundException, UnauthorizedException, ConflictException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { compare, hash } from 'bcryptjs';
import { ContentDto, FinanceEntryDto, LoginDto, MoneyRequestDto, RegisterDto, SupportDto } from './platform.dto';

type RecordItem = Record<string, unknown> & { id: string; createdAt: string; status?: string };
const id = () => `${Date.now().toString(36)}${Math.random().toString(36).slice(2, 8)}`;
const now = () => new Date().toISOString();

@Injectable()
export class PlatformService {
  private users: RecordItem[] = [{ id: 'demo-user', name: 'Azizbek Salimov', email: 'azizbek@prime.uz', phone: '+998 90 123 45 67', passwordHash: '$2b$10$7fBoQz0P2MgeO/Qv8/O7Ze8vN/qdF5hrli5qbI/I7EAmhktGKQ4Yu', role: 'user', status: 'active', createdAt: now() }];
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

  constructor(private readonly jwt: JwtService) {}
  async register(dto: RegisterDto) {
    if (this.users.some((user) => user.email === dto.email)) throw new ConflictException('Email already exists');
    const user = { id: id(), ...dto, passwordHash: await hash(dto.password, 10), role: 'user', status: 'active', createdAt: now() };
    delete (user as Partial<typeof user>).password;
    this.users.push(user);
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
      return this.profile(existing.id);
    }
    const user: RecordItem = {
      id: id(),
      ...input,
      role: 'user',
      status: 'active',
      createdAt: now(),
    };
    this.users.push(user);
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
  updateProfile(userId: string, dto: Record<string, unknown>) { const user = this.users.find((item) => item.id === userId); if (!user) throw new NotFoundException(); Object.assign(user, dto, { id: user.id, passwordHash: user.passwordHash }); return this.profile(userId); }
  list(store: 'banners'|'videos'|'notifications'|'investments'|'withdrawals'|'support') { return this[store]; }
  createContent(store: 'banners'|'videos'|'notifications', dto: ContentDto) { const item = { id: id(), ...dto, status: dto.status ?? 'active', createdAt: now() }; this[store].unshift(item); return item; }
  updateContent(store: 'banners'|'videos'|'notifications', itemId: string, dto: Partial<ContentDto>) { const item = this[store].find((entry) => entry.id === itemId); if (!item) throw new NotFoundException(); Object.assign(item, dto); return item; }
  removeContent(store: 'banners'|'videos'|'notifications', itemId: string) { const index = this[store].findIndex((entry) => entry.id === itemId); if (index < 0) throw new NotFoundException(); return this[store].splice(index, 1)[0]; }
  createMoney(store: 'investments'|'withdrawals', dto: MoneyRequestDto) { const item = { id: id(), ...dto, status: 'pending', createdAt: now() }; this[store].unshift(item); return item; }
  updateStatus(store: 'investments'|'withdrawals'|'support', itemId: string, status: string) { const item = this[store].find((entry) => entry.id === itemId); if (!item) throw new NotFoundException(); item.status = status; return item; }
  listFinance(userId?: string) { return userId ? this.finance.filter((entry) => entry.userId === userId) : this.finance; }
  createFinance(dto: FinanceEntryDto) { const item = { id: id(), ...dto, date: dto.date ?? now(), createdAt: now() }; this.finance.unshift(item); return item; }
  removeFinance(itemId: string) { const index = this.finance.findIndex((entry) => entry.id === itemId); if (index < 0) throw new NotFoundException(); return this.finance.splice(index, 1)[0]; }
  createSupport(dto: SupportDto) { const item = { id: id(), ...dto, status: 'pending', createdAt: now() }; this.support.unshift(item); return item; }
}
