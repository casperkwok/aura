import { get } from "lodash";
import { getClient } from "./x-client";
import { AUTH_TOKEN } from "./config";

/** 规范化后的推文结构 —— 下游（aura）直接消费这个形状。 */
export interface Tweet {
  id: string;
  url: string;
  author: string; // screenName
  authorName: string; // 显示名
  text: string;
  lang: string;
  createdAt: string; // ISO 8601
  isRetweet: boolean;
  isQuote: boolean;
  isReply: boolean;
  likeCount: number;
  retweetCount: number;
  replyCount: number;
  images: string[];
  videos: string[];
}

/** 把库返回的一条推文规范化；不是有效推文返回 null。 */
function normalize(raw: any): Tweet | null {
  const legacy = get(raw, "raw.result.legacy");
  const idStr = get(legacy, "idStr");
  if (!idStr) return null;

  const author = get(raw, "user.core.screenName", "");
  const text: string = get(legacy, "fullText", "");

  const mediaItems: any[] = get(legacy, "extendedEntities.media", []);
  const images = mediaItems
    .filter((m) => m.type === "photo")
    .map((m) => m.mediaUrlHttps)
    .filter(Boolean);
  const videos = mediaItems
    .filter((m) => m.type === "video" || m.type === "animated_gif")
    .map((m) => {
      const variants: any[] = get(m, "videoInfo.variants", []);
      const best = variants
        .filter((v) => v.contentType === "video/mp4")
        .sort((a, b) => (b.bitrate || 0) - (a.bitrate || 0))[0];
      return best?.url;
    })
    .filter(Boolean);

  const createdAtRaw = get(legacy, "createdAt");
  const createdAt = createdAtRaw ? new Date(createdAtRaw).toISOString() : "";

  return {
    id: idStr,
    url: `https://x.com/${author}/status/${idStr}`,
    author,
    authorName: get(raw, "user.core.name", ""),
    text,
    lang: get(legacy, "lang", ""),
    createdAt,
    isRetweet: text.startsWith("RT @"),
    isQuote: Boolean(get(legacy, "isQuoteStatus")),
    isReply: Boolean(get(legacy, "inReplyToStatusIdStr")),
    likeCount: get(legacy, "favoriteCount", 0),
    retweetCount: get(legacy, "retweetCount", 0),
    replyCount: get(legacy, "replyCount", 0),
    images,
    videos,
  };
}

/** 把 screenName 解析成数字 userId（X 接口大多按 id 查）。 */
export async function resolveUserId(username: string): Promise<string> {
  const client = await getClient(AUTH_TOKEN);
  const resp = await client.getUserApi().getUserByScreenName({ screenName: username });
  const id =
    get(resp, "data.user.restId") ?? get(resp, "data.user.legacy.idStr");
  if (!id) throw new Error(`找不到用户: ${username}`);
  return String(id);
}

export interface FetchOptions {
  /** 返回条数上限。 */
  limit?: number;
  /** 只保留这个时间点之后的推文（ISO 字符串或 Date）。 */
  since?: string | Date;
  /** 是否包含转推/回复，默认 false（只要原创+引用）。 */
  includeReplies?: boolean;
  includeRetweets?: boolean;
}

/** 抓取指定用户最近的推文，返回规范化结果（按时间倒序）。 */
export async function fetchUserTweets(
  username: string,
  opts: FetchOptions = {}
): Promise<Tweet[]> {
  const { limit = 40, since, includeReplies = false, includeRetweets = false } = opts;
  const client = await getClient(AUTH_TOKEN);
  const userId = await resolveUserId(username);

  const resp = await client.getTweetApi().getUserTweets({
    userId,
    count: Math.min(Math.max(limit, 1), 100),
  });

  const sinceTime = since ? new Date(since).getTime() : null;

  const tweets = resp.data.data
    .filter((e: any) => !e.promotedMetadata)
    .map(normalize)
    .filter((t): t is Tweet => t !== null)
    .filter((t) => (includeRetweets ? true : !t.isRetweet))
    .filter((t) => (includeReplies ? true : !t.isReply))
    .filter((t) => (sinceTime ? new Date(t.createdAt).getTime() > sinceTime : true))
    .sort((a, b) => b.id.localeCompare(a.id)); // 推文 ID 自带时间序

  return tweets.slice(0, limit);
}
