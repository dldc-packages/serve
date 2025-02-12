import {
  AllowedMethodsRoutes,
  chemin,
  compose,
  CookieManager,
  CorsActual,
  CorsPreflight,
  createHandler,
  createNotFound,
  ErrorToHttpError,
  HttpErrorToTextResponse,
  InvalidResponseToHttpError,
  Route,
  Router,
  ZenResponse,
} from "../mod.ts";
import { expectHeaders } from "./utils/expectHeaders.ts";
import { mountServer } from "./utils/mountServer.ts";

Deno.test("real life", async () => {
  const ROUTES = {
    login: chemin("login"),
    logout: chemin("logout"),
  };

  const handler = createHandler(
    compose(
      CorsActual(),
      CorsPreflight(),
      HttpErrorToTextResponse(),
      InvalidResponseToHttpError({ logOnError: false }),
      ErrorToHttpError({ logOnError: false }),
      CookieManager(),
      Router(
        AllowedMethodsRoutes([
          Route.GET(ROUTES.login, () => {
            return ZenResponse.create("TODO");
          }),
          Route.GET(ROUTES.logout, () => {
            return ZenResponse.create("TODO");
          }),
          Route.fallback(() => {
            throw createNotFound();
          }),
        ]),
      ),
    ),
  );

  const { url, close, fetch } = await mountServer(handler);

  const res = await fetch(url);
  expectHeaders(
    res,
    `
      HTTP/1.1 404 Not Found
      Content-Length: 19
      Content-Type: text/plain;charset=UTF-8
      Date: Xxx, XX Xxx XXXX XX:XX:XX GMT
      Vary: Accept-Encoding
    `,
  );
  await res.body?.cancel();
  await close();
});
