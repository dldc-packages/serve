import type { Middleware } from '../core/mod';
import { ZenResponse, createInternalServerError, createServerDidNotRespond } from '../core/mod';
import { LoggerConsumer } from '../logger/mod';

/**
 * Return a Valid Repsonse or throw an HttpError
 */
export function InvalidResponseToHttpError(): Middleware {
  return async (ctx, next) => {
    const logger = ctx.get(LoggerConsumer);
    const response = await next(ctx);
    if (response === null || response === undefined) {
      const err = createServerDidNotRespond();
      logger.error(err);
      throw err;
    }
    if (response instanceof ZenResponse === false) {
      const err = createInternalServerError(
        `The returned response is not valid (does not inherit the ZenResponse class)`,
      );
      logger.info(response);
      logger.error(err);
      throw err;
    }
    return response;
  };
}
