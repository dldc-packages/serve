import { expect, test } from 'vitest';
import { Compression, compose, createServer, json } from '../src/mod';
import { mountServer } from './utils/mountServer';

test('gzip', async () => {
  const server = createServer(compose(Compression(), () => json({ hello: 'world' })));

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
  const server = createServer(compose(Compression(), () => json({ hello: 'world' })));
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
  const server = createServer(compose(Compression(), () => json({ hello: 'world' })));
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
