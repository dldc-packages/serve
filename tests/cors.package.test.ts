import { expect } from "@std/expect";
import type { CorsActualConfig } from "../mod.ts";
import {
  compose,
  CorsActual,
  CorsPreflight,
  createHandler,
  createNotFound,
  ErrorToHttpError,
  HttpErrorToTextResponse,
  ZenResponse,
} from "../mod.ts";
import { expectHeaders } from "./utils/expectHeaders.ts";
import { mountServer } from "./utils/mountServer.ts";

function createCorsHandler(config: CorsActualConfig = {}) {
  return createHandler(
    compose(CorsActual(config), CorsPreflight(), () => {
      return ZenResponse.create("Hello");
    }),
  );
}

Deno.test("create a server with CorsPackage does not throw", () => {
  expect(() => createCorsHandler()).not.toThrow();
});

Deno.test("response to actual request", async () => {
  const app = createCorsHandler();
  const { url, close, fetch } = mountServer(app);
  const res = await fetch(url, {
    headers: {
      Origin: "http://api.myapp.com",
    },
  });
  expectHeaders(
    res,
    `
      HTTP/1.1 200 OK
      Access-Control-Allow-Origin: http://api.myapp.com
      Content-Length: 5
      Content-Type: text/plain;charset=UTF-8
      Date: Xxx, XX Xxx XXXX XX:XX:XX GMT
      Vary: Accept-Encoding
    `,
  );
  await res.body?.cancel();
  await close();
});

Deno.test("response to preflight request", async () => {
  const app = createCorsHandler();
  const { url, close, fetch } = mountServer(app);
  const res = await fetch(url, {
    method: "OPTIONS",
    headers: {
      Origin: "http://api.myapp.com",
      "Access-Control-Request-Method": "GET",
    },
  });
  expectHeaders(
    res,
    `
      HTTP/1.1 200 OK
      Access-Control-Allow-Headers: X-Requested-With, Access-Control-Allow-Origin, X-Http-Method-Override, Content-Type, Authorization, Accept
      Access-Control-Allow-Methods: POST, GET, PUT, PATCH, DELETE, OPTIONS
      Access-Control-Allow-Origin: http://api.myapp.com
      Access-Control-Max-Age: 86400
      Content-Length: 0
      Date: Xxx, XX Xxx XXXX XX:XX:XX GMT
    `,
  );
  await res.body?.cancel();
  await close();
});

Deno.test("handle error", async () => {
  const handler = createHandler(
    compose(
      CorsActual(),
      CorsPreflight(),
      HttpErrorToTextResponse(),
      ErrorToHttpError({ logOnError: false }),
      () => {
        throw createNotFound();
      },
    ),
  );
  const { url, close, fetch } = mountServer(handler);
  const res = await fetch(url, {
    headers: {
      Origin: "http://api.myapp.com",
    },
  });
  expectHeaders(
    res,
    `
      HTTP/1.1 404 Not Found
      Access-Control-Allow-Origin: http://api.myapp.com
      Content-Length: 19
      Content-Type: text/plain;charset=UTF-8
      Date: Xxx, XX Xxx XXXX XX:XX:XX GMT
      Vary: Accept-Encoding
    `,
  );
  await res.body?.cancel();
  await close();
});

Deno.test("handle error on preflight", async () => {
  const handler = createHandler(
    compose(CorsActual(), CorsPreflight(), () => {
      throw createNotFound();
    }),
  );
  const { url, close, fetch } = mountServer(handler);
  const res = await fetch(url, {
    method: "OPTIONS",
    headers: {
      Origin: "http://api.myapp.com",
      "Access-Control-Request-Method": "POST",
    },
  });
  expectHeaders(
    res,
    `
      HTTP/1.1 200 OK
      Access-Control-Allow-Headers: X-Requested-With, Access-Control-Allow-Origin, X-Http-Method-Override, Content-Type, Authorization, Accept
      Access-Control-Allow-Methods: POST, GET, PUT, PATCH, DELETE, OPTIONS
      Access-Control-Allow-Origin: http://api.myapp.com
      Access-Control-Max-Age: 86400
      Content-Length: 0
      Date: Xxx, XX Xxx XXXX XX:XX:XX GMT
    `,
  );
  await res.body?.cancel();
  await close();
});
