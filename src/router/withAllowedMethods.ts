import { Headers } from 'undici';
import type { HttpMethod, ZenResponse } from '../mod';
import { HttpHeader } from '../mod';
import { RouterAllowedMethodsKey } from './AllowedMethodsRoutes';

export function withAllowedMethods(response: ZenResponse, allowedMethods: Set<HttpMethod>): ZenResponse {
  const allowHeaderContent = Array.from(allowedMethods.values()).join(',');
  return response
    .withHeaders((prev) => {
      const headers = new Headers(prev);
      headers.set(HttpHeader.Allow, allowHeaderContent);
      return headers;
    })
    .with(RouterAllowedMethodsKey.Provider(allowedMethods));
}
