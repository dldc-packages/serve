import { HttpHeader, type ZenResponse } from "../core/mod.ts";

interface CorsConfigResolved {
  allowOrigin: string;
  allowCredentials: boolean;
  exposeHeaders: Array<string> | null;
}

export function withCorsActual(
  res: ZenResponse,
  cors: CorsConfigResolved,
): ZenResponse {
  return res.withHeaders((prev) => {
    const nextHeaders = new Headers(prev);
    if (cors.allowOrigin) {
      nextHeaders.set(HttpHeader.AccessControlAllowOrigin, cors.allowOrigin);
    }
    if (cors.allowCredentials) {
      nextHeaders.set(HttpHeader.AccessControlAllowCredentials, "true");
    }
    if (cors.exposeHeaders && cors.exposeHeaders.length > 0) {
      nextHeaders.set(
        HttpHeader.AccessControlExposeHeaders,
        cors.exposeHeaders.join(", "),
      );
    }
    return nextHeaders;
  });
}
