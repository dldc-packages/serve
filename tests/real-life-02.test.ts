import { expect, test } from 'vitest';
import {
  AllowedMethodsRoutes,
  Compression,
  CookieManager,
  CookieParser,
  CorsActual,
  CorsPreflight,
  ErrorToHttpError,
  HttpError,
  HttpErrorToJsonResponse,
  InvalidResponseToHttpError,
  JsonParser,
  Route,
  Router,
  compose,
  createNodeServer,
  json,
} from '../src/mod';
import { mountServer } from './utils/mountServer';

test('real life 2', async () => {
  const app = createNodeServer(
    compose(
      CorsActual(),
      CorsPreflight(),
      Compression(),
      HttpErrorToJsonResponse(),
      InvalidResponseToHttpError(),
      ErrorToHttpError(),
      JsonParser(),
      CookieParser(),
      CookieManager(),
      Router(
        AllowedMethodsRoutes([
          Route.POST('login', () => {
            return json({ success: true });
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
    Content-Type: application/json; charset=utf-8
    Date: Xxx, XX Xxx XXXX XX:XX:XX GMT
    Transfer-Encoding: chunked
  `);

  const res2 = await fetch(`${url}/login`);
  expect(res2).toMatchInlineSnapshot(`
    HTTP/1.1 404 Not Found
    Connection: close
    Content-Encoding: gzip
    Content-Type: application/json; charset=utf-8
    Date: Xxx, XX Xxx XXXX XX:XX:XX GMT
    Transfer-Encoding: chunked
  `);

  const res3 = await fetch(`${url}/login`, { method: 'post' });
  expect(res3).toMatchInlineSnapshot(`
    HTTP/1.1 200 OK
    Connection: close
    Content-Encoding: gzip
    Content-Type: application/json; charset=utf-8
    Date: Xxx, XX Xxx XXXX XX:XX:XX GMT
    Transfer-Encoding: chunked
  `);

  const res4 = await fetch(`${url}/login`, {
    method: 'post',
    headers: { origin: 'localhost:3000' },
  });
  expect(res4).toMatchInlineSnapshot(`
    HTTP/1.1 200 OK
    Access-Control-Allow-Origin: localhost:3000
    Connection: close
    Content-Encoding: gzip
    Content-Type: application/json; charset=utf-8
    Date: Xxx, XX Xxx XXXX XX:XX:XX GMT
    Transfer-Encoding: chunked
  `);

  await close();
});
