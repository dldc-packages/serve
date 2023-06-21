import { Key } from 'staack';
import { HttpHeader, Middleware } from '../core/mod';
import { ContentEncoding } from './ContentEnconding';
import { compress } from './compress';

export interface ICompression {
  readonly acceptedEncoding: readonly ContentEncoding[];
  readonly usedEncoding: null | readonly ContentEncoding[];
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

    const usedEncoding = selectEncodings(acceptedEncoding);
    const compressCtx: ICompression = { acceptedEncoding, usedEncoding };

    const response = await next(ctx.with(CompressionKey.Provider(compressCtx)));
    if (response === null) {
      // no response = do nothing
      return response;
    }
    return compress(response, usedEncoding);
  };
}

function selectEncodings(acceptedEncoding: Array<ContentEncoding>): Array<ContentEncoding> {
  if (acceptedEncoding.indexOf(ContentEncoding.Brotli) >= 0) {
    return [ContentEncoding.Brotli];
  }
  if (acceptedEncoding.indexOf(ContentEncoding.Gzip) >= 0) {
    return [ContentEncoding.Gzip];
  }
  if (acceptedEncoding.indexOf(ContentEncoding.Deflate) >= 0) {
    return [ContentEncoding.Deflate];
  }
  return [ContentEncoding.Identity];
}
