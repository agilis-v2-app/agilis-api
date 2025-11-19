# Etapa de build
FROM node:20-alpine AS builder
WORKDIR /app

# Copia só o que é necessário pra instalar deps
COPY package.json pnpm-lock.yaml* ./

# Instala pnpm e dependências (com cache otimizado)
RUN corepack enable && corepack prepare pnpm@latest --activate \
  && pnpm install --frozen-lockfile

COPY . .
RUN pnpm build

# Etapa de runner
FROM node:20-alpine AS runner
WORKDIR /app
ENV NODE_ENV=production

# Habilita pnpm pra instalar só deps de produção
RUN corepack enable && corepack prepare pnpm@latest --activate
COPY package.json pnpm-lock.yaml* ./
RUN pnpm install --prod --frozen-lockfile

# Copia apenas os artefatos necessários
COPY --from=builder /app/dist ./dist

USER node
EXPOSE 3000
CMD ["pnpm", "start"]
