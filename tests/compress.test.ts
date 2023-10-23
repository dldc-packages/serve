import { TransformStream } from 'stream/web';
import { assert, expect, test } from 'vitest';
import { Compression, CompressionKey, HttpHeader, ZenResponse, compose, createNodeServer, json } from '../src/mod';
import { mountServer } from './utils/mountServer';

test('gzip', async () => {
  const server = createNodeServer(compose(Compression(), () => json({ hello: 'world' })));

  const { close, url, fetch } = await mountServer(server);
  const res = await fetch(url, {
    headers: { 'accept-encoding': 'gzip' },
  });
  expect(res).toMatchInlineSnapshot(`
    HTTP/1.1 200 OK
    Connection: close
    Content-Encoding: gzip
    Content-Type: application/json; charset=utf-8
    Date: Xxx, XX Xxx XXXX XX:XX:XX GMT
    Transfer-Encoding: chunked
  `);
  expect(await res.text()).toBe('{"hello":"world"}');
  await close();
});

test('brotli over gzip', async () => {
  const server = createNodeServer(compose(Compression(), () => json({ hello: 'world' })));
  const { close, url, fetch } = await mountServer(server);
  const res = await fetch(url, {
    headers: { 'accept-encoding': 'gzip, br' },
  });
  expect(res).toMatchInlineSnapshot(`
    HTTP/1.1 200 OK
    Connection: close
    Content-Encoding: br
    Content-Type: application/json; charset=utf-8
    Date: Xxx, XX Xxx XXXX XX:XX:XX GMT
    Transfer-Encoding: chunked
  `);
  expect(await res.text()).toBe('{"hello":"world"}');
  await close();
});

test('deflate', async () => {
  const server = createNodeServer(compose(Compression(), () => json({ hello: 'world' })));
  const { close, url, fetch } = await mountServer(server);
  const res = await fetch(url, {
    headers: { 'accept-encoding': 'deflate' },
  });
  expect(res).toMatchInlineSnapshot(`
    HTTP/1.1 200 OK
    Connection: close
    Content-Encoding: deflate
    Content-Type: application/json; charset=utf-8
    Date: Xxx, XX Xxx XXXX XX:XX:XX GMT
    Transfer-Encoding: chunked
  `);
  expect(await res.text()).toBe('{"hello":"world"}');
  await close();
});

test('compress with asyncIterable body', async () => {
  const server = createNodeServer(
    compose(Compression(), (ctx) => {
      const compression = ctx.get(CompressionKey.Consumer);
      const body = new TransformStream<Uint8Array | 'flush', Uint8Array>({
        transform(chunk, controller) {
          if (typeof chunk === 'string') {
            compression?.flush();
            return;
          }
          controller.enqueue(chunk);
        },
      });
      async function sendData() {
        const writer = body.writable.getWriter();
        await writer.write(Uint8Array.from([1, 2, 3]));
        await writer.write(Uint8Array.from([4, 5, 6]));
        await writer.write('flush');
        await new Promise((resolve) => setTimeout(resolve, 100));
        await writer.write(Uint8Array.from([7, 8, 9]));
        await writer.close();
      }
      sendData().catch((err) => {
        console.log(err);
      });
      return ZenResponse.create(body.readable, {
        headers: {
          [HttpHeader.Connection]: 'keep-alive',
          'content-type': 'application/octet-stream',
        },
      });
    }),
  );
  const { close, url, fetch } = await mountServer(server);

  const res = await fetch(url, {
    headers: { 'accept-encoding': 'deflate' },
  });
  assert(res.body);
  const reader = res.body.getReader();
  const message = await reader.read();
  expect(message).toEqual({
    done: false,
    value: new Uint8Array([1, 2, 3, 4, 5, 6]),
  });
  const message2 = await reader.read();
  expect(message2).toEqual({
    done: false,
    value: new Uint8Array([7, 8, 9]),
  });

  await close();
});

test('compress with asyncIterable body aborted', async () => {
  const server = createNodeServer(
    compose(Compression(), (ctx) => {
      const compression = ctx.get(CompressionKey.Consumer);
      const body = new TransformStream<Uint8Array | 'flush', Uint8Array>({
        transform(chunk, controller) {
          if (typeof chunk === 'string') {
            compression?.flush();
            return;
          }
          controller.enqueue(chunk);
        },
      });
      async function sendData() {
        const writer = body.writable.getWriter();
        await writer.write(Uint8Array.from([1, 2, 3]));
        await writer.write(Uint8Array.from([4, 5, 6]));
        await writer.write('flush');
        await new Promise((resolve) => setTimeout(resolve, 100));
        await writer.write(Uint8Array.from([7, 8, 9]));
      }
      sendData().catch((err) => {
        console.log(err);
      });
      return ZenResponse.create(body.readable, {
        headers: {
          [HttpHeader.Connection]: 'keep-alive',
          'content-type': 'application/octet-stream',
        },
      });
    }),
  );
  const { close, url, fetch } = await mountServer(server);

  const controller = new AbortController();
  const res = await fetch(url, { headers: { 'accept-encoding': 'deflate' }, signal: controller.signal });
  assert(res.body);
  const reader = res.body.getReader();
  const message = await reader.read();
  expect(message).toEqual({
    done: false,
    value: new Uint8Array([1, 2, 3, 4, 5, 6]),
  });
  controller.abort();
  await close();
});
