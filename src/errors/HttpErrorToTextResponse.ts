import { toError } from "@dldc/erreur";
import type { Middleware } from "../core/mod.ts";
import { HttpErreur, ZenResponse } from "../core/mod.ts";

/**
 * Handle HttpError and respond with a Text reponse
 */
export function HttpErrorToTextResponse(): Middleware {
  return async (ctx, next) => {
    try {
      return await next(ctx);
    } catch (error) {
      const err = toError(error);
      const httpError = HttpErreur.get(err);
      if (httpError) {
        return ZenResponse.create(
          `Error ${httpError.code} ${httpError.message}`,
          { status: httpError.code },
        );
      }
      throw error;
    }
  };
}
