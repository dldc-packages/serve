import { Erreur, Key } from '@dldc/erreur';
import type { HttpStatusCode, HttpStatusMessage, HttpStatusName } from './HttpStatus';
import { HttpStatus } from './HttpStatus';

export interface IHttpError {
  name: HttpStatusName;
  code: HttpStatusCode;
  message: HttpStatusMessage;
}

export interface IUnauthorized {
  reason?: string;
}

export interface IBadRequest {
  message?: string;
}

export interface IForbidden {
  reason?: string;
}

export interface IInternalServerError {
  message?: string;
  cause?: Erreur;
}

export interface ITooManyRequests {
  reason?: string;
}

export const HttpError = (() => {
  const HttpErrorKey = Key.create<IHttpError>('HttpError');
  function createHttpError(codeOrName: HttpStatusCode | HttpStatusName = 500, message?: HttpStatusMessage) {
    const code: HttpStatusCode = typeof codeOrName === 'number' ? codeOrName : HttpStatus.fromName(codeOrName).code;
    const status = HttpStatus.fromCode(code);
    return Erreur.createWith(HttpErrorKey, { code, name: status.name, message: message ?? status.message })
      .withName('HttpError')
      .withMessage(`${code} ${status.name}`);
  }

  const UnauthorizedKey = Key.create<IUnauthorized>('Unauthorized');
  function createUnauthorized(reason?: string) {
    return createHttpError('Unauthorized', `(reason: ${reason})`).with(UnauthorizedKey.Provider({ reason }));
  }

  const NotFoundKey = Key.createEmpty('NotFound');
  function createNotFound() {
    return createHttpError('NotFound').with(NotFoundKey.Provider());
  }

  const NotAcceptableKey = Key.createEmpty('NotAcceptable');
  function createNotAcceptable() {
    return createHttpError('NotAcceptable').with(NotAcceptableKey.Provider());
  }

  const BadRequestKey = Key.create<IBadRequest>('BadRequest');
  function createBadRequest(message?: string) {
    return createHttpError('BadRequest', message).with(BadRequestKey.Provider({ message }));
  }

  const ForbiddenKey = Key.create<IForbidden>('Forbidden');
  function createForbidden(reason?: string) {
    return createHttpError('Forbidden', `(reason: ${reason})`).with(ForbiddenKey.Provider({ reason }));
  }

  const InternalServerErrorKey = Key.create<IInternalServerError>('InternalServerError');
  function createInternalServerError(message?: string, cause?: Erreur) {
    return createHttpError('InternalServerError', message).with(InternalServerErrorKey.Provider({ message, cause }));
  }

  const ServerDidNotRespondKey = Key.createEmpty('ServerDidNotRespond');
  function createServerDidNotRespond() {
    return createInternalServerError('Server did not respond').with(ServerDidNotRespondKey.Provider());
  }

  const TooManyRequestsKey = Key.create<ITooManyRequests>('TooManyRequests');
  function createTooManyRequests(reason?: string) {
    return createHttpError('TooManyRequests', `(reason: ${reason})`).with(TooManyRequestsKey.Provider({ reason }));
  }

  return {
    Key: HttpErrorKey,
    create: createHttpError,
    Unauthorized: {
      Key: UnauthorizedKey,
      create: createUnauthorized,
    },
    NotFound: {
      Key: NotFoundKey,
      create: createNotFound,
    },
    NotAcceptable: {
      Key: NotAcceptableKey,
      create: createNotAcceptable,
    },
    BadRequest: {
      Key: BadRequestKey,
      create: createBadRequest,
    },
    Forbidden: {
      Key: ForbiddenKey,
      create: createForbidden,
    },
    InternalServerError: {
      Key: InternalServerErrorKey,
      create: createInternalServerError,
    },
    ServerDidNotRespond: {
      Key: ServerDidNotRespondKey,
      create: createServerDidNotRespond,
    },
    TooManyRequests: {
      Key: TooManyRequestsKey,
      create: createTooManyRequests,
    },
  };
})();
