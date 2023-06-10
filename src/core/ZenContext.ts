import type { KeyProvider, StackInternal } from 'miid';
import { Stack, createKey } from 'miid';
import { ReadableStream } from 'node:stream/web';
import { Headers, Request } from 'undici';
import { HttpMethod } from './HttpMethod';

const RequestKey = createKey<Request>({ name: 'Request' });

export class ZenContext extends Stack {
  static fromRequest(request: Request): ZenContext {
    return new ZenContext().with(RequestKey.Provider(request));
  }

  static RequestKey = RequestKey;

  private constructor(internal: StackInternal<ZenContext> | null = null) {
    super(internal);
  }

  get request(): Request {
    return this.getOrFail(RequestKey.Consumer);
  }

  get headers(): Headers {
    return this.request.headers;
  }

  get method(): HttpMethod {
    return this.request.method.toUpperCase() as HttpMethod;
  }

  get body(): ReadableStream<any> | null {
    return this.request.body;
  }

  with(...keys: Array<KeyProvider<any>>): ZenContext {
    return Stack.applyKeys<ZenContext>(this, keys, (internal) => new ZenContext(internal));
  }
}
