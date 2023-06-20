import { Erreur, Key, MessageKey, createErreurType } from 'erreur';
import { HttpStatus, HttpStatusCode, HttpStatusMessage, HttpStatusName } from './HttpStatus';

export interface IHttpError {
  name: HttpStatusName;
  code: HttpStatusCode;
  message: HttpStatusMessage;
}

export const HttpErrorType = createErreurType<IHttpError>({ name: 'HttpError' });

export interface IUnauthorized {
  reason?: string;
}

export const Unauthorized: Key<IUnauthorized> = createErreurType<IUnauthorized>({ name: 'Unauthorized' });

// export const HttpError = {
//   create: createHttpError,
//   NotAcceptable: { create: createNotAcceptable },
//   BadRequest: { create: createBadRequest },
// };

function createHttpError(
  parent: null | Erreur,
  codeOrName: HttpStatusCode | HttpStatusName = 500,
  message?: HttpStatusMessage
): Erreur {
  const code: HttpStatusCode = typeof codeOrName === 'number' ? codeOrName : HttpStatus.fromName(codeOrName).code;
  const status = HttpStatus.fromCode(code);
  return HttpErrorType.extends(parent, { code, name: status.name, message: message ?? status.message });

  const base = parent ?? Erreur.create();
  return base
    .with(HttpErrorKey.Provider({ code, name: status.name, message: message ?? status.message }))
    .withGetMessage((self) => {
      const prev = self.get(MessageKey.Consumer);
      if (!prev) {
        return `${code} ${status.message}`;
      }
      return `${code} ${status.message}: ${prev}`;
    });
}

function createNotAcceptable(message?: HttpStatusMessage): Erreur {
  return createHttpError(null, 'NotAcceptable', message);
}

function createBadRequest(message?: HttpStatusMessage): Erreur {
  return createHttpError(null, 'BadRequest', message);
}

function createUnauthorized(reason?: string): Erreur {
  return createHttpError(null, 'Unauthorized', `Reason: ${reason}`);
}

// interface IForbidden extends IHttpError {
//   reason?: string;
// }

// interface IInternal extends IHttpError {
//   cause?: unknown;
// }

// export const HttpError = ErreurType.createWithTransform(
//   'HttpError',
//   (code: HttpStatusCode, message?: HttpStatusMessage): IHttpError => {
//     const codeResolved = HttpStatus.isError(code) ? code : 500;
//     if (code !== codeResolved) {
//       console.error(`You passed a non error HTTP code to HttpError (${code}). Using code 500 instead.`);
//     }
//     const messageResolved = message || HttpStatus.getMessage(codeResolved);
//     return { code: codeResolved, message: messageResolved };
//   },
//   (data) => `${data.code} ${data.message}`
// );

// export const HttpErrors = {
//   LengthRequired: ErreurType.createEmpty('LengthRequired').withParent(() => HttpError.instantiate(411)),
//   NotAcceptable: ErreurType.createWithTransform(
//     'NotAcceptable',
//     (info: string): INotAcceptable => ({ code: 406, message: HttpStatus.getMessage(406, info), info })
//   ).withParent(({ code, message }) => HttpError.instantiate(code, message)),
//   PayloadTooLarge: ErreurType.createEmpty('PayloadTooLarge').withParent(() => HttpError.instantiate(413)),
//   NotFound: ErreurType.createEmpty('NotFound').withParent(() => HttpError.instantiate(404)),
//   BadRequest: ErreurType.createWithTransform(
//     'BadRequest',
//     (info: string): IBadRequest => ({ code: 400, message: HttpStatus.getMessage(400, info), info })
//   ).withParent(({ code, message }) => HttpError.instantiate(code, message)),
//   ServerDidNotRespond: ErreurType.createEmpty('ServerDidNotRespond', `Server did not respond`).withParent(() =>
//     HttpError.instantiate(500)
//   ),
//   Unauthorized: ErreurType.createWithTransform(
//     'Unauthorized',
//     (reason?: string): IUnauthorized => ({ code: 401, message: HttpStatus.getMessage(401, reason), reason })
//   ).withParent(({ code, message }) => HttpError.instantiate(code, message)),
//   Forbidden: ErreurType.createWithTransform(
//     'Forbidden',
//     (reason?: string): IForbidden => ({ code: 403, message: HttpStatus.getMessage(403, reason), reason })
//   ).withParent(({ code, message }) => HttpError.instantiate(code, message)),
//   TooManyRequests: ErreurType.createEmpty('TooManyRequests').withParent(() => HttpError.instantiate(429)),
//   Internal: ErreurType.createWithTransform(
//     'Internal',
//     (cause?: unknown): IInternal => ({ code: 500, message: HttpStatus.getMessage(500), cause }),
//     (data) => `${data.code} ${data.message}: ${errorToString(data.cause)}`
//   ).withParent(({ code, message, cause }) => HttpError.instantiate(code, `${message}: ${errorToString(cause)}`)),
// };

// function errorToString(error: unknown): string {
//   if (error instanceof Error) {
//     return error.message;
//   }
//   const strValue = typeof error === 'string' ? error : JSON.stringify(error);
//   const strTruncated = strValue.length > 30 ? `${strValue.slice(0, 30)}...` : strValue;
//   return strTruncated;
// }
