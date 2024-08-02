import type { Middleware } from "./compose.ts";
import type { TKeyProviderFn } from "./mod.ts";

export interface TKeyLike<T, HasDefault extends boolean> {
  Provider: TKeyProviderFn<T, HasDefault, [T]>;
}

export function Provider<T, HasDefault extends boolean>(
  keyLike: TKeyLike<T, HasDefault>,
  value: T,
): Middleware {
  return (ctx, next) => next(ctx.with(keyLike.Provider(value)));
}
