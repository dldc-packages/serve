import type { Cookie } from 'undici';
import { Headers, deleteCookie, getSetCookies, setCookie } from 'undici';
import type { Middleware, ZenResult } from '../core/mod';
import { Key } from '../core/mod';
import { withSetCookies } from './withSetCookies';

export interface CookieManager {
  set(name: string, value: string, options?: Omit<Cookie, 'name' | 'value'>): void;
  delete(name: string, attributes?: { name?: string; domain?: string }): void;
}

export const CookieManagerKey = Key.create<CookieManager>('CookieManager');
export const CookieManagerConsumer = CookieManagerKey.Consumer;

export function CookieManager(): Middleware {
  return async (ctx, next): Promise<ZenResult> => {
    const cookiesHeader = new Headers();
    const manager: CookieManager = {
      set: (name, value, options) => {
        setCookie(cookiesHeader, {
          ...options,
          name,
          value,
        });
      },
      delete: (name, attributes) => {
        deleteCookie(cookiesHeader, name, attributes);
      },
    };
    const response = await next(ctx.with(CookieManagerKey.Provider(manager)));
    const setCookies = getSetCookies(cookiesHeader);
    return withSetCookies(response, setCookies);
  };
}
