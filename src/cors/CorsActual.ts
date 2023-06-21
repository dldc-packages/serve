import { HttpHeader, Middleware } from '../core/mod';
import { CorsActualConfig, createActualConfigResolver } from './utils';
import { withCorsActual } from './withCorsActual';

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
