import { RequestListener } from 'node:http';
import { Middleware } from '../core/compose';
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
  return async (req, res) => {
    const request = await getRequestFromReqRes(base, req, res);
    const response = await handler(request);
    await setResponse(res, response);
  };
}
