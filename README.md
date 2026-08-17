# Prime Capital

Prime Capital platformasi bitta NestJS API orqali admin panel, mijoz webapp va Flutter mobil ilovaga xizmat qiladi.

## Tuzilishi

- `Backend/` — NestJS REST API, port `4000`
- `Frontend/` — Next.js admin panel, port `3000`
- `Webapp/` — Next.js mijoz webapp, port `3001`
- `Website/` — Next.js rasmiy sayt (landing), port `3002`
- `packages/contracts/` — umumiy TypeScript API turlari

## Local run

```bash
pnpm install
pnpm dev
```

## Production build

```bash
pnpm install --frozen-lockfile
pnpm build
```

## Docker deploy

`.env.example` faylidan `.env` yarating va `docker compose up -d --build` buyrug‘ini ishga tushiring. GitHub Actions har bir `main` pushda barcha ilovalarni build qilib tekshiradi.

### Production domenlar

- `https://primecapital.uz` (+ `www`) → `website:3002`
- `https://web.primecapital.uz` → `webapp:3001`
- `https://api.primecapital.uz` → `backend:4000`
- `https://ser.primecapital.uz` → `frontend:3000` (admin panel)

DNS `A` yozuvlari server IP manziliga yo‘naltiriladi. Docker ichidagi Caddy reverse proxy domenlarni tegishli servislarga yuboradi va TLS sertifikatlarini avtomatik oladi. Server firewallida `80/tcp`, `443/tcp` va `443/udp` portlari ochiq bo‘lishi kerak.

### GitHub → server auto-deploy

Repository Settings → Secrets and variables → Actions bo‘limida quyidagi secretlarni yarating:

- `SERVER_HOST` — server IP yoki SSH host
- `SERVER_USER` — SSH foydalanuvchi
- `SERVER_SSH_KEY` — private SSH key
- `SERVER_PORT` — odatda `22`
- `DEPLOY_PATH` — masalan `/opt/prime-capital`

Har bir `main` pushda workflow repo’ni serverga clone/update qiladi va `docker compose up -d --build` bajaradi. Birinchi server tayyorlash uchun `deploy/server-bootstrap.sh` ham mavjud.

## Autentifikatsiya va ruxsatlar

Barcha admin amallari (foydalanuvchilar, balanslar, banner/video/bildirishnoma boshqaruvi, investitsiya/pul yechish tasdiqlash, Telegram broadcast, sozlamalar) Backend’da JWT (`role: admin`) bilan himoyalangan (`Backend/src/auth`). Oddiy foydalanuvchi amallari (profil, investitsiya/pul yechish so‘rovi, finance tracker, support) ham JWT talab qiladi va `userId` har doim tokendan olinadi — client tomondan yuborilgan `userId`ga ishonilmaydi.

Admin login/parolini `.env` dagi `ADMIN_EMAIL` va `ADMIN_PASSWORD` orqali boshqaring — backend har ishga tushishda admin foydalanuvchini shu qiymatlarga moslab yangilaydi (parolni almashtirish uchun shu ikki qiymatni o‘zgartirib, `docker compose up -d --build backend` bilan qayta ishga tushiring).
