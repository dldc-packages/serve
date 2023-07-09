import { Erreur } from '@dldc/erreur';
import { HttpError, Middleware, ZenResponse } from '../core/mod';

/**
 * Handle HttpError and respond with a Text reponse
 */
export function HttpErrorToTextResponse(): Middleware {
  return async (ctx, next) => {
    try {
      return await next(ctx);
    } catch (error) {
      const err = Erreur.fromUnknown(error);
      const httpError = err.get(HttpError.Consumer);
      if (httpError) {
        return ZenResponse.create(`Error ${httpError.code} ${httpError.message}`, { status: httpError.code });
      }
      throw error;
    }
  };
}
