import { Key } from '@dldc/stack';
import type { Middleware } from '../core/mod';
import { HttpHeader } from '../core/mod';
import { ContentEncoding } from './ContentEnconding';
import { compress } from './compress';

export type TFlush = () => void;

export interface ICompression {
  readonly acceptedEncoding: readonly ContentEncoding[];
  readonly usedEncoding: null | ContentEncoding;
  readonly flush: TFlush;
}

export const CompressionKey = Key.create<ICompression>('Compress');
export const CompressConsumer = CompressionKey.Consumer;

/**
 * Compresses the response body using the best encoding available.
 */
export function Compression(): Middleware {
  return async (ctx, next) => {
    const acceptedEncodingHeader = ctx.headers.get(HttpHeader.AcceptEncoding);
    const acceptedEncoding: Array<ContentEncoding> =
      typeof acceptedEncodingHeader === 'string'
        ? (acceptedEncodingHeader.split(/, ?/) as any)
        : [ContentEncoding.Identity];

    const usedEncoding = selectEncoding(acceptedEncoding);
    const flushDeferred = createDeferredFlush();
    const compressCtx: ICompression = {
      acceptedEncoding,
      usedEncoding,
      flush: flushDeferred.flush,
    };

    const response = await next(ctx.with(CompressionKey.Provider(compressCtx)));
    if (response === null) {
      // no response = do nothing
      return response;
    }
    return compress(response, usedEncoding, flushDeferred.setFlush);
  };
}

function selectEncoding(acceptedEncoding: Array<ContentEncoding>): ContentEncoding {
  if (acceptedEncoding.indexOf(ContentEncoding.Brotli) >= 0) {
    return ContentEncoding.Brotli;
  }
  if (acceptedEncoding.indexOf(ContentEncoding.Gzip) >= 0) {
    return ContentEncoding.Gzip;
  }
  if (acceptedEncoding.indexOf(ContentEncoding.Deflate) >= 0) {
    return ContentEncoding.Deflate;
  }
  return ContentEncoding.Identity;
}

interface IDeferredFlush {
  flush: TFlush;
  setFlush: (f: TFlush) => void;
}

function createDeferredFlush(): IDeferredFlush {
  let flushFn: TFlush | null = null;
  // flush requested before flush was set
  let requested = false;

  return {
    flush,
    setFlush,
  };

  function setFlush(f: TFlush) {
    flushFn = f;
    if (requested) {
      flushFn();
    }
  }

  function flush() {
    if (flushFn === null) {
      requested = true;
      return;
    }
    flushFn();
  }
}
