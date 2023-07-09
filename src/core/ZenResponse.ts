import { Key, Staack, StaackCoreValue } from '@dldc/stack';
import { BodyInit, Headers, Response, ResponseInit } from 'undici';

const BodyKey = Key.create<BodyInit>('Body');
const HeadersKey = Key.create<Headers>('Headers');
const StatusKey = Key.create<number>('Status');
const StatusTextKey = Key.create<string>('StatusText');
const RedirectKey = Key.create<{ url: string; status: number }>('Redirect');

export class ZenResponse extends Staack {
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

  protected instantiate(staackCore: StaackCoreValue): this {
    return new ZenResponse(staackCore) as any;
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
