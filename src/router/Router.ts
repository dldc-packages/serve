import type { IChemin } from "@dldc/chemin";
import { URL } from "node:url";
import type { Middleware, ZenResult } from "../core/mod.ts";
import type { FindResult, Routes } from "./Route.ts";
import { Route } from "./Route.ts";
import type { RouterContext } from "./RouterContext.ts";
import { RouterKey } from "./RouterContext.ts";
import { SkipRouteKey } from "./skipRoute.ts";

export function Router(routes: Routes): Middleware {
  return (ctx, next): Promise<ZenResult> => {
    if (ctx.has(RouterKey.Consumer)) {
      console.warn(
        [
          `Warning: Using a Router inside another Router will break 'Allow' header and CORS !`,
          `If you want to group routes together you can use Route.namespace() or the low level Route.create()`,
        ].join("\n"),
      );
    }

    const url = new URL(ctx.request.url);
    const requestMethod = ctx.method;
    const matchingRoutes = Route.find(routes, url.pathname, requestMethod);

    return handleNext(0);

    async function handleNext(index: number): Promise<ZenResult> {
      const findResult: FindResult | null = matchingRoutes[index] || null;
      const route = findResult ? findResult.route : null;
      const pattern = route ? route.pattern : null;
      const patterns = pattern ? pattern.extract() : [];
      const params = findResult ? findResult.params : {};

      const has = (chemin: IChemin): boolean => {
        return patterns.indexOf(chemin) >= 0;
      };

      // create router context
      const routerData: RouterContext = {
        notFound: findResult === null,
        pattern,
        params,
        has,
        get: <P>(chemin: IChemin<P>) => {
          return has(chemin) ? (params as P) : null;
        },
        getOrFail: <P>(chemin: IChemin<P>) => {
          if (!has(chemin)) {
            throw new Error(`Chemin is not part of the route context !`);
          }
          return params as P;
        },
      };

      const withRouterDataCtx = ctx.with(RouterKey.Provider(routerData));

      if (findResult === null) {
        // no more match, run next
        return next(withRouterDataCtx);
      }

      if (findResult.route.middleware === null) {
        // route with no middleware, this is still a match
        // it's like if they was a middleware: (ctx, next) => next(ctx);
        return next(withRouterDataCtx);
      }

      // call the route with next pointing to the middleware after the router
      const result = await findResult.route.middleware(withRouterDataCtx, next);

      // If result has the SkipRoute
      // proceed like if the route didn't match
      if (result.has(SkipRouteKey.Consumer)) {
        return handleNext(index + 1);
      }

      // return the response
      return result;
    }
  };
}
