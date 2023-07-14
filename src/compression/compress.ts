import { Readable } from 'node:stream';
import zlib from 'node:zlib';
import type { ReadableStream } from 'stream/web';
import { Headers, Response } from 'undici';
import { HttpHeader, HttpStatus, ZenResponse } from '../core/mod';
import { ContentEncoding } from './ContentEnconding';

/**
 * Compresses the response body with the given encodings.
 */
export function compress(originalResponse: ZenResponse, encodings: Array<ContentEncoding>): ZenResponse {
  if (originalResponse.body === null || HttpStatus.isEmpty(originalResponse.status ?? 200)) {
    return originalResponse;
  }
  const bodyStream = new Response(originalResponse.body).body;
  const body = encodeBodyWithEncodings(bodyStream, encodings);

  return originalResponse
    .withHeaders((prev) => {
      const nextHeaders = new Headers(prev);
      nextHeaders.set(HttpHeader.ContentEncoding, encodings.join(', '));
      // remove content length because we no longer know the size of the body
      // (unless we compress first, then send it but that would be quite bad)
      nextHeaders.delete(HttpHeader.ContentLength);
      return nextHeaders;
    })
    .with(ZenResponse.BodyKey.Provider(body));
}

function encodeBodyWithEncodings(
  body: ReadableStream | null,
  encodings: Array<ContentEncoding>,
): ReadableStream | null {
  if (body === null) {
    return null;
  }
  let bodyStream: ReadableStream = body;

  encodings.forEach((encoding) => {
    bodyStream = encodeBodyWithEncoding(bodyStream, encoding);
  });

  return bodyStream;
}

function encodeBodyWithEncoding(body: ReadableStream, encoding: ContentEncoding): ReadableStream {
  if (encoding === ContentEncoding.Brotli) {
    return Readable.toWeb(Readable.fromWeb(body).pipe(zlib.createBrotliCompress()));
  }
  if (encoding === ContentEncoding.Gzip) {
    return Readable.toWeb(Readable.fromWeb(body).pipe(zlib.createGzip()));
  }
  if (encoding === ContentEncoding.Deflate) {
    return Readable.toWeb(Readable.fromWeb(body).pipe(zlib.createDeflate()));
  }
  return body;
}
