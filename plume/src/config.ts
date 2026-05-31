import fs from "fs";
import path from "path";

export const ROOT = path.resolve(import.meta.dir, "..");

/** X 登录用的 auth_token cookie（从浏览器 Cookies 里取）。 */
export const AUTH_TOKEN = process.env.AUTH_TOKEN ?? "";

/** HTTP 服务端口。 */
export const PORT = Number(process.env.PORT ?? 8090);

/** 简单的访问令牌，aura 调用时带上 ?key= 或 Authorization: Bearer。留空则不校验。 */
export const API_KEY = process.env.PLUME_API_KEY ?? "";

/** 默认抓取条数。 */
export const DEFAULT_LIMIT = Number(process.env.PLUME_DEFAULT_LIMIT ?? 40);

export interface TrackedAccount {
  username: string;
  note?: string;
}

/** 读取被追踪账号列表。 */
export function loadAccounts(): TrackedAccount[] {
  const file = path.join(ROOT, "accounts.json");
  if (!fs.existsSync(file)) return [];
  return JSON.parse(fs.readFileSync(file, "utf-8"));
}

export function assertConfig() {
  if (!AUTH_TOKEN) {
    throw new Error("缺少 AUTH_TOKEN，请在 .env 中配置你的 X auth_token cookie");
  }
}
