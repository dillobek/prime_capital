FROM node:24-alpine
RUN corepack enable
WORKDIR /app
COPY package.json pnpm-lock.yaml pnpm-workspace.yaml tsconfig.base.json ./
COPY Backend/package.json Backend/package.json
COPY Frontend/package.json Frontend/package.json
COPY Webapp/package.json Webapp/package.json
COPY Website/package.json Website/package.json
COPY packages/contracts/package.json packages/contracts/package.json
RUN pnpm install --frozen-lockfile
COPY Frontend Frontend
COPY packages packages
ARG NEXT_PUBLIC_API_URL=https://api.aipixel.uz/api/v1
ENV NEXT_PUBLIC_API_URL=$NEXT_PUBLIC_API_URL
RUN pnpm --filter @prime/admin build
EXPOSE 3000
CMD ["pnpm", "--filter", "@prime/admin", "start"]
