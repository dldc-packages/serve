import { Middleware } from '../core/mod';
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
      if (logOnError) {
        const logger = ctx.get(LoggerConsumer);
        logger.error(error);
      }
      throw new Error('TODO');
      // if (HttpError.is(error)) {
      //   throw error;
      // }
      // if (logOnError) {
      //   const logger = ctx.get(LoggerConsumer);
      //   logger.error(error);
      // }
      // throw HttpErrors.Internal.instantiate(error);
    }
  };
}
