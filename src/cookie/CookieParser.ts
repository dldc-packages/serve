import { HttpHeader, Key, Middleware, ZenResult } from '../core/mod';
import { Cookies } from './Cookie';

export const CookieParserKey = Key.createWithDefault<Cookies>('CookieParser', {});
export const CookieParserConsumer = CookieParserKey.Consumer;

export function CookieParser(): Middleware {
  return async (ctx, next): Promise<ZenResult> => {
    const request = ctx.request;
    const headers = request.headers;

    const cookiesStr = headers.get(HttpHeader.Cookie);
    const cookies = cookiesStr === null ? {} : Cookies.parse(cookiesStr);
    return next(ctx.with(CookieParserKey.Provider(cookies)));
  };
}
