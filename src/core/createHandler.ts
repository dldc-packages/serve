import { Request, Response, errors } from 'undici';
import { ZenContext } from './ZenContext';
import { ZenResponse } from './ZenResponse';
import { Middleware } from './compose';

export interface CreateHandlerOptions {
  base?: string;
}

export type Handler = (req: Request) => Promise<Response>;

export function createHandler(middleware: Middleware): Handler {
  return async (request: Request): Promise<Response> => {
    try {
      const zenContext = ZenContext.fromRequest(request);
      const zenResponse = await middleware(zenContext, async () => {
        throw new errors.UndiciError('Server did not respond');
      });
      return ZenResponse.toResponse(zenResponse);
    } catch (error) {
      // Handled error (throwing a response)
      if (error instanceof ZenResponse) {
        return ZenResponse.toResponse(error);
      }
      throw error;
    }
  };
}
