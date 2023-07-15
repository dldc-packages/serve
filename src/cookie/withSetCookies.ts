import type { Cookie } from 'undici';
import { Headers, getSetCookies, setCookie } from 'undici';
import type { ZenResponse } from '../mod';

export function withSetCookies(res: ZenResponse, setCookies: Cookie[]): ZenResponse {
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
