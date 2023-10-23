import { Transform } from 'node:stream';
import zlib from 'node:zlib';
import type { ReadableStream } from 'stream/web';
import { Headers, Response } from 'undici';
import { HttpHeader, HttpStatus, ZenResponse } from '../core/mod';
import type { TFlush } from './Compression';
import { ContentEncoding } from './ContentEnconding';

/**
 * Compresses the response body with the given encodings.
 */
export function compress(
  originalResponse: ZenResponse,
  encoding: ContentEncoding,
  setFlush: (f: TFlush) => void,
): ZenResponse {
  if (originalResponse.body === null || HttpStatus.isEmpty(originalResponse.status ?? 200)) {
    return originalResponse;
  }
  const bodyStream = new Response(originalResponse.body).body;
  const body = encodeBodyWithEncoding(bodyStream, encoding, setFlush);

  return originalResponse
    .withHeaders((prev) => {
      const nextHeaders = new Headers(prev);
      nextHeaders.set(HttpHeader.ContentEncoding, encoding);
      // remove content length because we no longer know the size of the body
      // (unless we compress first, then send it but that would be quite bad)
      nextHeaders.delete(HttpHeader.ContentLength);
      return nextHeaders;
    })
    .with(ZenResponse.BodyKey.Provider(body));
}

function encodeBodyWithEncoding(
  body: ReadableStream | null,
  encoding: ContentEncoding,
  setFlush: (f: TFlush) => void,
): ReadableStream | null {
  if (body === null) {
    return null;
  }
  if (encoding === ContentEncoding.Brotli) {
    const enc = zlib.createBrotliCompress();
    setFlush(() => enc.flush());
    return body.pipeThrough(Transform.toWeb(enc));
  }
  if (encoding === ContentEncoding.Gzip) {
    const enc = zlib.createGzip();
    setFlush(() => enc.flush());
    return body.pipeThrough(Transform.toWeb(enc));
  }
  if (encoding === ContentEncoding.Deflate) {
    const enc = zlib.createDeflate();
    setFlush(() => enc.flush());
    return body.pipeThrough(Transform.toWeb(enc));
  }
  return body;
}
