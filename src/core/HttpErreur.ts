import { createErreurStore, type TErreurStore } from "@dldc/erreur";
import type {
  HttpStatusCode,
  HttpStatusMessage,
  HttpStatusName,
} from "./HttpStatus.ts";
import { HttpStatus } from "./HttpStatus.ts";

export interface THttpErreurData {
  name: HttpStatusName;
  code: HttpStatusCode;
  message: HttpStatusMessage;
}

const HttpErreurInternal: TErreurStore<THttpErreurData> = createErreurStore<
  THttpErreurData
>();

export const HttpErreur = HttpErreurInternal.asReadonly;

export function markHttpErreur(
  error: unknown,
  codeOrName: HttpStatusCode | HttpStatusName = 500,
  message?: HttpStatusMessage,
): Error {
  return HttpErreurInternal.setAndReturn(
    error,
    resolveHttpErrorParams(codeOrName, message),
  );
}

export function createHttpErreur(
  codeOrName: HttpStatusCode | HttpStatusName = 500,
  message?: HttpStatusMessage,
  cause?: Error,
): Error {
  const httpError = resolveHttpErrorParams(codeOrName, message);
  const error = new Error(`${httpError.message} (${httpError.name})`, {
    cause,
  });
  return HttpErreurInternal.setAndReturn(error, httpError);
}

function resolveHttpErrorParams(
  codeOrName: HttpStatusCode | HttpStatusName = 500,
  message?: HttpStatusMessage,
): THttpErreurData {
  const code: HttpStatusCode = typeof codeOrName === "number"
    ? codeOrName
    : HttpStatus.fromName(codeOrName).code;
  const status = HttpStatus.fromCode(code);
  const messageResolved = message ?? status.message;
  return { code, name: status.name, message: messageResolved };
}

/** */

export type THttpErreurDetailsData =
  | { type: "Unauthorized"; reason?: string }
  | { type: "NotFound" }
  | { type: "NotAcceptable" }
  | { type: "BadRequest"; message?: string }
  | { type: "Forbidden"; reason?: string }
  | { type: "InternalServerError"; message?: string }
  | { type: "ServerDidNotRespond" }
  | { type: "TooManyRequests"; reason?: string };

const HttpErreurDetailsInternal: TErreurStore<THttpErreurDetailsData> =
  createErreurStore<THttpErreurDetailsData>();

export const HttpErreurDetails = HttpErreurDetailsInternal.asReadonly;

export function markUnauthorized(error: unknown, reason?: string): Error {
  return HttpErreurDetailsInternal.setAndReturn(
    markHttpErreur(error, "Unauthorized", "Unauthorized"),
    { type: "Unauthorized", reason },
  );
}

export function createUnauthorized(reason?: string, cause?: Error): Error {
  return HttpErreurDetailsInternal.setAndReturn(
    createHttpErreur("Unauthorized", "Unauthorized", cause),
    { type: "Unauthorized", reason },
  );
}

export function markNotFound(error: unknown): Error {
  return HttpErreurDetailsInternal.setAndReturn(
    markHttpErreur(error, "NotFound", "Not Found"),
    { type: "NotFound" },
  );
}

export function createNotFound(cause?: Error): Error {
  return HttpErreurDetailsInternal.setAndReturn(
    createHttpErreur("NotFound", "Not Found", cause),
    { type: "NotFound" },
  );
}

export function markNotAcceptable(error: unknown): Error {
  return HttpErreurDetailsInternal.setAndReturn(
    markHttpErreur(error, "NotAcceptable", "Not Acceptable"),
    { type: "NotAcceptable" },
  );
}

export function createNotAcceptable(cause?: Error): Error {
  return HttpErreurDetailsInternal.setAndReturn(
    createHttpErreur("NotAcceptable", "Not Acceptable", cause),
    { type: "NotAcceptable" },
  );
}

export function markBadRequest(error: unknown, message?: string): Error {
  return HttpErreurDetailsInternal.setAndReturn(
    markHttpErreur(error, "BadRequest", message ?? "Bad Request"),
    { type: "BadRequest", message },
  );
}

export function createBadRequest(message?: string, cause?: Error): Error {
  return HttpErreurDetailsInternal.setAndReturn(
    createHttpErreur("BadRequest", message ?? "Bad Request", cause),
    { type: "BadRequest", message },
  );
}

export function markForbidden(error: unknown, reason?: string): Error {
  return HttpErreurDetailsInternal.setAndReturn(
    markHttpErreur(error, "Forbidden", "Forbidden"),
    { type: "Forbidden", reason },
  );
}

export function createForbidden(reason?: string, cause?: Error): Error {
  return HttpErreurDetailsInternal.setAndReturn(
    createHttpErreur("Forbidden", "Forbidden", cause),
    { type: "Forbidden", reason },
  );
}

export function markInternalServerError(
  error: unknown,
  message?: string,
): Error {
  return HttpErreurDetailsInternal.setAndReturn(
    markHttpErreur(error, "InternalServerError", message),
    { type: "InternalServerError", message },
  );
}

export function createInternalServerError(
  message?: string,
  cause?: Error,
): Error {
  return HttpErreurDetailsInternal.setAndReturn(
    createHttpErreur("InternalServerError", message, cause),
    { type: "InternalServerError", message },
  );
}

export function markServerDidNotRespond(
  error: unknown,
): Error {
  return HttpErreurDetailsInternal.setAndReturn(
    markHttpErreur(error, "InternalServerError", "Server did not respond"),
    { type: "ServerDidNotRespond" },
  );
}

export function createServerDidNotRespond(
  cause?: Error,
): Error {
  return HttpErreurDetailsInternal.setAndReturn(
    createHttpErreur("InternalServerError", "Server did not respond", cause),
    { type: "ServerDidNotRespond" },
  );
}

export function markTooManyRequests(error: unknown, reason?: string): Error {
  return HttpErreurDetailsInternal.setAndReturn(
    markHttpErreur(error, "TooManyRequests", reason),
    { type: "TooManyRequests", reason },
  );
}

export function createTooManyRequests(reason?: string, cause?: Error): Error {
  return HttpErreurDetailsInternal.setAndReturn(
    createHttpErreur("TooManyRequests", reason, cause),
    { type: "TooManyRequests", reason },
  );
}
