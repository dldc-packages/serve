import { HttpHeader, ZenResponse } from "../core/mod.ts";
import type { CorsPreflightConfigResolved } from "./utils.ts";

export function withCorsPreflight(
  config: CorsPreflightConfigResolved,
): ZenResponse {
  const headers = new Headers();

  if (config.allowOrigin) {
    headers.set(HttpHeader.AccessControlAllowOrigin, config.allowOrigin);
  }
  if (config.allowCredentials) {
    headers.set(HttpHeader.AccessControlAllowCredentials, "true");
  }
  if (config.maxAge !== null) {
    headers.set(HttpHeader.AccessControlMaxAge, config.maxAge.toFixed());
  }
  if (config.allowMethods && config.allowMethods.length > 0) {
    headers.set(
      HttpHeader.AccessControlAllowMethods,
      config.allowMethods.join(", "),
    );
  }
  if (config.allowHeaders && config.allowHeaders.length > 0) {
    headers.set(
      HttpHeader.AccessControlAllowHeaders,
      config.allowHeaders.join(", "),
    );
  }
  if (config.exposeHeaders && config.exposeHeaders.length > 0) {
    headers.set(
      HttpHeader.AccessControlExposeHeaders,
      config.exposeHeaders.join(", "),
    );
  }

  return ZenResponse.create(undefined, { headers });
}
