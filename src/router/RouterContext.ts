import { Chemin } from 'chemin';
import { Key } from '../core/mod';

export interface Params {
  [key: string]: unknown;
}

export interface RouterContext {
  params: Params;
  notFound: boolean;
  pattern: Chemin | null;
  get<P>(chemin: Chemin<P>): P | null;
  getOrFail<P>(chemin: Chemin<P>): P;
  has(chemin: Chemin): boolean;
}

export const RouterKey = Key.create<RouterContext>('Router');
export const RouterConsumer = RouterKey.Consumer;
