import type { TKey, TKeyProvider, TStackCoreValue } from "@dldc/stack";
import { createKey, Stack } from "@dldc/stack";
import type { HttpMethod } from "./HttpMethod.ts";

const RequestKey: TKey<Request> = createKey<Request>("Request");

export class ZenContext extends Stack {
  static fromRequest(request: Request): ZenContext {
    return new ZenContext().with(RequestKey.Provider(request));
  }

  static readonly RequestKey = RequestKey;

  static create(...keys: TKeyProvider<any, boolean>[]): ZenContext {
    return new ZenContext().with(...keys);
  }

  protected override instantiate(stackCore: TStackCoreValue): this {
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
