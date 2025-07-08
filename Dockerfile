# --- 빌드 단계 ---
FROM node:20-alpine AS builder

WORKDIR /app
COPY . .

RUN npm install -g @nestjs/cli \
    && npm install \
    && npx prisma generate \
    && npm run build

# --- 런타임 단계 ---
FROM node:20-alpine

WORKDIR /app

COPY --from=builder /app/dist ./dist
COPY --from=builder /app/prisma ./prisma
COPY --from=builder /app/package*.json ./

# ⚠ Prisma Client 복사
COPY --from=builder /app/node_modules/.prisma /app/node_modules/.prisma
COPY --from=builder /app/node_modules/@prisma /app/node_modules/@prisma

RUN npm install --omit=dev

CMD ["sh", "-c", "npx prisma migrate deploy && node dist/main.js"]
