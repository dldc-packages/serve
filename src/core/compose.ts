import * as miid from "@dldc/compose";
import type { ZenContext } from "./ZenContext.ts";
import type { ZenResponse } from "./ZenResponse.ts";

export type MaybePromise<T> = T | Promise<T>;
export type ZenResult = ZenResponse;

export type Middleware = miid.IMiddleware<
  ZenContext,
  MaybePromise<ZenResult>,
  Promise<ZenResponse>
>;
export type Middlewares = miid.IMiddlewares<
  ZenContext,
  MaybePromise<ZenResult>,
  Promise<ZenResponse>
>;
export type Next = miid.INext<ZenContext, Promise<ZenResponse>>;

export function compose(...mids: Array<Middleware | null>): Middleware {
  return miid.composeAdvanced(async (out) => {
    return await out;
  }, mids);
}
