import { ResponseInit } from 'undici';
import { sanitize as defaultSanitize } from 'zenjson';
import { ZenContext, ZenResponse } from '../core';
import { json } from '../json';
import { ZenjsonConfig } from './ZenjsonParser';

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
