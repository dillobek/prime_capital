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
