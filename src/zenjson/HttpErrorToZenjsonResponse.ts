import { Erreur } from '@dldc/erreur';
import { HttpError, Middleware } from '../core/mod';
import { LoggerConsumer } from '../logger/mod';
import { zenjson } from './zenjson';

export function HttpErrorToZenjsonResponse(): Middleware {
  return async (ctx, next) => {
    const logger = ctx.get(LoggerConsumer);
    try {
      return await next(ctx);
    } catch (error) {
      const err = Erreur.fromUnknown(error);
      const httpError = err.get(HttpError.Consumer);
      if (httpError) {
        logger.error(error);
        return zenjson(httpError, { status: httpError.code });
      }
      throw error;
    }
  };
}
