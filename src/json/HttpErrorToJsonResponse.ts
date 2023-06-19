import { HttpError, Middleware } from '../core/mod';
import { LoggerConsumer } from '../logger/mod';
import { json } from './json';

export function HttpErrorToJsonResponse(): Middleware {
  return async (ctx, next) => {
    const logger = ctx.get(LoggerConsumer);
    try {
      return await next(ctx);
    } catch (error) {
      const httpError = HttpError.match(error);
      if (httpError) {
        logger.error(error);
        return json(httpError, { status: httpError.code });
      }
      throw error;
    }
  };
}
