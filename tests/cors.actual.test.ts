import { expect } from "@std/expect";
import type { CorsActualConfig } from "../mod.ts";
import { compose, CorsActual, createHandler, ZenResponse } from "../mod.ts";
import { expectHeaders } from "./utils/expectHeaders.ts";
import { mountServer } from "./utils/mountServer.ts";

function createCorsHandler(config: CorsActualConfig = {}) {
  return createHandler(
    compose(CorsActual(config), () => {
      return ZenResponse.create("Hello");
    }),
  );
}

Deno.test("create server with cors does not throw", () => {
  expect(() => createCorsHandler()).not.toThrow();
});

Deno.test("simple text response", async () => {
  const handler = createCorsHandler();
  const { url, close, fetch } = mountServer(handler);
  const res = await fetch(url);
  expectHeaders(
    res,
    `
      HTTP/1.1 200 OK
      Content-Length: 5
      Content-Type: text/plain;charset=UTF-8
      Date: Xxx, XX Xxx XXXX XX:XX:XX GMT
      Vary: Accept-Encoding
    `,
  );
  expect(await res.text()).toBe("Hello");
  await close();
});

Deno.test("6.1.1 Does not set headers if Origin is missing", async () => {
  const app = createCorsHandler({
    allowOrigin: ["http://api.myapp.com", "http://www.myapp.com"],
  });
  const { url, close, fetch } = mountServer(app);
  const res = await fetch(url);
  expectHeaders(
    res,
    `
      HTTP/1.1 200 OK
      Content-Length: 5
      Content-Type: text/plain;charset=UTF-8
      Date: Xxx, XX Xxx XXXX XX:XX:XX GMT
      Vary: Accept-Encoding
    `,
  );
  await res.body?.cancel();
  await close();
});

Deno.test("6.1.2 Does not set headers if Origin does not match", async () => {
  const app = createCorsHandler({
    allowOrigin: ["http://api.myapp.com", "http://www.myapp.com"],
  });
  const { url, close, fetch } = mountServer(app);
  const res = await fetch(url, {
    headers: {
      Origin: "http://random-website.com",
    },
  });
  expectHeaders(
    res,
    `
      HTTP/1.1 200 OK
      Content-Length: 5
      Content-Type: text/plain;charset=UTF-8
      Date: Xxx, XX Xxx XXXX XX:XX:XX GMT
      Vary: Accept-Encoding
    `,
  );
  await res.body?.cancel();
  await close();
});

Deno.test("6.1.3 Sets Allow-Origin headers if the Origin matches", async () => {
  const app = createCorsHandler({
    allowOrigin: ["http://api.myapp.com", "http://www.myapp.com"],
  });
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

Deno.test("Sets Allow-Origin headers if allowOrigin is true (wildcard)", async () => {
  const app = createCorsHandler({
    allowOrigin: true,
  });
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

Deno.test("6.1.3 Sets Access-Control-Allow-Credentials header if configured", async () => {
  const app = createCorsHandler({
    allowOrigin: ["http://api.myapp.com"],
    allowCredentials: true,
  });
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
      Access-Control-Allow-Credentials: true
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

Deno.test("6.1.4 Does not set exposed headers if empty", async () => {
  const app = createCorsHandler({
    allowOrigin: ["http://api.myapp.com", "http://www.myapp.com"],
  });
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

Deno.test("6.1.4 Sets exposed headers if configured", async () => {
  const app = createCorsHandler({
    allowOrigin: ["http://api.myapp.com", "http://www.myapp.com"],
    exposeHeaders: ["HeaderA", "HeaderB"],
  });
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
      Access-Control-Expose-Headers: HeaderA, HeaderB
      Content-Length: 5
      Content-Type: text/plain;charset=UTF-8
      Date: Xxx, XX Xxx XXXX XX:XX:XX GMT
      Vary: Accept-Encoding
    `,
  );
  await res.body?.cancel();
  await close();
});
