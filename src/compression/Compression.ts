import type { Middleware, TKey } from "../core/mod.ts";
import { createKey, HttpHeader } from "../core/mod.ts";
import { ContentEncoding } from "./ContentEnconding.ts";
import { compress } from "./compress.ts";

export interface TCompression {
  readonly acceptedEncoding: readonly ContentEncoding[];
  readonly usedEncoding: null | ContentEncoding;
}

export const CompressionKey: TKey<TCompression> = createKey<TCompression>(
  "Compress",
);
export const CompressConsumer = CompressionKey.Consumer;

/**
 * Compresses the response body using the best encoding available.
 */
export function Compression(): Middleware {
  return async (ctx, next) => {
    const acceptedEncodingHeader = ctx.headers.get(HttpHeader.AcceptEncoding);
    const acceptedEncoding: Array<ContentEncoding> =
      typeof acceptedEncodingHeader === "string"
        ? (acceptedEncodingHeader.split(/, ?/) as any)
        : [ContentEncoding.Identity];

    const usedEncoding = selectEncoding(acceptedEncoding);
    const compressCtx: TCompression = {
      acceptedEncoding,
      usedEncoding,
    };

    const response = await next(ctx.with(CompressionKey.Provider(compressCtx)));
    if (response === null) {
      // no response = do nothing
      return response;
    }
    return compress(response, usedEncoding);
  };
}

function selectEncoding(
  acceptedEncoding: Array<ContentEncoding>,
): ContentEncoding {
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
