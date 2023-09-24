import { Erreur } from '@dldc/erreur';
import type { Middleware } from '../core/mod';
import { HttpError, ZenResponse } from '../core/mod';

/**
 * Handle HttpError and respond with a Text reponse
 */
export function HttpErrorToTextResponse(): Middleware {
  return async (ctx, next) => {
    try {
      return await next(ctx);
    } catch (error) {
      const err = Erreur.createFromUnknown(error);
      const httpError = err.get(HttpError.Key.Consumer);
      if (httpError) {
        return ZenResponse.create(`Error ${httpError.code} ${httpError.message}`, { status: httpError.code });
      }
      throw error;
    }
  };
}
