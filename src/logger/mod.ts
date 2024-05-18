import { createKeyWithDefault } from "../core/mod.ts";

export type Logger = {
  log(...data: Array<any>): void;
  error(...data: Array<any>): void;
  info(...data: Array<any>): void;
  warn(...data: Array<any>): void;
};

export const LoggerContext = createKeyWithDefault<Logger>("Logger", {
  error: console.error,
  info: console.info,
  log: console.log,
  warn: console.warn,
});

export const LoggerConsumer = LoggerContext.Consumer;
