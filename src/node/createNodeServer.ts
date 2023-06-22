import { Server, createServer as createHttpServer } from 'node:http';
import { Middleware } from '../core/compose';
import { CreateNodeHandlerOptions, createNodeHandler } from './createNodeHandler';

export function createNodeServer(middleware: Middleware, options?: CreateNodeHandlerOptions): Server {
  return createHttpServer(createNodeHandler(middleware, options));
}
