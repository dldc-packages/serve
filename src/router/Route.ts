import type { IChemin } from "@dldc/chemin";
import { chemin, equal as cheminEqual, splitPathname } from "@dldc/chemin";
import type { Middleware } from "../core/mod.ts";
import { compose, HttpMethod } from "../core/mod.ts";

export const ROUTE_TOKEN = Symbol.for("__TUMAU_ROUTE_TOKEN__");

export interface Route {
  [ROUTE_TOKEN]: true;
  pattern: IChemin | null;
  method: HttpMethod | null;
  // ignored if pattern is null
  exact: boolean;
  middleware: Middleware;
  // if true route should not be considered as a defined route
  // (AllowedMethod will ignore it)
  isFallback: boolean;
}

export type Routes = Array<Route>;

const withMethod =
  (method: HttpMethod) =>
  (pattern: IChemin | null, ...middleware: Array<Middleware>) =>
    createRoute({ pattern, exact: true, method }, middleware);

export const Route = {
  find,
  groupByPattern,
  create: createRoute,
  GET: withMethod(HttpMethod.GET),
  POST: withMethod(HttpMethod.POST),
  PUT: withMethod(HttpMethod.PUT),
  DELETE: withMethod(HttpMethod.DELETE),
  PATCH: withMethod(HttpMethod.PATCH),
  namespace: (pattern: IChemin | string, routes: Routes): Routes => {
    return routes.map(
      (route): Route => ({
        ...route,
        pattern: route.pattern === null
          ? chemin(pattern)
          : chemin(pattern, route.pattern),
      }),
    );
  },
  group: (
    middlewares: Middleware | Array<Middleware>,
    routes: Routes,
  ): Routes => {
    const middleware = resolveMiddleware(middlewares);
    return routes.map((route): Route => ({
      ...route,
      middleware: compose(middleware, route.middleware),
    }));
  },
  fallback: (...middlewares: Array<Middleware>): Route =>
    createRoute({ exact: false, isFallback: true }, middlewares),
};

function createRoute(
  {
    isFallback = false,
    method = null,
    pattern = null,
    exact = true,
  }: {
    isFallback?: boolean;
    pattern?: IChemin | null;
    method?: HttpMethod | null;
    exact?: boolean;
  },
  middleware: Middleware | Array<Middleware>,
): Route {
  return {
    [ROUTE_TOKEN]: true,
    pattern,
    middleware: resolveMiddleware(middleware),
    method,
    exact,
    isFallback,
  };
}

function resolveMiddleware(
  middleware: Middleware | Array<Middleware>,
): Middleware {
  if (Array.isArray(middleware)) {
    return compose(...middleware);
  }
  return middleware;
}

export interface FindResult {
  route: Route;
  index: number;
  params: { [key: string]: any };
}

// fins all routes matching the pattern (ignoring methods & upgrade)
function find(
  routes: Array<Route>,
  pathname: string,
  method: HttpMethod | null,
): Array<FindResult> {
  const parts = splitPathname(pathname);
  return routes
    .map((route, index): FindResult | false => {
      if (route.pattern === null) {
        return {
          route,
          index,
          params: {},
        };
      }
      const pathMatch = route.pattern.match(parts);
      if (pathMatch === null) {
        return false;
      }
      if (route.exact && pathMatch.rest.length > 0) {
        return false;
      }
      const methodIsMatching = method === null || route.method === null ||
        route.method === method;
      if (methodIsMatching === false) {
        return false;
      }
      return {
        index,
        route: route,
        params: pathMatch.params,
      };
    })
    .filter((result: FindResult | false): result is FindResult => {
      return result !== false;
    });
}

type GroupResult = {
  pattern: IChemin | null;
  routes: Routes;
};

function groupByPattern(routes: Array<Route>): Array<GroupResult> {
  const result: Array<GroupResult> = [];
  routes.forEach((route) => {
    const pattern = route.pattern;
    const exist = pattern === null
      ? result.find((item) => item.pattern === null)
      : result.find((item) =>
        item.pattern !== null && cheminEqual(item.pattern, pattern)
      );
    if (exist) {
      exist.routes.push(route);
    } else {
      result.push({ pattern, routes: [route] });
    }
  });
  return result;
}
