import { Key, ZenResponse } from '../core/mod';

export const SkipRouteKey = Key.createEmpty('SkipRoute');

export function skipRoute() {
  return ZenResponse.create(null, { status: 404 }).with(SkipRouteKey.Provider());
}
