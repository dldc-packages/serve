import type { Request, Response } from 'undici';
import { errors } from 'undici';
import { ZenContext } from './ZenContext';
import { ZenResponse } from './ZenResponse';
import type { Middleware } from './compose';

export interface CreateHandlerOptions {
  base?: string;
}

export type Handler = (req: Request) => Promise<Response>;

export function createHandler(middleware: Middleware): Handler {
  return async (request: Request): Promise<Response> => {
    try {
      const zenContext = ZenContext.fromRequest(request);
      const zenResponse = await middleware(zenContext, () => {
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
