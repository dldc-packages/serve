import type { Server } from 'node:http';
import { createServer as createHttpServer } from 'node:http';
import type { Middleware } from '../core/compose';
import type { CreateNodeHandlerOptions } from './createNodeHandler';
import { createNodeHandler } from './createNodeHandler';

export function createNodeServer(middleware: Middleware, options?: CreateNodeHandlerOptions): Server {
  return createHttpServer(createNodeHandler(middleware, options));
}
