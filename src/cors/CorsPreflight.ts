import type { Middleware } from "../core/mod.ts";
import { HttpHeader } from "../core/mod.ts";
import type { CorsPreflightConfig } from "./utils.ts";
import { createPreflightConfigResolver } from "./utils.ts";
import { withCorsPreflight } from "./withCorsPreflight.ts";

export function CorsPreflight(config: CorsPreflightConfig = {}): Middleware {
  const resolver = createPreflightConfigResolver(config);

  return (ctx, next) => {
    const origin = ctx.headers.get(HttpHeader.Origin);

    // The requested method
    const requestMethod = ctx.headers.get(
      HttpHeader.AccessControlRequestMethod,
    );

    // If there are no Access-Control-Request-Method this is not CORS preflight
    if (!requestMethod) {
      return next(ctx);
    }

    const cors = resolver(origin);

    if (cors === false) {
      return next(ctx);
    }

    // At this point we know the request is a CORS Preflight
    // We don't call the next middleware and return a CorsPreflightResponse
    return withCorsPreflight(cors);
  };
}
