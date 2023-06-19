import { HttpErrors, Middleware, ZenResponse } from '../core/mod';
import { LoggerConsumer } from '../logger/mod';

/**
 * Return a Valid Repsonse or throw an HttpError
 */
export function InvalidResponseToHttpError(): Middleware {
  return async (ctx, next) => {
    const logger = ctx.get(LoggerConsumer);
    const response = await next(ctx);
    if (response === null || response === undefined) {
      const err = HttpErrors.ServerDidNotRespond.instantiate();
      logger.error(err);
      throw err;
    }
    if (response instanceof ZenResponse === false) {
      const err = HttpErrors.Internal.instantiate(
        `The returned response is not valid (does not inherit the TumauResponse class)`
      );
      logger.info(response);
      logger.error(err);
      throw err;
    }
    return response;
  };
}
