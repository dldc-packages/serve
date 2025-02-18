import { toError } from "@dldc/erreur";
import type { Middleware } from "../core/mod.ts";
import { createInternalServerError, HttpErreur } from "../core/mod.ts";
import { LoggerConsumer } from "../logger/mod.ts";

/**
 * Handle any error and convert it to an HttpError if it's not one
 */
export function ErrorToHttpError(): Middleware {
  return async (ctx, next) => {
    try {
      return await next(ctx);
    } catch (error) {
      const err = toError(error);
      const logger = ctx.get(LoggerConsumer);
      if (HttpErreur.has(err)) {
        logger.info(`Error is already an HttpError, skipping conversion`);
        throw err;
      }
      logger.log(`Rewriting error to HttpError`);
      throw createInternalServerError(undefined, err);
    }
  };
}
