import { assert, expect, test } from 'vitest';
import { Compression, CompressionKey, ZenResponse, compose, createNodeServer, json } from '../src/mod';
import { createPushabledAsyncIterable } from './utils/asyncIterable';
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
      const body = createPushabledAsyncIterable<Uint8Array>();
      body.push(Uint8Array.from([1, 2, 3]));
      compression?.flush();
      setTimeout(() => {
        body.push(Uint8Array.from([4, 5, 6]));
        compression?.flush();
        body.end();
      }, 100);
      return ZenResponse.create(body, {
        headers: { 'content-type': 'application/octet-stream' },
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
  expect(message).toMatchInlineSnapshot(`
    {
      "done": false,
      "value": Uint8Array [
        1,
        2,
        3,
      ],
    }
  `);
  const message2 = await reader.read();
  expect(message2).toMatchInlineSnapshot(`
    {
      "done": false,
      "value": Uint8Array [
        4,
        5,
        6,
      ],
    }
  `);

  await close();
});
