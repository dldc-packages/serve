import { toError } from "@dldc/erreur";
import type { Middleware } from "../core/mod.ts";
import { createInternalServerError, HttpErreur } from "../core/mod.ts";
import { LoggerConsumer } from "../logger/mod.ts";

export type ErrorToHttpErrorOptions = {
  logOnError?: boolean;
};

/**
 * Handle any error and convert it to an HttpError if it's not one
 */
export function ErrorToHttpError(
  { logOnError = true }: ErrorToHttpErrorOptions = {},
): Middleware {
  return async (ctx, next) => {
    try {
      return await next(ctx);
    } catch (error) {
      const err = toError(error);
      if (HttpErreur.has(err)) {
        throw err;
      }
      if (logOnError) {
        const logger = ctx.get(LoggerConsumer);
        logger.error(error);
      }
      throw createInternalServerError(err);
    }
  };
}
