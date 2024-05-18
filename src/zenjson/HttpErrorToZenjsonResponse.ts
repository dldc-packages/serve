import { toError } from "@dldc/erreur";
import { HttpErreur, type Middleware } from "../core/mod.ts";
import { LoggerConsumer } from "../logger/mod.ts";
import { zenjson } from "./zenjson.ts";

interface HttpErrorToZenjsonResponseOptions {
  logOnError?: boolean;
}

export function HttpErrorToZenjsonResponse(
  { logOnError = true }: HttpErrorToZenjsonResponseOptions = {},
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
          logger.error(error);
        }
        return zenjson(httpError, { status: httpError.code });
      }
      throw error;
    }
  };
}
