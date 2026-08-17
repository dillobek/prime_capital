import { Injectable, Logger, OnModuleDestroy, OnModuleInit } from '@nestjs/common';
import { PlatformService } from '../platform/platform.service';

type TelegramMessage = {
  chat: { id: number };
  from?: { id: number; username?: string };
  text?: string;
  contact?: { phone_number: string; user_id?: number };
};
type TelegramUpdate = { update_id: number; message?: TelegramMessage };

@Injectable()
export class TelegramService implements OnModuleInit, OnModuleDestroy {
  private readonly logger = new Logger(TelegramService.name);
  private readonly token = process.env.TELEGRAM_BOT_TOKEN;
  private readonly webAppUrl = process.env.TELEGRAM_WEBAPP_URL ?? 'https://web.primecapital.uz';
  private readonly states = new Map<number, { step: 'name' | 'phone'; name?: string }>();
  private offset = 0;
  private stopped = false;

  constructor(private readonly platform: PlatformService) {}

  onModuleInit() {
    if (!this.token) return this.logger.warn('TELEGRAM_BOT_TOKEN yo‘q, bot ishga tushmadi');
    void this.poll();
  }

  onModuleDestroy() { this.stopped = true; }

  private async api(method: string, body?: Record<string, unknown>) {
    const response = await fetch(`https://api.telegram.org/bot${this.token}/${method}`, {
      method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify(body ?? {}),
    });
    if (!response.ok) throw new Error(`Telegram ${method}: ${response.status}`);
    return response.json() as Promise<{ ok: boolean; result: TelegramUpdate[] }>;
  }

  private send(chatId: number, text: string, reply_markup?: Record<string, unknown>) {
    return this.api('sendMessage', { chat_id: chatId, text, reply_markup });
  }

  private async poll() {
    this.logger.log('Telegram bot polling boshlandi');
    while (!this.stopped) {
      try {
        const data = await this.api('getUpdates', { offset: this.offset, timeout: 25, allowed_updates: ['message'] });
        for (const update of data.result ?? []) {
          this.offset = update.update_id + 1;
          if (update.message) await this.handle(update.message);
        }
      } catch (error) {
        this.logger.error(error instanceof Error ? error.message : error);
        await new Promise((resolve) => setTimeout(resolve, 3000));
      }
    }
  }

  private async handle(message: TelegramMessage) {
    const chatId = message.chat.id;
    const telegramId = String(message.from?.id ?? chatId);
    if (message.text?.startsWith('/start')) {
      if (this.platform.findTelegramUser(telegramId)) return this.openApp(chatId);
      const current = this.states.get(chatId);
      if (current?.step === 'phone') {
        await this.askPhone(chatId, `F.I.O qabul qilindi: ${current.name}. Endi telefon raqamingizni yuboring:`);
        return;
      }
      this.states.set(chatId, { step: 'name' });
      await this.send(chatId, 'Assalomu alaykum! Prime Capital WebApp’ga kirish uchun F.I.O’ingizni kiriting:');
      return;
    }
    const state = this.states.get(chatId);
    if (!state) {
      await this.send(chatId, 'Ro‘yxatdan o‘tishni boshlash uchun /start buyrug‘ini yuboring.');
      return;
    }
    if (state.step === 'name') {
      const name = message.text?.trim();
      if (!name || name.length < 3) return void await this.send(chatId, 'F.I.O’ni to‘liq kiriting:');
      this.states.set(chatId, { step: 'phone', name });
      await this.askPhone(chatId, 'Telefon raqamingizni yuboring:');
      return;
    }
    const phone = message.contact?.phone_number ?? message.text?.trim();
    if (!phone || !/^\+?[0-9 ()-]{7,20}$/.test(phone)) {
      await this.send(chatId, 'Telefon raqamni tugma orqali yoki +998901234567 formatida yuboring.');
      return;
    }
    this.platform.registerTelegramUser({ telegramId, name: state.name!, phone, username: message.from?.username });
    this.states.delete(chatId);
    await this.openApp(chatId, true);
  }

  private askPhone(chatId: number, text: string) {
    return this.send(chatId, text, {
      keyboard: [[{ text: '📱 Telefon raqamni yuborish', request_contact: true }]], resize_keyboard: true, one_time_keyboard: true,
    });
  }

  async broadcast(title: string, message: string) {
    const users = this.platform.listUsers().filter((user) => user.telegramId);
    const results = await Promise.allSettled(users.map((user) => this.send(Number(user.telegramId), `🔔 ${title}\n\n${message}`)));
    return { sent: results.filter((item) => item.status === 'fulfilled').length, total: users.length };
  }

  private async openApp(chatId: number, registered = false) {
    if (registered) await this.send(chatId, '✅ Ro‘yxatdan muvaffaqiyatli o‘tdingiz!', { remove_keyboard: true });
    return this.send(chatId, 'Prime Capital WebApp tayyor:', {
      inline_keyboard: [[{ text: '🚀 WebApp’ni ochish', web_app: { url: this.webAppUrl } }]],
    });
  }
}
