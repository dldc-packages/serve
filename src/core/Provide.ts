import { createKey } from "@dldc/stack";
import type { ZenContext } from "./ZenContext.ts";
import type { Middleware } from "./compose.ts";

export function Provide<Result>(
  name: string,
  validate: (ctx: ZenContext) => Promise<Result>,
) {
  const CtxKey = createKey<Result>(name);

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
