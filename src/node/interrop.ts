import type { IncomingMessage, ServerResponse } from 'node:http';
import type { ReadableStream } from 'node:stream/web';
import type { Writable } from 'stream';
import type { RequestInit, Response } from 'undici';
import { Request } from 'undici';

export function getRequestFromReqRes(base: string, req: IncomingMessage, res: ServerResponse): Request {
  const url = new URL(`${base}${req.url}`);
  const headers = req.headers as Record<string, string>;
  const controller = new AbortController();
  res.on('close', () => controller.abort());

  const init: RequestInit = {
    duplex: 'half',
    method: req.method,
    headers,
    signal: controller.signal,
  };

  if (req.method !== 'GET' && req.method !== 'HEAD') {
    init.body = req;
  }

  return new Request(url.href, init);
}

export async function setResponse(res: ServerResponse, response: Response): Promise<void> {
  res.statusMessage = response.statusText;
  res.writeHead(response.status, Array.from(response.headers.entries()));
  if (response.body) {
    await writeReadableStreamToWritable(response.body, res);
  } else {
    res.end();
  }
}

export async function writeReadableStreamToWritable(stream: ReadableStream, writable: Writable) {
  const reader = stream.getReader();

  async function read() {
    const { done, value } = await reader.read();

    if (done) {
      writable.end();
      return;
    }

    writable.write(value);

    // If the stream is flushable, flush it to allow streaming to continue.
    const flushable = writable as { flush?: Function };
    if (typeof flushable.flush === 'function') {
      flushable.flush();
    }

    await read();
  }

  try {
    await read();
  } catch (error: any) {
    writable.destroy(error);
    throw error;
  }
}
