# Prime Capital

Prime Capital platformasi bitta NestJS API orqali admin panel, mijoz webapp va Flutter mobil ilovaga xizmat qiladi.

## Tuzilishi

- `Backend/` — NestJS REST API, port `4000`
- `Frontend/` — Next.js admin panel, port `3000`
- `Webapp/` — Next.js mijoz webapp, port `3001`
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

- `https://aipixel.uz` → `frontend:3000`
- `https://web.aipixel.uz` → `webapp:3001`
- `https://api.aipixel.uz` → `backend:4000`

Cloudflare Zero Trust tunnelidagi Public Hostnames bo‘limida yuqoridagi service URL’larni kiriting. Server `.env` faylida `CLOUDFLARE_TUNNEL_TOKEN` bo‘lishi kerak.

### GitHub → server auto-deploy

Repository Settings → Secrets and variables → Actions bo‘limida quyidagi secretlarni yarating:

- `SERVER_HOST` — server IP yoki SSH host
- `SERVER_USER` — SSH foydalanuvchi
- `SERVER_SSH_KEY` — private SSH key
- `SERVER_PORT` — odatda `22`
- `DEPLOY_PATH` — masalan `/opt/prime-capital`

Har bir `main` pushda workflow repo’ni serverga clone/update qiladi va `docker compose up -d --build` bajaradi. Birinchi server tayyorlash uchun `deploy/server-bootstrap.sh` ham mavjud.
