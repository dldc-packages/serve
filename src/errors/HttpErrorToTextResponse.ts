import { toError } from "@dldc/erreur";
import type { Middleware } from "../core/mod.ts";
import { HttpErreur, ZenResponse } from "../core/mod.ts";
import { LoggerConsumer } from "../logger/mod.ts";

export type HttpErrorToTextResponseOptions = {
  logOnError?: boolean;
};

/**
 * Handle HttpError and respond with a Text reponse
 */
export function HttpErrorToTextResponse(
  { logOnError = false }: HttpErrorToTextResponseOptions = {},
): Middleware {
  return async (ctx, next) => {
    try {
      return await next(ctx);
    } catch (error) {
      const err = toError(error);
      const httpError = HttpErreur.get(err);
      if (httpError) {
        if (logOnError) {
          const logger = ctx.get(LoggerConsumer);
          logger.error(`Handled HttpError: ${httpError.message}`);
          logger.error(httpError);
        }
        return ZenResponse.create(
          `Error ${httpError.code} ${httpError.message}`,
          { status: httpError.code },
        );
      }
      throw error;
    }
  };
}
