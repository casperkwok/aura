# 🪶 plume

抓取指定 X（Twitter）用户推文的微服务，作为 [aura](..) 的数据来源之一（位于 `aura/plume`，由 aura 的 docker-compose 一起编排）。

通过浏览器登录态（`auth_token` cookie）调用 X 内部接口，输出规范化的推文 JSON，并以本地 HTTP API 暴露给下游消费。

## 技术栈

- Bun + TypeScript
- [twitter-openapi-typescript](https://github.com/fa0311/twitter-openapi-typescript)（处理 X 内部 GraphQL 鉴权）

## 快速开始

```bash
bun install
cp .env.example .env          # 填入 AUTH_TOKEN
bun start                     # 默认 :8090
```

### 获取 AUTH_TOKEN

浏览器登录 x.com → 开发者工具(F12) → Application → Cookies → `https://x.com` → 复制 `auth_token` 的值。

> ⚠️ 这等同于登录凭证，只放本地 `.env`，已被 `.gitignore` 忽略。失效后重新获取即可。

## API

| 路由 | 说明 |
|------|------|
| `GET /health` | 健康检查（无需鉴权） |
| `GET /accounts` | 列出 `accounts.json` 中被追踪的账号 |
| `GET /tweets?user=OpenAI&limit=20` | 抓取单个用户最近推文 |
| `GET /feed?limit=20` | 一次性抓取所有被追踪账号 |

`/tweets` 参数：

| 参数 | 默认 | 说明 |
|------|------|------|
| `user` | 必填 | 用户名（screenName） |
| `limit` | 40 | 返回条数（≤100） |
| `since` | — | ISO 时间，只返回此后的推文 |
| `replies` | false | 是否包含回复 |
| `retweets` | false | 是否包含转推 |

若设置了 `PLUME_API_KEY`，调用需带 `?key=xxx` 或 `Authorization: Bearer xxx`。

### 返回结构

```jsonc
{
  "user": "OpenAI",
  "count": 1,
  "tweets": [{
    "id": "2060451757818601808",
    "url": "https://x.com/OpenAI/status/2060451757818601808",
    "author": "OpenAI",
    "authorName": "OpenAI",
    "text": "……",
    "lang": "en",
    "createdAt": "2026-05-29T20:02:35.000Z",
    "isRetweet": false, "isQuote": false, "isReply": false,
    "likeCount": 5641, "retweetCount": 609, "replyCount": 0,
    "images": [], "videos": ["https://..."]
  }]
}
```

## 追踪账号

编辑 `accounts.json`：

```json
[{ "username": "OpenAI", "note": "OpenAI 官方" }]
```

只有 `username` 是必填，其余给自己看。

## 接入 aura

aura 的 `internal/scraper` 按 `Source.Type` 分发。新增一个 `twitter` 类型的 fetcher，
把 `Source.URL` 设为 `http://localhost:8090/tweets?user=<screenName>`，
请求后把每条 tweet 映射成 `model.Entry`（`Link=tweet.url`、`Title`/`Description=tweet.text`、
`PublishedAt=createdAt`、`Source="X @"+author`）即可。
