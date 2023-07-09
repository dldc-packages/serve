import { Erreur, ErreurType } from '@dldc/erreur';
import { HttpStatus, HttpStatusCode, HttpStatusMessage, HttpStatusName } from './HttpStatus';

export interface IHttpError {
  name: HttpStatusName;
  code: HttpStatusCode;
  message: HttpStatusMessage;
}

export const HttpError = ErreurType.defineWithTransform(
  'HttpError',
  (codeOrName: HttpStatusCode | HttpStatusName = 500, message?: HttpStatusMessage): IHttpError => {
    const code: HttpStatusCode = typeof codeOrName === 'number' ? codeOrName : HttpStatus.fromName(codeOrName).code;
    const status = HttpStatus.fromCode(code);
    return { code, name: status.name, message: message ?? status.message };
  },
  (err, provider, data) => {
    return err.with(provider).withMessage(`[HttpError] ${data.code} ${data.name}`);
  },
);

export interface IUnauthorized {
  reason?: string;
}

export const Unauthorized = ErreurType.defineWithTransform(
  'Unauthorized',
  (reason?: string): IUnauthorized => ({ reason }),
  (err, provider, data) => {
    return HttpError.append(err, 'Unauthorized', `(reason: ${data.reason})`).with(provider);
  },
);

export const NotFound = ErreurType.defineEmpty('NotFound', (err, provider) =>
  HttpError.append(err, 'NotFound').with(provider),
);

export const NotAcceptable = ErreurType.defineEmpty('NotAcceptable', (err, provider) =>
  HttpError.append(err, 'NotAcceptable').with(provider),
);

export interface IBadRequest {
  message?: string;
}

export const BadRequest = ErreurType.defineWithTransform(
  'BadRequest',
  (message?: string): IBadRequest => ({ message }),
  (err, provider, data) => HttpError.append(err, 'BadRequest', data.message).with(provider),
);

export interface IForbidden {
  reason?: string;
}

export const Forbidden = ErreurType.defineWithTransform(
  'Forbidden',
  (reason?: string): IForbidden => ({ reason }),
  (err, provider, data) => {
    const base = HttpError.append(err, 'Forbidden');
    const { code, name } = base.getOrFail(HttpError.Consumer);
    return base.with(provider).withMessage(`[HttpError] ${code} ${name} (${data.reason})`);
  },
);

export interface IInternalServerError {
  message?: string;
  cause?: Erreur;
}

export const InternalServerError = ErreurType.defineWithTransform(
  'InternalServerError',
  (message?: string, cause?: Erreur): IInternalServerError => ({ message, cause }),
  (err, provider, data) => HttpError.append(err, 'InternalServerError', data.message).with(provider),
);

export const ServerDidNotRespond = ErreurType.defineEmpty('ServerDidNotRespond', (err, provider) => {
  return InternalServerError.append(err, `Server did not respond`).with(provider);
});

interface ITooManyRequests {
  reason?: string;
}

export const TooManyRequests = ErreurType.defineWithTransform(
  'TooManyRequests',
  (reason?: string): ITooManyRequests => ({ reason }),
  (err, provider, data) => HttpError.append(err, 'TooManyRequests', data.reason).with(provider),
);
