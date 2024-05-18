import type { Cookie } from "@std/http";
import { getSetCookies, setCookie } from "@std/http";
import type { ZenResponse } from "../core/mod.ts";

export function withSetCookies(
  res: ZenResponse,
  setCookies: Cookie[],
): ZenResponse {
  if (setCookies.length === 0) {
    return res;
  }
  return res.withHeaders((prev) => {
    const nextHeaders = new Headers(prev);
    const prevSetCookies = getSetCookies(prev);
    const nextSetCookies = [...prevSetCookies, ...setCookies];
    nextSetCookies.forEach((cookie) => {
      setCookie(nextHeaders, cookie);
    });
    return nextHeaders;
  });
}
