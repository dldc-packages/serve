import { toError } from '@dldc/erreur';
import { HttpErreur, type Middleware } from '../core/mod';
import { LoggerConsumer } from '../logger/mod';
import { json } from './json';

export function HttpErrorToJsonResponse(): Middleware {
  return async (ctx, next) => {
    const logger = ctx.get(LoggerConsumer);
    try {
      return await next(ctx);
    } catch (error) {
      const err = toError(error);
      const httpError = HttpErreur.get(err);
      if (httpError) {
        logger.error(error);
        return json(httpError, { status: httpError.code });
      }
      throw error;
    }
  };
}
