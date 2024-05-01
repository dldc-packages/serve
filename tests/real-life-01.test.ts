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
  Route,
  Router,
  ZenResponse,
  chemin,
  compose,
  createNodeServer,
  createNotFound,
} from '../src/mod';
import { mountServer } from './utils/mountServer';

test('real life', async () => {
  const ROUTES = {
    login: chemin('login'),
    logout: chemin('logout'),
  };

  const app = createNodeServer(
    compose(
      CorsActual(),
      CorsPreflight(),
      Compression(),
      HttpErrorToTextResponse(),
      InvalidResponseToHttpError(),
      ErrorToHttpError(),
      CookieManager(),
      Router(
        AllowedMethodsRoutes([
          Route.GET(ROUTES.login, () => {
            return ZenResponse.create('TODO');
          }),
          Route.GET(ROUTES.logout, () => {
            return ZenResponse.create('TODO');
          }),
          Route.fallback(() => {
            throw createNotFound();
          }),
        ]),
      ),
    ),
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
