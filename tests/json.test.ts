import { expect } from "@std/expect";
import {
  compose,
  ContentType,
  CookieManager,
  CookieManagerConsumer,
  createHandler,
  createNotFound,
  ErrorToHttpError,
  GetJsonBodyKeyConsumer,
  HttpErrorToJsonResponse,
  HttpErrorToTextResponse,
  HttpHeader,
  HttpMethod,
  InvalidResponseToHttpError,
  json,
  JsonParser,
} from "../mod.ts";
import { expectHeaders } from "./utils/expectHeaders.ts";
import { mountServer } from "./utils/mountServer.ts";

function JsonPackage() {
  return compose(
    HttpErrorToJsonResponse({ logOnError: false }),
    ErrorToHttpError({ logOnError: false }),
    InvalidResponseToHttpError({ logOnError: false }),
    JsonParser(),
  );
}

Deno.test("parse JSON body", async () => {
  const handler = createHandler(
    compose(
      HttpErrorToTextResponse(),
      ErrorToHttpError({ logOnError: false }),
      JsonParser(),
      async (ctx) => {
        const body = await ctx.getOrFail(GetJsonBodyKeyConsumer)();
        return json({ body });
      },
    ),
  );
  const { close, url, fetch } = mountServer(handler);
  const res = await fetch(url, {
    method: HttpMethod.POST,
    body: JSON.stringify({ name: "Perceval", alias: "Provençal le Gaulois" }),
    headers: {
      [HttpHeader.ContentType]: ContentType.format("application/json"),
    },
  });
  expectHeaders(
    res,
    `
    HTTP/1.1 200 OK
    Content-Length: 60
    Content-Type: application/json; charset=utf-8
    Date: Xxx, XX Xxx XXXX XX:XX:XX GMT
    Vary: Accept-Encoding
  `,
  );
  expect(await res.json()).toEqual({
    body: { name: "Perceval", alias: "Provençal le Gaulois" },
  });
  await close();
});

Deno.test("JsonPackage handle JsonResponse", async () => {
  const handler = createHandler(
    compose(JsonPackage(), () => {
      return json({ foo: "bar" });
    }),
  );
  const { close, url, fetch } = mountServer(handler);
  const res5 = await fetch(url);
  expectHeaders(
    res5,
    `
    HTTP/1.1 200 OK
    Content-Length: 13
    Content-Type: application/json; charset=utf-8
    Date: Xxx, XX Xxx XXXX XX:XX:XX GMT
    Vary: Accept-Encoding
  `,
  );
  expect(await res5.json()).toEqual({ foo: "bar" });
  await close();
});

Deno.test("JsonPackage handle no response", async () => {
  const handler = createHandler(compose(JsonPackage()));
  const { close, url, fetch } = mountServer(handler);

  const res1 = await fetch(url);
  expectHeaders(
    res1,
    `
    HTTP/1.1 500 Internal Server Error
    Content-Length: 76
    Content-Type: application/json; charset=utf-8
    Date: Xxx, XX Xxx XXXX XX:XX:XX GMT
    Vary: Accept-Encoding
  `,
  );
  expect(await res1.json()).toEqual({
    code: 500,
    name: "InternalServerError",
    message: "Server did not respond",
  });

  await close();
});

Deno.test("JsonPackage convert text to Json", async () => {
  const handler = createHandler(
    compose(JsonPackage(), () => {
      return json("Hello");
    }),
  );
  const { close, url, fetch } = mountServer(handler);

  const res2 = await fetch(url);
  expectHeaders(
    res2,
    `
    HTTP/1.1 200 OK
    Content-Length: 7
    Content-Type: application/json; charset=utf-8
    Date: Xxx, XX Xxx XXXX XX:XX:XX GMT
    Vary: Accept-Encoding
  `,
  );
  expect(await res2.text()).toEqual('"Hello"');

  await close();
});

