FROM oven/bun:1-alpine

WORKDIR /app

# 先装依赖，利用缓存
COPY package.json bun.lock ./
RUN bun install --frozen-lockfile

COPY . .

EXPOSE 8090

HEALTHCHECK --interval=30s --timeout=5s --start-period=10s --retries=3 \
  CMD wget -qO- http://localhost:8090/health || exit 1

CMD ["bun", "run", "src/server.ts"]
