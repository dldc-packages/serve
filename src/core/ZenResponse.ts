import type { KeyProvider, StackInternal } from 'miid';
import { Stack, createKey } from 'miid';
import { BodyInit, Headers, Response, ResponseInit } from 'undici';

const BodyKey = createKey<BodyInit>({ name: 'Body' });
const HeadersKey = createKey<Headers>({ name: 'Headers' });
const StatusKey = createKey<number>({ name: 'Status' });
const StatusTextKey = createKey<string>({ name: 'StatusText' });
const RedirectKey = createKey<{ url: string; status: number }>({ name: 'Redirect' });

// import { sanitize } from "zenjson";
// const ZenjsonKey = createKey<unknown>({ name: "Zenjson" });

// static toRemixResponse(res: ZenResponse): Response {
//   return new Response(res.body, {
//     headers: res.headers,
//     status: res.status,
//     statusText: res.statusText,
//   });
// }

// static zenjson<Data = unknown>(data: Data, init: number | ResponseInit = {}): ZenResponse {
//   return ZenResponse.json(sanitize(data), init).with(ZenjsonKey.Provider(data));
// }

export class ZenResponse extends Stack {
  static create(body?: BodyInit | null, init?: ResponseInit): ZenResponse {
    const providers = [
      HeadersKey.Provider(new Headers(init?.headers)),
      body ? BodyKey.Provider(body) : null,
      init?.status ? StatusKey.Provider(init.status) : null,
      init?.statusText ? StatusTextKey.Provider(init.statusText) : null,
    ].filter((v): v is NonNullable<typeof v> => v !== null);
    return new ZenResponse().with(...providers);
  }

  static toResponse(res: ZenResponse): Response {
    return new Response(res.body, {
      headers: res.headers,
      status: res.status,
      statusText: res.statusText,
    });
  }

  static BodyKey = BodyKey;
  static HeadersKey = HeadersKey;
  static StatusKey = StatusKey;
  static StatusTextKey = StatusTextKey;
  static RedirectKey = RedirectKey;

  private constructor(internal: StackInternal<ZenResponse> | null = null) {
    super(internal);
  }

  get body(): BodyInit | null {
    return this.get(BodyKey.Consumer);
  }

  get headers(): Headers {
    return this.getOrFail(HeadersKey.Consumer);
  }

  get status(): number | undefined {
    return this.get(StatusKey.Consumer) ?? undefined;
  }

  get statusText(): string | undefined {
    return this.get(StatusTextKey.Consumer) ?? undefined;
  }

  with(...keys: Array<KeyProvider<any>>): ZenResponse {
    return Stack.applyKeys<ZenResponse>(this, keys, (internal) => new ZenResponse(internal));
  }

  /**
   * Utils to update headers
   */
  withHeaders(update: (prev: Headers) => Headers): ZenResponse {
    const existingHeaders = this.headers;
    const nextHeaders = update(existingHeaders);
    if (nextHeaders === existingHeaders) {
      return this;
    }
    return this.with(HeadersKey.Provider(nextHeaders));
  }
}

export function redirect(url: string, init: number | ResponseInit = 302): ZenResponse {
  const status = typeof init === 'number' ? init : init.status ?? 302;

  let responseInit: ResponseInit = typeof init === 'number' ? {} : init;
  if (typeof responseInit.status === 'undefined') {
    responseInit = { ...responseInit, status };
  }

  const headers = new Headers(responseInit.headers);
  headers.set('Location', url);

  return ZenResponse.create(null, { ...responseInit, headers }).with(RedirectKey.Provider({ url, status }));
}

export function noContent(init: ResponseInit = {}): ZenResponse {
  return ZenResponse.create(null, { ...init, status: 204 });
}
