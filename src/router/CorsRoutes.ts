import { compose, HttpMethod } from "../core/mod.ts";
import type { CorsPreflightConfig } from "../cors/mod.ts";
import { CorsActual } from "../cors/mod.ts";
import { CorsPreflightRoutes } from "./CorsPreflightRoutes.ts";
import type { Routes } from "./Route.ts";
import { Route } from "./Route.ts";

export function CorsRoutes(config: CorsPreflightConfig = {}) {
  return (routes: Routes): Routes => {
    const withCorsActual = routes.map((route) => {
      const { pattern, exact, method, middleware, isFallback } = route;
      if (method === HttpMethod.OPTIONS) {
        return route;
      }
      return Route.create(
        { pattern, exact, method, isFallback },
        compose(CorsActual(config), middleware),
      );
    });
    return CorsPreflightRoutes(withCorsActual, config);
  };
}
