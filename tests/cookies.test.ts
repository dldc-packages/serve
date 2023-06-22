import { expect, test } from 'vitest';
import {
  CookieManager,
  CookieManagerConsumer,
  ErrorToHttpError,
  HttpErrorToTextResponse,
  NotFound,
  SetCookie,
  compose,
  createNodeServer,
  noContent,
  withCookies,
} from '../src/mod';
import { mountServer } from './utils/mountServer';

test('should set the Set-Cookie header', async () => {
  const app = createNodeServer(() => {
    return withCookies(noContent(), [SetCookie.create('token', 'T55YTRR55554')]);
  });
  const { close, url, fetch } = await mountServer(app);
  const res = await fetch(url);
  expect(res).toMatchInlineSnapshot(`
    HTTP/1.1 204 No Content
    Connection: close
    Date: Xxx, XX Xxx XXXX XX:XX:XX GMT
    Set-Cookie: token=T55YTRR55554; Path=/; HttpOnly
  `);
  await close();
});

test('should set the Set-Cookie header using Manager', async () => {
  const app = createNodeServer(
    compose(CookieManager(), (ctx) => {
      ctx.getOrFail(CookieManagerConsumer).set('token', 'T55YTRR55554');
      return noContent();
    })
  );
  const { close, url, fetch } = await mountServer(app);
  const res = await fetch(url);
  expect(res).toMatchInlineSnapshot(`
    HTTP/1.1 204 No Content
    Connection: close
    Date: Xxx, XX Xxx XXXX XX:XX:XX GMT
    Set-Cookie: token=T55YTRR55554; Path=/; HttpOnly
  `);
  await close();
});

test('should set two Set-Cookie header using Manager', async () => {
  const app = createNodeServer(
    compose(CookieManager(), (ctx) => {
      const cookieManager = ctx.getOrFail(CookieManagerConsumer);
      cookieManager.set('token', 'T55YTRR55554');
      cookieManager.set('user', 'etienne');
      return noContent();
    })
  );
  const { close, url, fetch } = await mountServer(app);
  const res = await fetch(url);
  expect(res).toMatchInlineSnapshot(`
    HTTP/1.1 204 No Content
    Connection: close
    Date: Xxx, XX Xxx XXXX XX:XX:XX GMT
    Set-Cookie: token=T55YTRR55554; Path=/; HttpOnly, user=etienne; Path=/; HttpOnly
  `);
  await close();
});

test('should return the same result as koa', async () => {
  const app = createNodeServer(() => {
    return withCookies(noContent(), [SetCookie.create('token', 'T55YTRR55554')]);
  });

  const { close, url, fetch } = await mountServer(app);

  const res = await fetch(url);

  expect(res).toMatchInlineSnapshot(`
    HTTP/1.1 204 No Content
    Connection: close
    Date: Xxx, XX Xxx XXXX XX:XX:XX GMT
    Set-Cookie: token=T55YTRR55554; Path=/; HttpOnly
  `);

  await close();
});

test('should return the same result as koa when deleting cookie', async () => {
  const app = createNodeServer(() => {
    return withCookies(noContent(), [SetCookie.delete('token')]);
  });
  const { close, url, fetch } = await mountServer(app);
  const res = await fetch(url);

  expect(res).toMatchInlineSnapshot(`
    HTTP/1.1 204 No Content
    Connection: close
    Date: Xxx, XX Xxx XXXX XX:XX:XX GMT
    Set-Cookie: token=; Expires=Thu, 01 Jan 1970 00:00:00 GMT; Path=/; HttpOnly
  `);

  await close();
});

test('Cookie manager should set and delete cookies', async () => {
  const app = createNodeServer(
    compose(CookieManager(), (ctx) => {
      const manager = ctx.getOrFail(CookieManagerConsumer);
      manager.set('new-cookie', 'value');
      manager.delete('deleted-cookie');
      return noContent();
    })
  );

  const { close, url, fetch } = await mountServer(app);
  const res = await fetch(url);

  expect(res).toMatchInlineSnapshot(`
    HTTP/1.1 204 No Content
    Connection: close
    Date: Xxx, XX Xxx XXXX XX:XX:XX GMT
    Set-Cookie: new-cookie=value; Path=/; HttpOnly, deleted-cookie=; Expires=Thu, 01 Jan 1970 00:00:00 GMT; Path=/; HttpOnly
  `);

  await close();
});

test('Cookies should not be set on error response', async () => {
  const app = createNodeServer(
    compose(HttpErrorToTextResponse(), ErrorToHttpError(), CookieManager(), (ctx) => {
      const manager = ctx.getOrFail(CookieManagerConsumer);
      manager.set('new-cookie', 'value');
      manager.delete('deleted-cookie');
      throw NotFound.create();
    })
  );
  const { url, close, fetch } = await mountServer(app);
  const res = await fetch(url);
  expect(res).toMatchInlineSnapshot(`
    HTTP/1.1 404 Not Found
    Connection: close
    Content-Type: text/plain;charset=UTF-8
    Date: Xxx, XX Xxx XXXX XX:XX:XX GMT
    Transfer-Encoding: chunked
  `);

  await close();
});
