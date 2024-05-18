import { sanitize as defaultSanitize } from "@dldc/zenjson";
import type { ZenContext, ZenResponse } from "../core/mod.ts";
import { json } from "../json/mod.ts";
import { ZenjsonConfig } from "./ZenjsonParser.ts";

interface IOptions extends ResponseInit {
  sanitize?: typeof defaultSanitize;
  context?: ZenContext;
}

export function zenjson<Data>(data: Data, options: IOptions = {}): ZenResponse {
  const sanitize = (() => {
    if (options.context) {
      const config = options.context.get(ZenjsonConfig.Consumer);
      if (config && config.sanitize) {
        return config.sanitize;
      }
    }
    return options.sanitize ?? defaultSanitize;
  })();
  return json(sanitize(data), options);
}
