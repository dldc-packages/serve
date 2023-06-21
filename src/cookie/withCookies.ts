import { Headers } from 'undici';
import { HttpHeader, ZenResponse } from '../mod';
import { SetCookie, SetCookies } from './Cookie';

export function withCookies(res: ZenResponse, cookies: SetCookies): ZenResponse {
  return res.withHeaders((prev) => {
    const nextHeaders = new Headers(prev);
    cookies.forEach((cookie) => {
      nextHeaders.append(HttpHeader.SetCookie, SetCookie.toString(cookie));
    });
    return nextHeaders;
  });
}
