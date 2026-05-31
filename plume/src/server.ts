import { fetchUserTweets } from "./tweets";
import { resetClient } from "./x-client";
import {
  PORT,
  API_KEY,
  DEFAULT_LIMIT,
  loadAccounts,
  assertConfig,
} from "./config";

assertConfig();

function json(data: unknown, status = 200) {
  return new Response(JSON.stringify(data, null, 2), {
    status,
    headers: { "content-type": "application/json; charset=utf-8" },
  });
}

function authorized(req: Request, url: URL): boolean {
  if (!API_KEY) return true;
  const fromQuery = url.searchParams.get("key");
  const fromHeader = req.headers.get("authorization")?.replace(/^Bearer\s+/i, "");
  return fromQuery === API_KEY || fromHeader === API_KEY;
}

const server = Bun.serve({
  port: PORT,
  async fetch(req) {
    const url = new URL(req.url);

    // 健康检查，不需要鉴权
    if (url.pathname === "/health") {
      return json({ ok: true, service: "plume", time: new Date().toISOString() });
    }

    if (!authorized(req, url)) {
      return json({ error: "unauthorized" }, 401);
    }

    // 列出被追踪的账号
    if (url.pathname === "/accounts") {
      return json(loadAccounts());
    }

    // 抓取单个用户推文：/tweets?user=OpenAI&limit=20&since=2026-05-01&replies=false&retweets=false
    if (url.pathname === "/tweets") {
      const user = url.searchParams.get("user");
      if (!user) return json({ error: "缺少 user 参数" }, 400);

      const limit = Number(url.searchParams.get("limit") ?? DEFAULT_LIMIT);
      const since = url.searchParams.get("since") ?? undefined;
      const includeReplies = url.searchParams.get("replies") === "true";
      const includeRetweets = url.searchParams.get("retweets") === "true";

      try {
        const tweets = await fetchUserTweets(user, {
          limit,
          since,
          includeReplies,
          includeRetweets,
        });
        return json({ user, count: tweets.length, tweets });
      } catch (err: any) {
        // 鉴权类错误清缓存，方便换 token 后恢复
        if (String(err?.message).match(/401|403|auth/i)) resetClient();
        return json({ error: String(err?.message ?? err) }, 502);
      }
    }

    // 一次性抓取所有被追踪账号：/feed?limit=20
    if (url.pathname === "/feed") {
      const limit = Number(url.searchParams.get("limit") ?? DEFAULT_LIMIT);
      const since = url.searchParams.get("since") ?? undefined;
      const accounts = loadAccounts();
      const results: Record<string, unknown> = {};
      for (const acc of accounts) {
        try {
          results[acc.username] = await fetchUserTweets(acc.username, { limit, since });
        } catch (err: any) {
          results[acc.username] = { error: String(err?.message ?? err) };
        }
      }
      return json(results);
    }

    return json({ error: "not found", routes: ["/health", "/accounts", "/tweets?user=", "/feed"] }, 404);
  },
});

console.log(`🪶 plume 已启动: http://localhost:${server.port}`);
console.log(`   GET /tweets?user=OpenAI&limit=20`);
console.log(`   GET /feed   （所有被追踪账号）`);
