import {
  compose,
  CookieManager,
  CookieManagerConsumer,
  createHandler,
  createNotFound,
  ErrorToHttpError,
  HttpErrorToTextResponse,
  noContent,
  withSetCookies,
} from "../mod.ts";
import { expectHeaders } from "./utils/expectHeaders.ts";
import { mountServer } from "./utils/mountServer.ts";

Deno.test("should set the Set-Cookie header", async () => {
  const app = createHandler(() => {
    return withSetCookies(noContent(), [{
      name: "token",
      value: "T55YTRR55554",
    }]);
  });
  const { close, url, fetch } = await mountServer(app);
  const res = await fetch(url);
  expectHeaders(
    res,
    `
      HTTP/1.1 204 No Content
      Date: Xxx, XX Xxx XXXX XX:XX:XX GMT
      Set-Cookie: token=T55YTRR55554
    `,
  );
  await close();
});

Deno.test("should set the Set-Cookie header using Manager", async () => {
  const app = createHandler(
    compose(CookieManager(), (ctx) => {
      ctx.getOrFail(CookieManagerConsumer).set("token", "T55YTRR55554");
      return noContent();
    }),
  );
  const { close, url, fetch } = await mountServer(app);
  const res = await fetch(url);
  expectHeaders(
    res,
    `
      HTTP/1.1 204 No Content
      Date: Xxx, XX Xxx XXXX XX:XX:XX GMT
      Set-Cookie: token=T55YTRR55554
    `,
  );
  await close();
});

Deno.test("should set two Set-Cookie header using Manager", async () => {
  const app = createHandler(
    compose(CookieManager(), (ctx) => {
      const cookieManager = ctx.getOrFail(CookieManagerConsumer);
      cookieManager.set("token", "T55YTRR55554");
      cookieManager.set("user", "etienne");
      return noContent();
    }),
  );
  const { close, url, fetch } = await mountServer(app);
  const res = await fetch(url);
  expectHeaders(
    res,
    `
      HTTP/1.1 204 No Content
      Date: Xxx, XX Xxx XXXX XX:XX:XX GMT
      Set-Cookie: token=T55YTRR55554
      Set-Cookie: user=etienne
    `,
  );
  await close();
});

Deno.test("should return the same result as koa", async () => {
  const app = createHandler(() => {
    return withSetCookies(noContent(), [{
      name: "token",
      value: "T55YTRR55554",
    }]);
  });

  const { close, url, fetch } = await mountServer(app);

  const res = await fetch(url);

  expectHeaders(
    res,
    `
      HTTP/1.1 204 No Content
      Date: Xxx, XX Xxx XXXX XX:XX:XX GMT
      Set-Cookie: token=T55YTRR55554
    `,
  );

  await close();
});

Deno.test("should return the same result as koa when deleting cookie", async () => {
  const app = createHandler(() => {
    return withSetCookies(noContent(), [{
      name: "token",
      value: "",
      expires: new Date(0),
    }]);
  });
  const { close, url, fetch } = await mountServer(app);
  const res = await fetch(url);

  expectHeaders(
    res,
    `
      HTTP/1.1 204 No Content
      Date: Xxx, XX Xxx XXXX XX:XX:XX GMT
      Set-Cookie: token=; Expires=Thu, 01 Jan 1970 00:00:00 GMT
    `,
  );

  await close();
});

Deno.test("Cookie manager should set and delete cookies", async () => {
  const app = createHandler(
    compose(CookieManager(), (ctx) => {
      const manager = ctx.getOrFail(CookieManagerConsumer);
      manager.set("new-cookie", "value");
      manager.delete("deleted-cookie");
      return noContent();
    }),
  );

  const { close, url, fetch } = await mountServer(app);
  const res = await fetch(url);

  expectHeaders(
    res,
    `
      HTTP/1.1 204 No Content
      Date: Xxx, XX Xxx XXXX XX:XX:XX GMT
      Set-Cookie: new-cookie=value
      Set-Cookie: deleted-cookie=; Expires=Thu, 01 Jan 1970 00:00:00 GMT
    `,
  );

  await close();
});

Deno.test("Cookies should not be set on error response", async () => {
  const app = createHandler(
    compose(
      HttpErrorToTextResponse(),
      ErrorToHttpError(),
      CookieManager(),
      (ctx) => {
        const manager = ctx.getOrFail(CookieManagerConsumer);
        manager.set("new-cookie", "value");
        manager.delete("deleted-cookie");
        throw createNotFound();
      },
    ),
  );
  const { url, close, fetch } = await mountServer(app);
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
