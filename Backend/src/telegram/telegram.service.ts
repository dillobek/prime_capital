import { Injectable, Logger, OnModuleDestroy, OnModuleInit } from '@nestjs/common';
import { PlatformService } from '../platform/platform.service';

type TelegramMessage = {
  chat: { id: number };
  from?: { id: number; username?: string };
  text?: string;
  contact?: { phone_number: string; user_id?: number };
};
type TelegramUpdate = { update_id: number; message?: TelegramMessage };
type PhotoSize = { file_id: string; width: number; height: number };

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

  private async api<T = unknown>(method: string, body?: Record<string, unknown>) {
    const response = await fetch(`https://api.telegram.org/bot${this.token}/${method}`, {
      method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify(body ?? {}),
    });
    if (!response.ok) throw new Error(`Telegram ${method}: ${response.status}`);
    return response.json() as Promise<{ ok: boolean; result: T }>;
  }

  private send(chatId: number, text: string, reply_markup?: Record<string, unknown>) {
    return this.api('sendMessage', { chat_id: chatId, text, reply_markup });
  }

  /** Sends a plain text message, or a photo/video with the text as its caption when media is attached — used by broadcast() so admins can send image/video/text notifications, each with up to 3 inline URL buttons. */
  private sendContent(chatId: number, text: string, media?: { imageUrl?: string; videoUrl?: string }, buttons?: { label: string; url: string }[]) {
    const reply_markup = buttons?.length ? { inline_keyboard: buttons.map((button) => [{ text: button.label, url: button.url }]) } : undefined;
    if (media?.imageUrl) return this.api('sendPhoto', { chat_id: chatId, photo: media.imageUrl, caption: text, reply_markup });
    if (media?.videoUrl) return this.api('sendVideo', { chat_id: chatId, video: media.videoUrl, caption: text, reply_markup });
    return this.send(chatId, text, reply_markup);
  }

  private async poll() {
    this.logger.log('Telegram bot polling boshlandi');
    while (!this.stopped) {
      try {
        const data = await this.api<TelegramUpdate[]>('getUpdates', { offset: this.offset, timeout: 25, allowed_updates: ['message'] });
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
      // Always check the DB first — an already-registered user just gets the WebApp button again, never re-registered.
      const existingUser = this.platform.findTelegramUser(telegramId);
      if (existingUser) {
        if (!existingUser.photoUrl) {
          void this.fetchProfilePhoto(Number(telegramId)).then((photoUrl) => { if (photoUrl) this.platform.updateTelegramPhoto(telegramId, photoUrl); });
        }
        return this.openApp(chatId);
      }
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
    // Fetch the profile photo after responding, so registration doesn't wait on it.
    void this.fetchProfilePhoto(Number(telegramId)).then((photoUrl) => { if (photoUrl) this.platform.updateTelegramPhoto(telegramId, photoUrl); });
  }

  private askPhone(chatId: number, text: string) {
    return this.send(chatId, text, {
      keyboard: [[{ text: '📱 Telefon raqamni yuborish', request_contact: true }]], resize_keyboard: true, one_time_keyboard: true,
    });
  }

  /** Downloads the user's largest Telegram profile photo and inlines it as a data: URL — never expose the bot token via a raw file URL to the client. */
  private async fetchProfilePhoto(userId: number): Promise<string | undefined> {
    try {
      const photos = await this.api<{ total_count: number; photos: PhotoSize[][] }>('getUserProfilePhotos', { user_id: userId, limit: 1 });
      const sizes = photos.result?.photos?.[0];
      if (!sizes?.length) return undefined;
      const fileId = sizes[sizes.length - 1].file_id;
      const fileInfo = await this.api<{ file_path?: string }>('getFile', { file_id: fileId });
      const filePath = fileInfo.result?.file_path;
      if (!filePath) return undefined;
      const response = await fetch(`https://api.telegram.org/file/bot${this.token}/${filePath}`);
      if (!response.ok) return undefined;
      const buffer = Buffer.from(await response.arrayBuffer());
      const contentType = response.headers.get('content-type') ?? 'image/jpeg';
      return `data:${contentType};base64,${buffer.toString('base64')}`;
    } catch (error) {
      this.logger.warn(`Profil rasmini olishda xatolik: ${error instanceof Error ? error.message : error}`);
      return undefined;
    }
  }

  async broadcast(title: string, message: string, options?: { imageUrl?: string; videoUrl?: string; buttons?: { label: string; url: string }[] }) {
    const users = this.platform.listUsers().filter((user) => user.telegramId);
    const text = `🔔 ${title}\n\n${message}`;
    const results = await Promise.allSettled(
      users.map((user) => this.sendContent(Number(user.telegramId), text, { imageUrl: options?.imageUrl, videoUrl: options?.videoUrl }, options?.buttons)),
    );
    return { sent: results.filter((item) => item.status === 'fulfilled').length, total: users.length };
  }

  private async openApp(chatId: number, registered = false) {
    if (registered) await this.send(chatId, '✅ Ro‘yxatdan muvaffaqiyatli o‘tdingiz!', { remove_keyboard: true });
    return this.send(chatId, 'Prime Capital WebApp tayyor:', {
      inline_keyboard: [[{ text: '🚀 WebApp’ni ochish', web_app: { url: this.webAppUrl } }]],
    });
  }
}
