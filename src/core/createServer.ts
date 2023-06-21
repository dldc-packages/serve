import { Server, createServer as createHttpServer } from 'node:http';
import { Middleware } from './compose';
import { CreateHandlerOptions, createNodeHandler } from './createNodeHandler';

export function createServer(middleware: Middleware, options?: CreateHandlerOptions): Server {
  return createHttpServer(createNodeHandler(middleware, options));
}
