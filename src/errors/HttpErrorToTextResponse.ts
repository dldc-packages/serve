import { HttpError, Middleware, ZenResponse } from '../core';

/**
 * Handle HttpError and respond with a Text reponse
 */
export function HttpErrorToTextResponse(): Middleware {
  return async (ctx, next) => {
    try {
      return await next(ctx);
    } catch (error) {
      const httpError = HttpError.match(error);
      if (httpError) {
        return ZenResponse.create(`Error ${httpError.code} ${httpError.message}`, { status: httpError.code });
      }
      throw error;
    }
  };
}
