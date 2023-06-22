import { compose, HttpMethod, Key, Middleware, ZenResult } from '../core/mod';
import { Route, Routes } from './Route';
import { withAllowedMethods } from './withAllowedMethods';

export const RouterAllowedMethodsKey = Key.create<Set<HttpMethod>>('RouterAllowedMethods');
export const RouterAllowedMethodsConsumer = RouterAllowedMethodsKey.Consumer;

export function AllowedMethodsRoutes(routes: Routes): Routes {
  const result: Routes = [];
  const byPattern = Route.groupByPattern(routes);
  const updatedRoutes = new Map<Route, Route>();
  byPattern.forEach(({ pattern, routes }) => {
    if (pattern !== null) {
      const allowedMethods = routes.reduce<Set<HttpMethod> | null>((acc, route) => {
        if (route.isFallback) {
          return acc;
        }
        if (acc === null || route.method === null) {
          return null;
        }
        acc.add(route.method);
        return acc;
      }, new Set<HttpMethod>([HttpMethod.OPTIONS]));
      const methods = allowedMethods || HttpMethod.__ALL;
      if (methods.size === 1) {
        return;
      }
      const optionsRoute = routes.find((route) => route.method === HttpMethod.OPTIONS);
      if (optionsRoute) {
        const newRoute: Route = {
          ...optionsRoute,
          middleware: compose(AllowedMethodsMiddleware(methods), optionsRoute.middleware),
        };
        updatedRoutes.set(optionsRoute, newRoute);
      } else {
        result.push(
          Route.create({ pattern, exact: true, method: HttpMethod.OPTIONS }, AllowedMethodsMiddleware(methods))
        );
      }
    }
  });
  routes.forEach((route) => {
    const updated = updatedRoutes.get(route);
    if (updated) {
      result.push(updated);
    } else {
      result.push(route);
    }
  });
  return result;
}

function AllowedMethodsMiddleware(methods: Set<HttpMethod>): Middleware {
  return async (ctx, next): Promise<ZenResult> => {
    const response = await next(ctx.with(RouterAllowedMethodsKey.Provider(methods)));
    return withAllowedMethods(response, methods);
  };
}
