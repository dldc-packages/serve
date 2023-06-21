import { ContentType, MimeType } from '../content-type/mod';
import { HttpHeader, HttpMethod, Key, Middleware, ZenResult } from '../core/mod';

export type GetJsonBody = () => Promise<any>;

export const GetJsonBodyKey = Key.create<GetJsonBody>('JsonParser');
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
