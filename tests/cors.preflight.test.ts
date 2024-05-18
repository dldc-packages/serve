import type { CorsPreflightConfig } from "../mod.ts";
import {
  compose,
  CorsPreflight,
  createHandler,
  createHttpErreur,
  ErrorToHttpError,
  HttpErrorToTextResponse,
  HttpMethod,
  ZenResponse,
} from "../mod.ts";
import { expectHeaders } from "./utils/expectHeaders.ts";
import { mountServer } from "./utils/mountServer.ts";

function createCorsHandler(config: CorsPreflightConfig = {}) {
  return createHandler(
    compose(
      CorsPreflight(config),
      HttpErrorToTextResponse(),
      ErrorToHttpError({ logOnError: false }),
      (ctx) => {
        if (ctx.method === HttpMethod.POST) {
          return ZenResponse.create("Hello");
        }
        throw createHttpErreur(405);
      },
    ),
  );
}

Deno.test("6.2.1 Does not set headers if Origin is missing", async () => {
  const app = createCorsHandler({
    allowOrigin: ["http://api.myapp.com", "http://www.myapp.com"],
  });
  const { url, close, fetch } = mountServer(app);
  const res = await fetch(url, {
    headers: {},
  });
  expectHeaders(
    res,
    `
      HTTP/1.1 405 Method Not Allowed
      Content-Length: 28
      Content-Type: text/plain;charset=UTF-8
      Date: Xxx, XX Xxx XXXX XX:XX:XX GMT
      Vary: Accept-Encoding
    `,
  );
  await res.body?.cancel();
  await close();
});

Deno.test("6.2.2 Does not set headers if Origin does not match", async () => {
  const app = createCorsHandler({
    allowOrigin: ["http://api.myapp.com", "http://www.myapp.com"],
  });
  const { url, close, fetch } = mountServer(app);
  const res = await fetch(url, {
    method: "POST",
    headers: {
      Origin: "http://random-website.com",
    },
  });
  expectHeaders(
    res,
    `
      HTTP/1.1 200 OK
      Content-Length: 5
      Content-Type: text/plain;charset=UTF-8
      Date: Xxx, XX Xxx XXXX XX:XX:XX GMT
      Vary: Accept-Encoding
    `,
  );
  await res.body?.cancel();
  await close();
});

Deno.test("6.2.3 Does not set headers if Access-Control-Request-Method is missing", async () => {
  const app = createCorsHandler({
    allowOrigin: ["http://api.myapp.com", "http://www.myapp.com"],
  });
  const { url, close, fetch } = mountServer(app);
  const res = await fetch(url, {
    method: "POST",
    headers: {
      Origin: "http://api.myapp.com",
    },
  });
  expectHeaders(
    res,
    `
      HTTP/1.1 200 OK
      Content-Length: 5
      Content-Type: text/plain;charset=UTF-8
      Date: Xxx, XX Xxx XXXX XX:XX:XX GMT
      Vary: Accept-Encoding
    `,
  );
  await res.body?.cancel();
  await close();
});

// xit('6.2.4 Does not terminate if parsing of Access-Control-Request-Headers fails', function(done) {
//   done();
// });
// xit('6.2.5 Always matches Access-Control-Request-Method (spec says it is acceptable)', function(done) {
//   done();
// });

Deno.test("6.2.6 Does not set headers if Access-Control-Request-Headers does not match", async () => {
  const app = createCorsHandler({
    allowOrigin: ["http://api.myapp.com", "http://www.myapp.com"],
    allowHeaders: ["API-Token"],
  });
  const { url, close, fetch } = mountServer(app);
  const res = await fetch(url, {
    method: "POST",
    headers: {
      Origin: "http://api.myapp.com",
      "Access-Control-Request-Headers": "Weird-Header",
    },
  });
  expectHeaders(
    res,
    `
      HTTP/1.1 200 OK
      Content-Length: 5
      Content-Type: text/plain;charset=UTF-8
      Date: Xxx, XX Xxx XXXX XX:XX:XX GMT
      Vary: Accept-Encoding
    `,
  );
  await res.body?.cancel();
  await close();
});

Deno.test("6.2.7 Set the Allow-Origin header if it matches", async () => {
  const app = createCorsHandler({
    allowOrigin: ["http://api.myapp.com", "http://www.myapp.com"],
  });
  const { url, close, fetch } = mountServer(app);
  const res = await fetch(url, {
    method: "OPTIONS",
    headers: {
      Origin: "http://api.myapp.com",
      "Access-Control-Request-Method": "GET",
    },
  });
  expectHeaders(
    res,
    `
      HTTP/1.1 200 OK
      Access-Control-Allow-Headers: X-Requested-With, Access-Control-Allow-Origin, X-Http-Method-Override, Content-Type, Authorization, Accept
      Access-Control-Allow-Methods: POST, GET, PUT, PATCH, DELETE, OPTIONS
      Access-Control-Allow-Origin: http://api.myapp.com
      Access-Control-Max-Age: 86400
      Content-Length: 0
      Date: Xxx, XX Xxx XXXX XX:XX:XX GMT
    `,
  );
  await res.body?.cancel();
  await close();
});

// it('6.2.8 Set the Access-Control-Max-Age header if a max age is provided', function(done) {
//   var server = test.corsServer({
//     preflightMaxAge: 5,
//     origins: ['http://api.myapp.com', 'http://www.myapp.com'],
//   });
//   request(server)
//     .options('/test')
//     .set('Origin', 'http://api.myapp.com')
//     .set('Access-Control-Request-Method', 'GET')
//     .expect('Access-Control-Max-Age', '5')
//     .expect(204)
//     .end(done);
// });
// it('6.2.9 Set the Allow-Method header', function(done) {
//   var server = test.corsServer({
//     origins: ['http://api.myapp.com', 'http://www.myapp.com'],
//   });
//   request(server)
//     .options('/test')
//     .set('Origin', 'http://api.myapp.com')
//     .set('Access-Control-Request-Method', 'GET')
//     .expect('Access-Control-Allow-Methods', 'GET, OPTIONS')
//     .expect(204)
//     .end(done);
// });
// it('6.2.10 Set the Allow-Headers to all configured custom headers', function(done) {
//   var server = test.corsServer({
//     origins: ['http://api.myapp.com', 'http://www.myapp.com'],
//     allowHeaders: ['HeaderA'],
//   });
//   request(server)
//     .options('/test')
//     .set('Origin', 'http://api.myapp.com')
//     .set('Access-Control-Request-Method', 'GET')
//     .expect('Access-Control-Allow-Headers', /accept-version/) // restify defaults
//     .expect('Access-Control-Allow-Headers', /x-api-version/) // restify defaults
//     .expect('Access-Control-Allow-Headers', /HeaderA/) // custom header
//     .expect(204)
//     .end(done);
// });
// it('[Not in spec] The Allow-Headers should not contain duplicates', function(done) {
//   var server = test.corsServer({
//     origins: ['http://api.myapp.com', 'http://www.myapp.com'],
//   });
//   request(server)
//     .options('/test')
//     .set('Origin', 'http://api.myapp.com')
//     .set('Access-Control-Request-Method', 'GET')
//     .expect(204)
//     .then(function(request) {
//       var allowHeaders = request.headers['access-control-allow-headers'].split(', ');
//       if (new Set(allowHeaders).size !== allowHeaders.length) {
//         return done(new Error('duplicate header detected'));
//       }
//       done(null);
//     });
// });
