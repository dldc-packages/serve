import { ContentType, MimeType } from "../content-type/mod.ts";
import type { Middleware, TKey, ZenResult } from "../core/mod.ts";
import { createKey, HttpHeader, HttpMethod } from "../core/mod.ts";

export type GetJsonBody = () => Promise<any>;

export const GetJsonBodyKey: TKey<GetJsonBody> = createKey<GetJsonBody>(
  "JsonParser",
);
export const GetJsonBodyKeyConsumer = GetJsonBodyKey.Consumer;

export function JsonParser(): Middleware {
  return (ctx, next): Promise<ZenResult> => {
    const headers = ctx.headers;

    if (
      ctx.method === HttpMethod.GET || ctx.method === HttpMethod.DELETE ||
      ctx.method === HttpMethod.OPTIONS
    ) {
      return next(ctx);
    }

    const contentType = headers.get(HttpHeader.ContentType);
    const request = ctx.request;

    if (!contentType || !request.body) {
      return next(ctx);
    }

    const parsedContentType = ContentType.parse(contentType);
    const isJsonContentType =
      parsedContentType.type === MimeType.fromExtension("json");
    if (!isJsonContentType) {
      return next(ctx);
    }

    return next(ctx.with(GetJsonBodyKey.Provider(() => request.json())));
  };
}
