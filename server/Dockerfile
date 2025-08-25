ARG PRISMA_SCHEMA_PATH=./src/infrastructure/database/prisma/schema.prisma

# ---------- deps ----------
FROM node:22-alpine AS deps
WORKDIR /app
RUN apk add --no-cache openssl
COPY package.json package-lock.json ./
COPY server/package.json ./server/package.json
RUN npm ci --workspaces --include-workspace-root=false
COPY server/src/infrastructure/database/prisma ./src/infrastructure/database/prisma
ARG PRISMA_SCHEMA_PATH
RUN npx prisma generate --schema $PRISMA_SCHEMA_PATH

# ---------- build ----------
FROM node:22-alpine AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY server/. .
RUN npm run build

# ---------- runner (prod) ----------
FROM node:22-alpine AS prod
WORKDIR /app
ENV NODE_ENV=production
ENV PORT=4044
ENV PRISMA_SCHEMA_PATH=./src/infrastructure/database/prisma/schema.prisma
RUN apk add --no-cache openssl postgresql-client
COPY package.json package-lock.json ./
COPY server/package.json ./server/package.json
RUN npm ci --omit=dev --workspaces --include-workspace-root=false
COPY --from=builder /app/dist ./dist
COPY server/src/infrastructure/database/prisma ./src/infrastructure/database/prisma
COPY server/docker-entrypoint.sh .
RUN chmod +x docker-entrypoint.sh
RUN apk add --no-cache bash
EXPOSE 4044
CMD ["./docker-entrypoint.sh"]

# ---------- dev (hot-reload) ----------
FROM node:22-alpine AS dev
WORKDIR /app
RUN apk add --no-cache openssl postgresql-client
ENV NODE_ENV=development
ARG PRISMA_SCHEMA_PATH
ENV PRISMA_SCHEMA_PATH=$PRISMA_SCHEMA_PATH

COPY package.json package-lock.json ./
COPY server/package.json ./server/package.json
RUN npm ci --workspaces --include-workspace-root

COPY server/src/infrastructure/database/prisma ./src/infrastructure/database/prisma
RUN npx prisma generate --schema $PRISMA_SCHEMA_PATH
RUN apk add --no-cache bash
COPY server/. .
RUN chmod +x docker-entrypoint.sh
EXPOSE 4044
ENTRYPOINT ["/bin/sh","-lc"]
CMD ["./docker-entrypoint.sh"]
