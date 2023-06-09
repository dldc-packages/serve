import * as miid from 'miid';
import { ZenContext } from './ZenContext';
import { ZenResponse } from './ZenResponse';

export type MaybePromise<T> = T | Promise<T>;
export type ZenResult = ZenResponse;

export type Middleware = miid.Middleware<ZenContext, MaybePromise<ZenResult>, Promise<ZenResponse>>;
export type Middlewares = miid.Middlewares<
  ZenContext,
  MaybePromise<ZenResult>,
  Promise<ZenResponse>
>;
export type Next = miid.Next<ZenContext, Promise<ZenResponse>>;

export function compose(...mids: Array<Middleware | null>): Middleware {
  return miid.composeAdvanced(async (out) => {
    return await out;
  }, mids);
}