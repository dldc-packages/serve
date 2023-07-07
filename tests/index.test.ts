import { expect, test } from 'vitest';
import {
  ErrorToHttpError,
  HttpErrorToTextResponse,
  HttpMethod,
  NotFound,
  ZenResponse,
  compose,
  createNodeServer,
  noContent,
} from '../src/mod';
import { mountServer } from './utils/mountServer';

test('create a server without crashing', () => {
  expect(() => createNodeServer(() => noContent())).not.toThrowError();
});

test('simple text response', async () => {
  const server = createNodeServer(() => ZenResponse.create('Hey'));
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
  const server = createNodeServer(() => ZenResponse.create('Hey'));
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
  const server = createNodeServer(() => ZenResponse.create('Hey'));
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
  const server = createNodeServer(() => ZenResponse.create('Hey'));
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
  const server = createNodeServer(() => noContent());
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

test('throw HttpError return an error', async () => {
  const server = createNodeServer(
    compose(HttpErrorToTextResponse(), () => {
      throw NotFound.create();
    }),
  );
  const { close, url, fetch } = await mountServer(server);
  const res = await fetch(url);
  expect(res).toMatchInlineSnapshot(`
    HTTP/1.1 404 Not Found
    Connection: close
    Content-Type: text/plain;charset=UTF-8
    Date: Xxx, XX Xxx XXXX XX:XX:XX GMT
    Transfer-Encoding: chunked
  `);
  expect(await res.text()).toEqual('Error 404 Not Found');
  await close();
});

test('throw return an error', async () => {
  const server = createNodeServer(
    compose(HttpErrorToTextResponse(), ErrorToHttpError(), () => {
      throw new Error('Oops');
    }),
  );
  const { close, url, fetch } = await mountServer(server);
  const res = await fetch(url);
  expect(res).toMatchInlineSnapshot(`
    HTTP/1.1 500 Internal Server Error
    Connection: close
    Content-Type: text/plain;charset=UTF-8
    Date: Xxx, XX Xxx XXXX XX:XX:XX GMT
    Transfer-Encoding: chunked
  `);
  expect(await res.text()).toEqual('Error 500 Oops');
  await close();
});
