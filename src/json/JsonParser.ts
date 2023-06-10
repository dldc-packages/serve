import { ContentType, MimeType } from '../content-type';
import { HttpHeader, HttpMethod, Middleware, ZenResult, createKey } from '../core';

export type GetJsonBody = () => Promise<any>;

export const GetJsonBodyKey = createKey<GetJsonBody>({ name: 'JsonParser' });
export const GetJsonBodyKeyConsumer = GetJsonBodyKey.Consumer;

export function JsonParser(): Middleware {
  return async (ctx, next): Promise<ZenResult> => {
    const headers = ctx.headers;

    if (ctx.method === HttpMethod.GET || ctx.method === HttpMethod.DELETE || ctx.method === HttpMethod.OPTIONS) {
      return next(ctx);
    }

    const contentType = headers.get(HttpHeader.ContentType);
    const request = ctx.request;

    if (!contentType || !request.body) {
      return next(ctx);
    }

    const parsedContentType = ContentType.parse(contentType);
    const isJsonContentType = parsedContentType.type === MimeType.fromExtension('json');
    if (!isJsonContentType) {
      return next(ctx);
    }

    return next(ctx.with(GetJsonBodyKey.Provider(() => request.json())));
  };
}
