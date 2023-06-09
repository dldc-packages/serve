import { ZenContext } from './ZenContext';
import * as miid from 'miid';
import { Middleware } from './compose';

export function Provide<Result>(name: string, validate: (ctx: ZenContext) => Promise<Result>) {
  const CtxKey = miid.createKey<Result>({ name });

  const Middleware: Middleware = async (ctx, next) => {
    const result = await validate(ctx);
    return next(ctx.with(CtxKey.Provider(result)));
  };

  return {
    Middleware,
    getOrFail: (ctx: ZenContext): Result => {
      return ctx.getOrFail(CtxKey.Consumer);
    },
  };
}
