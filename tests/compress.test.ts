import { assert } from "@std/assert";
import { expect } from "@std/expect";
import {
  compose,
  Compression,
  createHandler,
  HttpHeader,
  json,
  ZenResponse,
} from "../mod.ts";
import { gunzip, inflate } from "./deps.ts";
import { expectHeaders } from "./utils/expectHeaders.ts";
import { request } from "./utils/request.ts";
import { streamSizeReader } from "./utils/streamSizeReader.ts";

/**
 * Note: fetch() will override the Accept-Encoding header and automatically decompress the response.
 * so to test encoding we need to send a request to teh handler directly
 */

Deno.test("gzip", async () => {
  const handler = createHandler(
    compose(Compression(), () => json({ hello: "world" })),
  );

  const res = await handler(
    request({ headers: { "Accept-Encoding": "gzip" } }),
  );
  expectHeaders(
    res,
    `
      HTTP/1.1 200
      Content-Encoding: gzip
      Content-Type: application/json; charset=utf-8
    `,
  );

  const bodyBuff = await res.arrayBuffer();
  // decode gzip
  const body = gunzip(new Uint8Array(bodyBuff));
  const text = new TextDecoder().decode(body);
  expect(text).toBe('{"hello":"world"}');
});

Deno.test("brotli over gzip", async () => {
  const handler = createHandler(
    compose(Compression(), () => json({ hello: "world" })),
  );
  const res = await handler(
    request({ headers: { "Accept-Encoding": "br, gzip" } }),
  );
  expectHeaders(
    res,
    `
      HTTP/1.1 200
      Content-Encoding: br
      Content-Type: application/json; charset=utf-8
    `,
  );
});

Deno.test("deflate", async () => {
  const handler = createHandler(
    compose(Compression(), () => json({ hello: "world" })),
  );
  const res = await handler(
    request({ headers: { "Accept-Encoding": "deflate" } }),
  );

  expectHeaders(
    res,
    `
    HTTP/1.1 200
    Content-Encoding: deflate
    Content-Type: application/json; charset=utf-8
  `,
  );
  const bodyBuff = await res.arrayBuffer();
  const body = inflate(new Uint8Array(bodyBuff));
  const text = new TextDecoder().decode(body);
  expect(text).toBe('{"hello":"world"}');
});

Deno.test("asyncIterable body", async () => {
  const handler = createHandler(
    compose(() => {
      const body = new TransformStream<Uint8Array, Uint8Array>({});
      async function sendData() {
        const writer = body.writable.getWriter();
        await writer.write(Uint8Array.from([1, 2, 3]));
        await writer.write(Uint8Array.from([4, 5, 6]));
        await new Promise((resolve) => setTimeout(resolve, 100));
        await writer.write(Uint8Array.from([7, 8, 9]));
        await writer.close();
      }
      sendData().catch(() => {});
      return ZenResponse.create(body.readable, {
        headers: {
          [HttpHeader.Connection]: "keep-alive",
          [HttpHeader.ContentType]: "application/octet-stream",
        },
      });
    }),
  );

  const res = await handler(
    request({ headers: { [HttpHeader.AcceptEncoding]: "deflate" } }),
  );
  assert(res.body);
  const reader = streamSizeReader(res.body);
  const result1 = await reader.read(6);
  expect(result1).toEqual(new Uint8Array([1, 2, 3, 4, 5, 6]));
  const result2 = await reader.read(3);
  expect(result2).toEqual(new Uint8Array([7, 8, 9]));
});

Deno.test("compress with asyncIterable body", async () => {
  const handler = createHandler(
    compose(Compression(), () => {
      const body = new TransformStream<Uint8Array, Uint8Array>({});
      async function sendData() {
        const writer = body.writable.getWriter();
        await writer.write(Uint8Array.from([1, 2, 3]));
        await writer.write(Uint8Array.from([4, 5, 6]));
        await new Promise((resolve) => setTimeout(resolve, 100));
        await writer.write(Uint8Array.from([7, 8, 9]));
      }
      sendData().catch(() => {});
      return ZenResponse.create(body.readable, {
        headers: {
          [HttpHeader.Connection]: "keep-alive",
          [HttpHeader.ContentType]: "application/octet-stream",
        },
      });
    }),
  );

  const res = await handler(
    request({ headers: { [HttpHeader.AcceptEncoding]: "deflate" } }),
  );
  assert(res.body);
  const decompressor = new DecompressionStream("deflate");
  const readable = res.body.pipeThrough(decompressor);
  const reader = streamSizeReader(readable);
  const result1 = await reader.read(6);
  expect(result1).toEqual(new Uint8Array([1, 2, 3, 4, 5, 6]));
  const result2 = await reader.read(3);
  expect(result2).toEqual(new Uint8Array([7, 8, 9]));
  reader.close();
});

Deno.test("compress with asyncIterable body aborted", async () => {
  const handler = createHandler(
    compose(Compression(), () => {
      const body = new TransformStream<Uint8Array, Uint8Array>({});
      async function sendData() {
        const writer = body.writable.getWriter();
        await writer.write(Uint8Array.from([1, 2, 3]));
        await writer.write(Uint8Array.from([4, 5, 6]));
        await writer.write(Uint8Array.from([7, 8, 9]));
        await writer.close();
      }
      sendData().catch(() => {});
      return ZenResponse.create(body.readable, {
        headers: {
          [HttpHeader.Connection]: "keep-alive",
          [HttpHeader.ContentType]: "application/octet-stream",
        },
      });
    }),
  );

  const controller = new AbortController();
  const res = await handler(
    request({
      headers: { [HttpHeader.AcceptEncoding]: "deflate" },
      signal: controller.signal,
    }),
  );

  assert(res.body);
  const decompressor = new DecompressionStream("deflate");
  const readable = res.body.pipeThrough(decompressor);
  const reader = streamSizeReader(readable);

  const result = await reader.read(6);
  expect(result).toEqual(new Uint8Array([1, 2, 3, 4, 5, 6]));
  controller.abort();
  reader.close();
});
