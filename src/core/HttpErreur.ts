import { createErreurStore, type TErreurStore } from "@dldc/erreur";
import type {
  HttpStatusCode,
  HttpStatusMessage,
  HttpStatusName,
} from "./HttpStatus.ts";
import { HttpStatus } from "./HttpStatus.ts";

export interface IHttpErreurData {
  name: HttpStatusName;
  code: HttpStatusCode;
  message: HttpStatusMessage;
}

const HttpErreurInternal: TErreurStore<IHttpErreurData> = createErreurStore<
  IHttpErreurData
>();

export const HttpErreur = HttpErreurInternal.asReadonly;

export function createHttpErreur(
  codeOrName: HttpStatusCode | HttpStatusName = 500,
  messageOrCause?: HttpStatusMessage | Error,
): Error {
  const code: HttpStatusCode = typeof codeOrName === "number"
    ? codeOrName
    : HttpStatus.fromName(codeOrName).code;
  const status = HttpStatus.fromCode(code);
  const messageStr = messageOrCause
    ? typeof messageOrCause === "string"
      ? messageOrCause
      : messageOrCause.message
    : undefined;
  const fullMessage = `${code} ${status.name}${
    messageStr ? `: ${messageStr}` : ""
  }`;
  const error = messageOrCause instanceof Error
    ? messageOrCause
    : new Error(fullMessage);
  return HttpErreurInternal.setAndReturn(error, {
    code,
    name: status.name,
    message: messageStr ?? status.message,
  });
}

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

export function createUnauthorized(reason?: string): Error {
  return HttpErreurDetailsInternal.setAndReturn(
    createHttpErreur("Unauthorized", "Unauthorized"),
    {
      type: "Unauthorized",
      reason,
    },
  );
}

export function createNotFound(): Error {
  return HttpErreurDetailsInternal.setAndReturn(
    createHttpErreur("NotFound", "Not Found"),
    { type: "NotFound" },
  );
}

export function createNotAcceptable(): Error {
  return HttpErreurDetailsInternal.setAndReturn(
    createHttpErreur("NotAcceptable", "Not Acceptable"),
    {
      type: "NotAcceptable",
    },
  );
}

export function createBadRequest(message?: string): Error {
  return HttpErreurDetailsInternal.setAndReturn(
    createHttpErreur("BadRequest", message ?? "Bad Request"),
    {
      type: "BadRequest",
      message,
    },
  );
}

export function createForbidden(reason?: string): Error {
  return HttpErreurDetailsInternal.setAndReturn(
    createHttpErreur("Forbidden", "Forbidden"),
    {
      type: "Forbidden",
      reason,
    },
  );
}

export function createInternalServerError(
  messageOrCause?: string | Error,
): Error {
  return HttpErreurDetailsInternal.setAndReturn(
    createHttpErreur(
      "InternalServerError",
      messageOrCause ?? "Internal Server Error",
    ),
    {
      type: "InternalServerError",
      message: messageOrCause instanceof Error ? undefined : messageOrCause,
    },
  );
}

export function createServerDidNotRespond(): Error {
  return HttpErreurDetailsInternal.setAndReturn(
    createHttpErreur("InternalServerError", "Server did not respond"),
    {
      type: "ServerDidNotRespond",
    },
  );
}

export function createTooManyRequests(reason?: string): Error {
  return HttpErreurDetailsInternal.setAndReturn(
    createHttpErreur("TooManyRequests"),
    {
      type: "TooManyRequests",
      reason,
    },
  );
}
