import { expect, test } from 'vitest';
import { HttpMethod, ZenResponse, createServer } from '../src';
import { mountServer } from './utils/mountServer';

test('create a server without crashing', () => {
  expect(() => createServer(() => ZenResponse.noContent())).not.toThrowError();
});

test('simple text response', async () => {
  const server = createServer(() => ZenResponse.create('Hey'));
  const { url, close, fetch } = await mountServer(server);
  const res = await fetch(url);
  expect(await res.text()).toBe('Hey');
  expect(res).toMatchInlineSnapshot(`
    HTTP/1.1 200 OK
    Connection: close
    Content-Type: text/plain;charset=UTF-8
    Date: Xxx, XX Xxx XXXX XX:XX:XX GMT
    Transfer-Encoding: chunked
  `);
  await close();
});

test('send two requests', async () => {
  const server = createServer(() => ZenResponse.create('Hey'));
  const { url, close, fetch } = await mountServer(server);

  const res = await fetch(url);
  expect(res).toMatchInlineSnapshot(`
    HTTP/1.1 200 OK
    Connection: close
    Content-Type: text/plain;charset=UTF-8
    Date: Xxx, XX Xxx XXXX XX:XX:XX GMT
    Transfer-Encoding: chunked
  `);
  const res2 = await fetch(url);
  expect(res2).toMatchInlineSnapshot(`
    HTTP/1.1 200 OK
    Connection: close
    Content-Type: text/plain;charset=UTF-8
    Date: Xxx, XX Xxx XXXX XX:XX:XX GMT
    Transfer-Encoding: chunked
  `);
  await close();
});

test('response to arbitrary path', async () => {
  const server = createServer(() => ZenResponse.create('Hey'));
  const { url, close, fetch } = await mountServer(server);

  const res = await fetch(`${url}${'/some/path'}`);
  expect(res).toMatchInlineSnapshot(`
    HTTP/1.1 200 OK
    Connection: close
    Content-Type: text/plain;charset=UTF-8
    Date: Xxx, XX Xxx XXXX XX:XX:XX GMT
    Transfer-Encoding: chunked
  `);
  expect(await res.text()).toBe('Hey');
  await close();
});

test('response to post method', async () => {
  const server = createServer(() => ZenResponse.create('Hey'));
  const { url, close, fetch } = await mountServer(server);

  const res = await fetch(url, { method: HttpMethod.POST });
  expect(res).toMatchInlineSnapshot(`
    HTTP/1.1 200 OK
    Connection: close
    Content-Type: text/plain;charset=UTF-8
    Date: Xxx, XX Xxx XXXX XX:XX:XX GMT
    Transfer-Encoding: chunked
  `);
  expect(await res.text()).toBe('Hey');
  await close();
});

test('head request return 204 & empty body', async () => {
  const server = createServer(() => ZenResponse.noContent());
  const { url, close, fetch } = await mountServer(server);

  const res = await fetch(url, {
    method: HttpMethod.HEAD,
  });
  expect(res).toMatchInlineSnapshot(`
    HTTP/1.1 204 No Content
    Connection: close
    Date: Xxx, XX Xxx XXXX XX:XX:XX GMT
  `);
  expect(await res.text()).toBe('');
  await close();
});
