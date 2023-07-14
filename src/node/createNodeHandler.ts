import type { RequestListener } from 'node:http';
import type { Middleware } from '../core/compose';
import { createHandler } from '../core/createHandler';
import { getRequestFromReqRes, setResponse } from './interrop';

export interface CreateNodeHandlerOptions {
  base?: string;
}

export function createNodeHandler(
  middleware: Middleware,
  { base = 'http://server.localhost' }: CreateNodeHandlerOptions = {},
): RequestListener {
  const handler = createHandler(middleware);
  return (req, res) => {
    void (async () => {
      const request = getRequestFromReqRes(base, req, res);
      const response = await handler(request);
      await setResponse(res, response);
    })();
  };
}
