import type { Middleware } from "../core/mod.ts";
import { HttpHeader } from "../core/mod.ts";
import type { CorsActualConfig } from "./utils.ts";
import { createActualConfigResolver } from "./utils.ts";
import { withCorsActual } from "./withCorsActual.ts";

export function CorsActual(config: CorsActualConfig = {}): Middleware {
  const resolver = createActualConfigResolver(config);

  return async (ctx, next) => {
    const origin = ctx.headers.get(HttpHeader.Origin);
    const response = await next(ctx);
    const cors = resolver(origin);
    // invalid origin, continue without any cors header
    if (cors === false) {
      return response;
    }
    return withCorsActual(response, cors);
  };
}
