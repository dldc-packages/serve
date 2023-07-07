import { expect, test } from 'vitest';
import { restore } from 'zenjson';
import { ErrorToHttpError, HttpErrorToZenjsonResponse, compose, createNodeServer, zenjson } from '../src/mod';
import { mountServer } from './utils/mountServer';

test('Send zenjson response', async () => {
  const date = new Date();
  const server = createNodeServer(
    compose(HttpErrorToZenjsonResponse(), ErrorToHttpError(), async () => {
      return zenjson({ date: date, infinity: Infinity, null: null });
    }),
  );

  const { close, url, fetch } = await mountServer(server);

  const res = await fetch(url);
  expect(res).toMatchInlineSnapshot(`
    HTTP/1.1 200 OK
    Connection: close
    Content-Type: application/json; charset=utf-8
    Date: Xxx, XX Xxx XXXX XX:XX:XX GMT
    Transfer-Encoding: chunked
  `);
  const result = restore(await res.json());
  expect(result).toEqual({
    date: date,
    infinity: Infinity,
    null: null,
  });
  await close();
});
