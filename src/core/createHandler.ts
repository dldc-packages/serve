import { IncomingMessage, RequestListener, ServerResponse } from 'node:http';
import { errors } from 'undici';
import { ZenContext } from './ZenContext';
import { ZenResponse } from './ZenResponse';
import { Middleware } from './compose';
import { getRequest, setResponse } from './interrop';

export interface CreateHandlerOptions {
  base?: string;
}

export function createHandler(
  middleware: Middleware,
  { base = 'http://server.localhost' }: CreateHandlerOptions = {}
): RequestListener {
  return async (req, res) => {
    const zenResponse = await getZenResponse(req, res);
    const response = ZenResponse.toResponse(zenResponse);
    await setResponse(res, response);
  };

  async function getZenResponse(req: IncomingMessage, res: ServerResponse): Promise<ZenResponse> {
    try {
      const request = await getRequest(base, req, res);
      const zenContext = ZenContext.fromRequest(request);
      const zenResponse = await middleware(zenContext, async () => {
        throw new errors.UndiciError('No response was returned from the app');
      });
      return zenResponse;
    } catch (error) {
      // Handled error (throwing a response)
      if (error instanceof ZenResponse) {
        return error;
      }
      throw error;
    }
  }
}
