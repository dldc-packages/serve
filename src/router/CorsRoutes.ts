import { HttpMethod, compose } from '../core/mod';
import type { CorsPreflightConfig } from '../cors/mod';
import { CorsActual } from '../cors/mod';
import { CorsPreflightRoutes } from './CorsPreflightRoutes';
import type { Routes } from './Route';
import { Route } from './Route';

export function CorsRoutes(config: CorsPreflightConfig = {}) {
  return (routes: Routes): Routes => {
    const withCorsActual = routes.map((route) => {
      const { pattern, exact, method, middleware, isFallback } = route;
      if (method === HttpMethod.OPTIONS) {
        return route;
      }
      return Route.create({ pattern, exact, method, isFallback }, compose(CorsActual(config), middleware));
    });
    return CorsPreflightRoutes(withCorsActual, config);
  };
}
