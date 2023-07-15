import { getCookies } from 'undici';
import type { Middleware, ZenResult } from '../core/mod';
import { Key } from '../core/mod';

export type Cookies = Record<string, string>;

export const CookieParserKey = Key.createWithDefault<Cookies>('CookieParser', {});
export const CookieParserConsumer = CookieParserKey.Consumer;

export function CookieParser(): Middleware {
  return async (ctx, next): Promise<ZenResult> => {
    const request = ctx.request;
    const headers = request.headers;
    const cookies = getCookies(headers);
    return next(ctx.with(CookieParserKey.Provider(cookies)));
  };
}
