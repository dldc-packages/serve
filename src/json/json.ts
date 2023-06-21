import { Headers, ResponseInit } from 'undici';
import { Key, ZenResponse } from '../core/mod';

const JsonKey = Key.create<unknown>('Json');

export function json<Data = unknown>(data: Data, init: number | ResponseInit = {}): ZenResponse {
  const responseInit = typeof init === 'number' ? { status: init } : init;

  const headers = new Headers(responseInit.headers);
  if (!headers.has('Content-Type')) {
    headers.set('Content-Type', 'application/json; charset=utf-8');
  }

  return ZenResponse.create(JSON.stringify(data), { ...responseInit, headers }).with(JsonKey.Provider(data));
}
