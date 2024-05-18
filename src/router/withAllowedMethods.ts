import { HttpHeader, type HttpMethod, type ZenResponse } from "../core/mod.ts";
import { RouterAllowedMethodsKey } from "./AllowedMethodsRoutes.ts";

export function withAllowedMethods(
  response: ZenResponse,
  allowedMethods: Set<HttpMethod>,
): ZenResponse {
  const allowHeaderContent = Array.from(allowedMethods.values()).join(",");
  return response
    .withHeaders((prev) => {
      const headers = new Headers(prev);
      headers.set(HttpHeader.Allow, allowHeaderContent);
      return headers;
    })
    .with(RouterAllowedMethodsKey.Provider(allowedMethods));
}
