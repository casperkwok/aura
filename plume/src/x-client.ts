import { TwitterOpenApi, type TwitterOpenApiClient } from "twitter-openapi-typescript";
import axios from "axios";

/**
 * 用一个 auth_token cookie 登录 X，拿到带鉴权的 client。
 * ct0 / bearer / transaction-id 由库自动处理，只需提供 auth_token。
 */
async function buildClient(authToken: string): Promise<TwitterOpenApiClient> {
  const resp = await axios.get("https://x.com/manifest.json", {
    headers: { cookie: `auth_token=${authToken}` },
  });

  const setCookie = (resp.headers["set-cookie"] as string[]) ?? [];
  const cookies = setCookie.reduce<Record<string, string>>((acc, c) => {
    const [name, value] = c.split(";")[0].split("=");
    acc[name] = value;
    return acc;
  }, {});

  const api = new TwitterOpenApi();
  return api.getClientFromCookies({ ...cookies, auth_token: authToken });
}

let cached: { token: string; client: TwitterOpenApiClient } | null = null;

/** 复用同一个 client，避免每次请求都重新登录。 */
export async function getClient(authToken: string): Promise<TwitterOpenApiClient> {
  if (cached && cached.token === authToken) return cached.client;
  const client = await buildClient(authToken);
  cached = { token: authToken, client };
  return client;
}

/** 鉴权失效时清掉缓存，下次重新登录。 */
export function resetClient() {
  cached = null;
}
