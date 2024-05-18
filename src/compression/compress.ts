import { HttpHeader, HttpStatus, ZenResponse } from "../core/mod.ts";
import { ContentEncoding } from "./ContentEnconding.ts";

/**
 * Compresses the response body with the given encodings.
 */
export function compress(
  originalResponse: ZenResponse,
  encoding: ContentEncoding,
): ZenResponse {
  if (
    originalResponse.body === null ||
    HttpStatus.isEmpty(originalResponse.status ?? 200)
  ) {
    return originalResponse;
  }
  const bodyStream = new Response(originalResponse.body).body;
  const body = encodeBodyWithEncoding(bodyStream, encoding);

  if (body === null) {
    return originalResponse;
  }

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
): ReadableStream<Uint8Array> | null {
  if (body === null) {
    return null;
  }
  // if (encoding === ContentEncoding.Brotli) {
  //   const encoder = new CompressionStream("gzip")
  //   return body.pipeThrough(encoder);
  // }
  if (encoding === ContentEncoding.Gzip) {
    const encoder = new CompressionStream("gzip");
    return body.pipeThrough(encoder);
  }
  if (encoding === ContentEncoding.Deflate) {
    const encoder = new CompressionStream("deflate");
    return body.pipeThrough(encoder);
  }
  return body;
}
