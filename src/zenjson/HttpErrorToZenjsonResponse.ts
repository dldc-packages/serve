import { Middleware } from '../core/mod';
import { LoggerConsumer } from '../logger/mod';

export function HttpErrorToZenjsonResponse(): Middleware {
  return async (ctx, next) => {
    const logger = ctx.get(LoggerConsumer);
    try {
      return await next(ctx);
    } catch (error) {
      logger.error('TODO');
      throw new Error('TODO');
      // const httpError = HttpError.match(error);
      // if (httpError) {
      //   logger.error(error);
      //   return zenjson(httpError, { status: httpError.code });
      // }
      // throw error;
    }
  };
}
