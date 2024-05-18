import { getCookies } from "@std/http";
import type { Middleware, ZenResult } from "../core/mod.ts";
import { createKey } from "../core/mod.ts";

export type Cookies = Record<string, string>;

export const CookieParserKey = createKey<Cookies>("CookieParser");
export const CookieParserConsumer = CookieParserKey.Consumer;

export function CookieParser(): Middleware {
  return (ctx, next): Promise<ZenResult> => {
    const request = ctx.request;
    const headers = request.headers;
    const cookies = getCookies(headers);
    return next(ctx.with(CookieParserKey.Provider(cookies)));
  };
}
