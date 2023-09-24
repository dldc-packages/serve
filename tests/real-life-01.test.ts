import { expect, test } from 'vitest';
import {
  AllowedMethodsRoutes,
  Chemin,
  Compression,
  CookieManager,
  CorsActual,
  CorsPreflight,
  ErrorToHttpError,
  HttpError,
  HttpErrorToTextResponse,
  InvalidResponseToHttpError,
  Route,
  Router,
  ZenResponse,
  compose,
  createNodeServer,
} from '../src/mod';
import { mountServer } from './utils/mountServer';

test('real life', async () => {
  const ROUTES = {
    login: Chemin.create('login'),
    logout: Chemin.create('logout'),
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
            throw HttpError.NotFound.create();
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
