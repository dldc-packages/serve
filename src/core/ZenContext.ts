import type { KeyProvider, StackInternal } from 'miid';
import { Stack, createKey } from 'miid';
import { Request } from 'undici';

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

  with(...keys: Array<KeyProvider<any>>): ZenContext {
    return Stack.applyKeys<ZenContext>(this, keys, (internal) => new ZenContext(internal));
  }
}
