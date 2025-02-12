import {
  AllowedMethodsRoutes,
  chemin,
  compose,
  CookieManager,
  CookieParser,
  CorsActual,
  CorsPreflight,
  createHandler,
  createNotFound,
  ErrorToHttpError,
  HttpErrorToJsonResponse,
  InvalidResponseToHttpError,
  json,
  JsonParser,
  Route,
  Router,
} from "../mod.ts";
import { expectHeaders } from "./utils/expectHeaders.ts";
import { mountServer } from "./utils/mountServer.ts";

Deno.test("real life 2", async () => {
  const app = createHandler(
    compose(
      CorsActual(),
      CorsPreflight(),
      HttpErrorToJsonResponse({ logOnError: false }),
      InvalidResponseToHttpError({ logOnError: false }),
      ErrorToHttpError({ logOnError: false }),
      JsonParser(),
      CookieParser(),
      CookieManager(),
      Router(
        AllowedMethodsRoutes([
          Route.POST(chemin("login"), () => {
            return json({ success: true });
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
  expectHeaders(
    res,
    `
      HTTP/1.1 404 Not Found
      Content-Length: 52
      Content-Type: application/json; charset=utf-8
      Date: Xxx, XX Xxx XXXX XX:XX:XX GMT
      Vary: Accept-Encoding
    `,
  );
  res.body?.cancel();

  const res2 = await fetch(`${url}/login`);
  expectHeaders(
    res2,
    `
      HTTP/1.1 404 Not Found
      Content-Length: 52
      Content-Type: application/json; charset=utf-8
      Date: Xxx, XX Xxx XXXX XX:XX:XX GMT
      Vary: Accept-Encoding
    `,
  );
  res2.body?.cancel();

  const res3 = await fetch(`${url}/login`, { method: "post" });
  expectHeaders(
    res3,
    `
      HTTP/1.1 200 OK
      Content-Length: 16
      Content-Type: application/json; charset=utf-8
      Date: Xxx, XX Xxx XXXX XX:XX:XX GMT
      Vary: Accept-Encoding
    `,
  );
  res3.body?.cancel();

  const res4 = await fetch(`${url}/login`, {
    method: "post",
    headers: { origin: "localhost:3000" },
  });
  expectHeaders(
    res4,
    `
      HTTP/1.1 200 OK
      Access-Control-Allow-Origin: localhost:3000
      Content-Length: 16
      Content-Type: application/json; charset=utf-8
      Date: Xxx, XX Xxx XXXX XX:XX:XX GMT
      Vary: Accept-Encoding
    `,
  );
  res4.body?.cancel();

  await close();
});
