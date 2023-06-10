import { describe, expect, test } from 'vitest';
import {
  ContentType,
  ErrorToHttpError,
  GetJsonBodyKeyConsumer,
  HttpErrorToJsonResponse,
  HttpErrorToTextResponse,
  HttpErrors,
  HttpHeader,
  HttpMethod,
  InvalidResponseToHttpError,
  JsonParser,
  compose,
  createServer,
  json,
} from '../src';
import { mountServer } from './utils/mountServer';

function JsonPackage() {
  return compose(HttpErrorToJsonResponse(), ErrorToHttpError(), InvalidResponseToHttpError(), JsonParser());
}

describe('Server', () => {
  test('parse JSON body', async () => {
    const server = createServer(
      compose(HttpErrorToTextResponse(), ErrorToHttpError(), JsonParser(), async (ctx) => {
        const body = await ctx.getOrFail(GetJsonBodyKeyConsumer)();
        return json({ body });
      })
    );
    const { close, url, fetch } = await mountServer(server);
    const res = await fetch(url, {
      method: HttpMethod.POST,
      body: JSON.stringify({ name: 'Perceval', alias: 'Provençal le Gaulois' }),
      headers: {
        [HttpHeader.ContentType]: ContentType.format('application/json'),
      },
    });
    expect(res).toMatchInlineSnapshot(`
      HTTP/1.1 200 OK
      Connection: close
      Content-Type: application/json; charset=utf-8
      Date: Xxx, XX Xxx XXXX XX:XX:XX GMT
      Transfer-Encoding: chunked
    `);
    expect(await res.json()).toEqual({ body: { name: 'Perceval', alias: 'Provençal le Gaulois' } });
    await close();
  });

  test('JsonPackage handle JsonResponse', async () => {
    const server = createServer(
      compose(JsonPackage(), () => {
        return json({ foo: 'bar' });
      })
    );
    const { close, url, fetch } = await mountServer(server);
    const res5 = await fetch(url);
    expect(res5).toMatchInlineSnapshot(`
      HTTP/1.1 200 OK
      Connection: close
      Content-Type: application/json; charset=utf-8
      Date: Xxx, XX Xxx XXXX XX:XX:XX GMT
      Transfer-Encoding: chunked
    `);
    expect(await res5.json()).toEqual({ foo: 'bar' });
    await close();
  });

  test('JsonPackage handle no response', async () => {
    const server = createServer(compose(JsonPackage()));
    const { close, url, fetch } = await mountServer(server);

    const res1 = await fetch(url);
    expect(res1).toMatchInlineSnapshot(`
      HTTP/1.1 500 Internal Server Error
      Connection: close
      Content-Type: application/json; charset=utf-8
      Date: Xxx, XX Xxx XXXX XX:XX:XX GMT
      Transfer-Encoding: chunked
    `);
    expect(await res1.json()).toEqual({ code: 500, message: 'Internal Server Error: Server did not respond' });

    await close();
  });

  test('JsonPackage convert text to Json', async () => {
    const server = createServer(
      compose(JsonPackage(), () => {
        return json('Hello');
      })
    );
    const { close, url, fetch } = await mountServer(server);

    const res2 = await fetch(url);
    expect(res2).toMatchInlineSnapshot(`
      HTTP/1.1 200 OK
      Connection: close
      Content-Type: application/json; charset=utf-8
      Date: Xxx, XX Xxx XXXX XX:XX:XX GMT
      Transfer-Encoding: chunked
    `);
    expect(await res2.text()).toEqual('"Hello"');

    await close();
  });

  test('JsonPackage handle HttpError and convert them to json', async () => {
    const server = createServer(
      compose(JsonPackage(), () => {
        throw HttpErrors.NotFound.instantiate();
      })
    );
    const { close, url, fetch } = await mountServer(server);

    const res3 = await fetch(url);
    expect(res3).toMatchInlineSnapshot(`
      HTTP/1.1 404 Not Found
      Connection: close
      Content-Type: application/json; charset=utf-8
      Date: Xxx, XX Xxx XXXX XX:XX:XX GMT
      Transfer-Encoding: chunked
    `);
    expect(await res3.json()).toEqual({ code: 404, message: 'Not Found' });

    await close();
  });

  test('JsonPackage handle Error and convert them to json', async () => {
    const server = createServer(
      compose(JsonPackage(), () => {
        throw new Error('Oops');
      })
    );
    const { close, url, fetch } = await mountServer(server);

    const res4 = await fetch(url);
    expect(res4).toMatchInlineSnapshot(`
      HTTP/1.1 500 Internal Server Error
      Connection: close
      Content-Type: application/json; charset=utf-8
      Date: Xxx, XX Xxx XXXX XX:XX:XX GMT
      Transfer-Encoding: chunked
    `);
    expect(await res4.json()).toEqual({ code: 500, message: 'Internal Server Error: Oops' });

    await close();
  });

  // test('JsonPackage works with Cookies', async () => {
  //   const server = createServer(
  //     compose(JsonPackage(), CookieManager(), (ctx) => {
  //       ctx.getOrFail(CookieManagerConsumer).set('token', 'AZERTYUIO');
  //       return JsonResponse.create({ foo: 'bar' });
  //     })
  //   );
  //   const { close, url, fetch } = await mountServer(server);

  //   const res = await fetch(url);
  //   expect(res).toMatchInlineSnapshot(`
  //     HTTP/1.1 200 OK
  //     Connection: close
  //     Content-Length: 13
  //     Content-Type: application/json
  //     Date: Xxx, XX Xxx XXXX XX:XX:XX GMT
  //     Set-Cookie: token=AZERTYUIO; Path=/; HttpOnly
  //   `);
  //   expect(await res.json()).toEqual({ foo: 'bar' });

  //   await close();
  // });

  test('JsonPackage can read Json body', async () => {
    const server = createServer(
      compose(JsonPackage(), async (ctx) => {
        const body = await ctx.getOrFail(GetJsonBodyKeyConsumer)();
        return json(body);
      })
    );
    const { close, url, fetch } = await mountServer(server);

    const res = await fetch(url, {
      headers: { 'content-type': 'application/json' },
      body: '{"done":false}',
      method: 'POST',
    });

    expect(res).toMatchInlineSnapshot(`
      HTTP/1.1 200 OK
      Connection: close
      Content-Type: application/json; charset=utf-8
      Date: Xxx, XX Xxx XXXX XX:XX:XX GMT
      Transfer-Encoding: chunked
    `);
    expect(await res.json()).toEqual({ done: false });

    await close();
  });

  test('JsonPackage can read Json with Axio PUT', async () => {
    const server = createServer(
      compose(JsonPackage(), async (ctx) => {
        const body = await ctx.getOrFail(GetJsonBodyKeyConsumer)();
        return json(body);
      })
    );
    const { close, url, fetch } = await mountServer(server);

    const res = await fetch(url, {
      headers: {
        accept: 'application/json, text/plain, */*',
        'accept-language': 'fr-FR,fr;q=0.9,en-US;q=0.8,en;q=0.7',
        'cache-control': 'no-cache',
        'content-type': 'application/json;charset=UTF-8',
        pragma: 'no-cache',
        'sec-fetch-dest': 'empty',
        'sec-fetch-mode': 'cors',
        'sec-fetch-site': 'cross-site',
      },
      body: '{"done":false}',
      method: 'PUT',
    });

    expect(res).toMatchInlineSnapshot(`
      HTTP/1.1 200 OK
      Connection: close
      Content-Type: application/json; charset=utf-8
      Date: Xxx, XX Xxx XXXX XX:XX:XX GMT
      Transfer-Encoding: chunked
    `);
    expect(await res.json()).toEqual({ done: false });

    await close();
  });
});
