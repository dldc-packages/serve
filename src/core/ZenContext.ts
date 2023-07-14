import type { KeyProvider, StaackCoreValue } from '@dldc/stack';
import { Key, Staack } from '@dldc/stack';
import type { ReadableStream } from 'node:stream/web';
import type { Headers, Request } from 'undici';
import type { HttpMethod } from './HttpMethod';

const RequestKey = Key.create<Request>('Request');

export class ZenContext extends Staack {
  static fromRequest(request: Request): ZenContext {
    return new ZenContext().with(RequestKey.Provider(request));
  }

  static RequestKey = RequestKey;

  static create(...keys: KeyProvider<any, boolean>[]): ZenContext {
    return new ZenContext().with(...keys);
  }

  protected instantiate(staackCore: StaackCoreValue): this {
    return new ZenContext(staackCore) as any;
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
}
