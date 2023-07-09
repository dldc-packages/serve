import { Key } from '@dldc/stack';
import { ZenContext } from './ZenContext';
import { Middleware } from './compose';

export function Provide<Result>(name: string, validate: (ctx: ZenContext) => Promise<Result>) {
  const CtxKey = Key.create<Result>(name);

  const Middleware: Middleware = async (ctx, next) => {
    const result = await validate(ctx);
    return next(ctx.with(CtxKey.Provider(result as any)));
  };

  return {
    Middleware,
    getOrFail: (ctx: ZenContext): Result => {
      return ctx.getOrFail(CtxKey.Consumer);
    },
  };
}
