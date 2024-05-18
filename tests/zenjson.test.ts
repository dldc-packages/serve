import { restore } from "@dldc/zenjson";
import { expect } from "@std/expect";
import {
  compose,
  createHandler,
  ErrorToHttpError,
  HttpErrorToZenjsonResponse,
  zenjson,
} from "../mod.ts";
import { expectHeaders } from "./utils/expectHeaders.ts";
import { mountServer } from "./utils/mountServer.ts";

Deno.test("Send zenjson response", async () => {
  const date = new Date();
  const handler = createHandler(
    compose(
      HttpErrorToZenjsonResponse({ logOnError: false }),
      ErrorToHttpError({ logOnError: false }),
      () => {
        return zenjson({ date: date, infinity: Infinity, null: null });
      },
    ),
  );

  const { close, url, fetch } = mountServer(handler);

  const res = await fetch(url);
  expectHeaders(
    res,
    `
      HTTP/1.1 200 OK
      Content-Length: 89
      Content-Type: application/json; charset=utf-8
      Date: Xxx, XX Xxx XXXX XX:XX:XX GMT
      Vary: Accept-Encoding
    `,
  );
  const result = restore(await res.json());
  expect(result).toEqual({
    date: date,
    infinity: Infinity,
    null: null,
  });
  await close();
});
