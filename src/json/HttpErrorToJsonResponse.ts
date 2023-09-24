import { Erreur } from '@dldc/erreur';
import type { Middleware } from '../core/mod';
import { HttpError } from '../core/mod';
import { LoggerConsumer } from '../logger/mod';
import { json } from './json';

export function HttpErrorToJsonResponse(): Middleware {
  return async (ctx, next) => {
    const logger = ctx.get(LoggerConsumer);
    try {
      return await next(ctx);
    } catch (error) {
      const err = Erreur.createFromUnknown(error);
      const httpError = err.get(HttpError.Key.Consumer);
      if (httpError) {
        logger.error(error);
        return json(httpError, { status: httpError.code });
      }
      throw error;
    }
  };
}
