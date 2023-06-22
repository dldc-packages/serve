import { expect, test } from 'vitest';
import {
  AllowedMethodsRoutes,
  Compression,
  CookieManager,
  CorsActual,
  CorsPreflight,
  ErrorToHttpError,
  HttpErrorToTextResponse,
  InvalidResponseToHttpError,
  NotFound,
  Route,
  Router,
  UrlParser,
  ZenResponse,
  compose,
  createNodeServer,
} from '../src/mod';
import { mountServer } from './utils/mountServer';

test('real life', async () => {
  const app = createNodeServer(
    compose(
      CorsActual(),
      CorsPreflight(),
      Compression(),
      UrlParser(),
      HttpErrorToTextResponse(),
      InvalidResponseToHttpError(),
      ErrorToHttpError(),
      CookieManager(),
      Router(
        AllowedMethodsRoutes([
          // Route.UPGRADE('connect', HandleWebsocket),
          Route.GET('login', () => {
            return ZenResponse.create('TODO');
          }),
          Route.GET('logout', () => {
            return ZenResponse.create('TODO');
          }),
          Route.fallback(() => {
            throw NotFound.create();
          }),
        ])
      )
    )
  );

  const { url, close, fetch } = await mountServer(app);

  const res = await fetch(url);
  expect(res).toMatchInlineSnapshot(`
    HTTP/1.1 404 Not Found
    Connection: close
    Content-Encoding: gzip
    Date: Xxx, XX Xxx XXXX XX:XX:XX GMT
    Transfer-Encoding: chunked
  `);

  await close();
});
