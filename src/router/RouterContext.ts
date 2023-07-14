import type { IChemin } from '@dldc/chemin';
import { Key } from '../core/mod';

export interface Params {
  [key: string]: unknown;
}

export interface RouterContext {
  params: Params;
  notFound: boolean;
  pattern: IChemin | null;
  get<P>(chemin: IChemin<P>): P | null;
  getOrFail<P>(chemin: IChemin<P>): P;
  has(chemin: IChemin): boolean;
}

export const RouterKey = Key.create<RouterContext>('Router');
export const RouterConsumer = RouterKey.Consumer;
