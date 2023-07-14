import { Erreur } from '@dldc/erreur';
import type { Middleware } from '../core/mod';
import { HttpError, InternalServerError } from '../core/mod';
import { LoggerConsumer } from '../mod';

export type ErrorToHttpErrorOptions = {
  logOnError?: boolean;
};

/**
 * Handle any error and convert it to an HttpError if it's not one
 */
export function ErrorToHttpError({ logOnError = true }: ErrorToHttpErrorOptions = {}): Middleware {
  return async (ctx, next) => {
    try {
      return await next(ctx);
    } catch (error) {
      const err = Erreur.fromUnknown(error);
      if (err.has(HttpError.Consumer)) {
        throw err;
      }
      if (logOnError) {
        const logger = ctx.get(LoggerConsumer);
        logger.error(error);
      }
      throw InternalServerError.create(err.message, err);
    }
  };
}
