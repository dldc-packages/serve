import { InternalServerError, Key, Middleware, ZenResponse, ZenResult } from '../core/mod';
import { CreateCookieOptions, SetCookie, SetCookies } from './Cookie';
import { withCookies } from './withCookies';

export interface CookieManager {
  set(name: string, value: string, options?: CreateCookieOptions): void;
  has(name: string): boolean;
  unset(name: string): void;
  delete(name: string, options?: CreateCookieOptions): void;
}

export const CookieManagerKey = Key.create<CookieManager>('CookieManager');
export const CookieManagerConsumer = CookieManagerKey.Consumer;

export function CookieManager(): Middleware {
  return async (ctx, next): Promise<ZenResult> => {
    let cookies: SetCookies = [];
    const manager: CookieManager = {
      set: (name, value, options) => {
        cookies.push(SetCookie.create(name, value, options));
      },
      has: (name) => {
        const found = cookies.find((c) => c.name === name);
        return found !== undefined;
      },
      delete: (name, options) => {
        cookies.push(SetCookie.delete(name, options));
      },
      unset: (name) => {
        cookies = cookies.filter((c) => c.name !== name);
      },
    };
    const response = await next(ctx.with(CookieManagerKey.Provider(manager)));
    if (response instanceof ZenResponse === false) {
      throw InternalServerError.create(`CookieManager received an invalid response !`);
    }
    return withCookies(response, cookies);
  };
}
