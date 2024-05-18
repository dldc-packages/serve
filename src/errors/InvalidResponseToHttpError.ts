import type { Middleware } from "../core/mod.ts";
import {
  createInternalServerError,
  createServerDidNotRespond,
  ZenResponse,
} from "../core/mod.ts";
import { LoggerConsumer } from "../logger/mod.ts";

export type InvalidResponseToHttpErrorOptions = {
  logOnError?: boolean;
};

/**
 * Return a Valid Repsonse or throw an HttpError
 */
export function InvalidResponseToHttpError(
  { logOnError = true }: InvalidResponseToHttpErrorOptions = {},
): Middleware {
  return async (ctx, next) => {
    const response = await next(ctx);
    if (response === null || response === undefined) {
      const err = createServerDidNotRespond();
      if (logOnError) {
        const logger = ctx.get(LoggerConsumer);
        logger.error(err);
      }
      throw err;
    }
    if (response instanceof ZenResponse === false) {
      const err = createInternalServerError(
        `The returned response is not valid (does not inherit the ZenResponse class)`,
      );
      if (logOnError) {
        const logger = ctx.get(LoggerConsumer);
        logger.info(response);
        logger.error(err);
      }
      throw err;
    }
    return response;
  };
}
