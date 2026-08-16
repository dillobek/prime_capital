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
COPY Website Website
RUN pnpm --filter @prime/website build
EXPOSE 3002
CMD ["pnpm","--filter","@prime/website","start"]
