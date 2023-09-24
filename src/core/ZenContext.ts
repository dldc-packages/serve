import type { IKeyProvider, TStackCoreValue } from '@dldc/stack';
import { Key, Stack } from '@dldc/stack';
import type { ReadableStream } from 'node:stream/web';
import type { Headers, Request } from 'undici';
import type { HttpMethod } from './HttpMethod';

const RequestKey = Key.create<Request>('Request');

export class ZenContext extends Stack {
  static fromRequest(request: Request): ZenContext {
    return new ZenContext().with(RequestKey.Provider(request));
  }

  static readonly RequestKey = RequestKey;

  static create(...keys: IKeyProvider<any, boolean>[]): ZenContext {
    return new ZenContext().with(...keys);
  }

  protected instantiate(stackCore: TStackCoreValue): this {
    return new ZenContext(stackCore) as any;
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