Deno.test("JsonPackage handle HttpError and convert them to json", async () => {
  const handler = createHandler(
    compose(JsonPackage(), () => {
      throw createNotFound();
    }),
  );
  const { close, url, fetch } = mountServer(handler);

  const res3 = await fetch(url);
  expectHeaders(
    res3,
    `
    HTTP/1.1 404 Not Found
    Content-Length: 52
    Content-Type: application/json; charset=utf-8
    Date: Xxx, XX Xxx XXXX XX:XX:XX GMT
    Vary: Accept-Encoding
  `,
  );
  expect(await res3.json()).toEqual({
    code: 404,
    name: "NotFound",
    message: "Not Found",
  });

  await close();
});

Deno.test("JsonPackage handle Error and convert them to json", async () => {
  const handler = createHandler(
    compose(JsonPackage(), () => {
      throw new Error("Oops");
    }),
  );
  const { close, url, fetch } = mountServer(handler);

  const res4 = await fetch(url);
  expectHeaders(
    res4,
    `
    HTTP/1.1 500 Internal Server Error
    Content-Length: 58
    Content-Type: application/json; charset=utf-8
    Date: Xxx, XX Xxx XXXX XX:XX:XX GMT
    Vary: Accept-Encoding
  `,
  );
  expect(await res4.json()).toEqual({
    code: 500,
    name: "InternalServerError",
    message: "Oops",
  });

  await close();
});

Deno.test("JsonPackage works with Cookies", async () => {
  const handler = createHandler(
    compose(JsonPackage(), CookieManager(), (ctx) => {
      ctx.getOrFail(CookieManagerConsumer).set("token", "AZERTYUIO");
      return json({ foo: "bar" });
    }),
  );
  const { close, url, fetch } = mountServer(handler);

  const res = await fetch(url);
  expectHeaders(
    res,
    `
    HTTP/1.1 200 OK
    Content-Length: 13
    Content-Type: application/json; charset=utf-8
    Date: Xxx, XX Xxx XXXX XX:XX:XX GMT
    Set-Cookie: token=AZERTYUIO
    Vary: Accept-Encoding
  `,
  );
  expect(await res.json()).toEqual({ foo: "bar" });

  await close();
});

Deno.test("JsonPackage can read Json body", async () => {
  const handler = createHandler(
    compose(JsonPackage(), async (ctx) => {
      const body = await ctx.getOrFail(GetJsonBodyKeyConsumer)();
      return json(body);
    }),
  );
  const { close, url, fetch } = mountServer(handler);

  const res = await fetch(url, {
    headers: { "content-type": "application/json" },
    body: '{"done":false}',
    method: "POST",
  });

  expectHeaders(
    res,
    `
    HTTP/1.1 200 OK
    Content-Length: 14
    Content-Type: application/json; charset=utf-8
    Date: Xxx, XX Xxx XXXX XX:XX:XX GMT
    Vary: Accept-Encoding
  `,
  );
  expect(await res.json()).toEqual({ done: false });

  await close();
});

Deno.test("JsonPackage can read Json with Axio PUT", async () => {
  const handler = createHandler(
    compose(JsonPackage(), async (ctx) => {
      const body = await ctx.getOrFail(GetJsonBodyKeyConsumer)();
      return json(body);
    }),
  );
  const { close, url, fetch } = mountServer(handler);

  const res = await fetch(url, {
    headers: {
      accept: "application/json, text/plain, */*",
      "accept-language": "fr-FR,fr;q=0.9,en-US;q=0.8,en;q=0.7",
      "cache-control": "no-cache",
      "content-type": "application/json;charset=UTF-8",
      pragma: "no-cache",
      "sec-fetch-dest": "empty",
      "sec-fetch-mode": "cors",
      "sec-fetch-site": "cross-site",
    },
    body: '{"done":false}',
    method: "PUT",
  });

  expectHeaders(
    res,
    `
    HTTP/1.1 200 OK
    Content-Length: 14
    Content-Type: application/json; charset=utf-8
    Date: Xxx, XX Xxx XXXX XX:XX:XX GMT
    Vary: Accept-Encoding
  `,
  );
  expect(await res.json()).toEqual({ done: false });

  await close();
});
