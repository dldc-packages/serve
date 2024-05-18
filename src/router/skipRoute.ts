import { createEmptyKey, ZenResponse } from "../core/mod.ts";

export const SkipRouteKey = createEmptyKey("SkipRoute");

export function skipRoute() {
  return ZenResponse.create(null, { status: 404 }).with(
    SkipRouteKey.Provider(),
  );
}
