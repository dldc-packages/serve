import { toError } from "@dldc/erreur";
import { HttpErreur, type Middleware } from "../core/mod.ts";
import { LoggerConsumer } from "../logger/mod.ts";
import { json } from "./json.ts";

interface HttpErrorToJsonResponseOptions {
  logOnError?: boolean;
}

export function HttpErrorToJsonResponse(
  { logOnError = true }: HttpErrorToJsonResponseOptions = {},
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
        return json(httpError, { status: httpError.code });
      }
      throw error;
    }
  };
}
