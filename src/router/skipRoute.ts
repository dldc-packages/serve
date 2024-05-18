import type { TVoidKey } from "../../mod.ts";
import { createEmptyKey, ZenResponse } from "../core/mod.ts";

export const SkipRouteKey: TVoidKey = createEmptyKey("SkipRoute");

export function skipRoute(): ZenResponse {
  return ZenResponse.create(null, { status: 404 }).with(
    SkipRouteKey.Provider(),
  );
}
