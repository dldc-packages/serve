import { expect } from "@std/expect";
import {
  compose,
  createHandler,
  createNotFound,
  ErrorToHttpError,
  HttpErrorToTextResponse,
  HttpMethod,
  noContent,
  ZenResponse,
} from "../mod.ts";
import { dedent } from "./utils/dedent.ts";
import { expectHeaders } from "./utils/expectHeaders.ts";
import { mountServer } from "./utils/mountServer.ts";
import { printHttpHeaders } from "./utils/printHttpHeaders.ts";

Deno.test("create hanlder without crashing", () => {
  expect(() => createHandler(() => noContent())).not.toThrow();
});

Deno.test("simple text response", async () => {
  const handler = createHandler(() => ZenResponse.create("Hey"));
  const { url, close, fetch } = mountServer(handler);
  const res = await fetch(url);

  expect(await res.text()).toBe("Hey");

  expectHeaders(
    res,
    `
    HTTP/1.1 200 OK
    Content-Length: 3
    Content-Type: text/plain;charset=UTF-8
    Date: Xxx, XX Xxx XXXX XX:XX:XX GMT
    Vary: Accept-Encoding
  `,
  );
  await close();
});

Deno.test("send two requests", async () => {
  const handler = createHandler(() => ZenResponse.create("Hey"));
  const { url, close, fetch } = mountServer(handler);

  const res = await fetch(url);
  expectHeaders(
    res,
    `
    HTTP/1.1 200 OK
    Content-Length: 3
    Content-Type: text/plain;charset=UTF-8
    Date: Xxx, XX Xxx XXXX XX:XX:XX GMT
    Vary: Accept-Encoding
  `,
  );
  const res2 = await fetch(url);
  expect(printHttpHeaders(res2)).toEqual(dedent`
    HTTP/1.1 200 OK
    Content-Length: 3
    Content-Type: text/plain;charset=UTF-8
    Date: Xxx, XX Xxx XXXX XX:XX:XX GMT
    Vary: Accept-Encoding
  `);
  await res.body?.cancel();
  await res2.body?.cancel();
  await close();
});

Deno.test("response to arbitrary path", async () => {
  const handler = createHandler(() => ZenResponse.create("Hey"));
  const { url, close, fetch } = mountServer(handler);

  const res = await fetch(`${url}${"/some/path"}`);
  expectHeaders(
    res,
    `
    HTTP/1.1 200 OK
    Content-Length: 3
    Content-Type: text/plain;charset=UTF-8
    Date: Xxx, XX Xxx XXXX XX:XX:XX GMT
    Vary: Accept-Encoding
  `,
  );
  expect(await res.text()).toBe("Hey");
  await close();
});

Deno.test("response to post method", async () => {
  const handler = createHandler(() => ZenResponse.create("Hey"));
  const { url, close, fetch } = mountServer(handler);

  const res = await fetch(url, { method: HttpMethod.POST });
  expectHeaders(
    res,
    `
    HTTP/1.1 200 OK
    Content-Length: 3
    Content-Type: text/plain;charset=UTF-8
    Date: Xxx, XX Xxx XXXX XX:XX:XX GMT
    Vary: Accept-Encoding
  `,
  );
  expect(await res.text()).toBe("Hey");
  await close();
});

Deno.test("head request return 204 & empty body", async () => {
  const handler = createHandler(() => noContent());
  const { url, close, fetch } = mountServer(handler);

  const res = await fetch(url, {
    method: HttpMethod.HEAD,
  });
  expectHeaders(
    res,
    `
    HTTP/1.1 204 No Content
    Date: Xxx, XX Xxx XXXX XX:XX:XX GMT
  `,
  );
  expect(await res.text()).toBe("");
  await close();
});

Deno.test("throw HttpError return an error", async () => {
  const handler = createHandler(
    compose(HttpErrorToTextResponse(), () => {
      throw createNotFound();
    }),
  );
  const { close, url, fetch } = mountServer(handler);
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
  expect(await res.text()).toEqual("Error 404 Not Found");
  await close();
});

Deno.test("throw return an error", async () => {
  const handler = createHandler(
    compose(
      HttpErrorToTextResponse(),
      ErrorToHttpError({ logOnError: false }),
      () => {
        throw new Error("Oops");
      },
    ),
  );
  const { close, url, fetch } = mountServer(handler);
  const res = await fetch(url);
  expectHeaders(
    res,
    `
    HTTP/1.1 500 Internal Server Error
    Content-Length: 14
    Content-Type: text/plain;charset=UTF-8
    Date: Xxx, XX Xxx XXXX XX:XX:XX GMT
    Vary: Accept-Encoding
  `,
  );
  expect(await res.text()).toEqual("Error 500 Oops");
  await close();
});
