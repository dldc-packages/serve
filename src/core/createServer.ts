import { Server, createServer as createHttpServer } from 'node:http';
import { Middleware } from './compose';
import { CreateHandlerOptions, createHandler } from './createHandler';

export function createServer(middleware: Middleware, options?: CreateHandlerOptions): Server {
  return createHttpServer(createHandler(middleware, options));
}
