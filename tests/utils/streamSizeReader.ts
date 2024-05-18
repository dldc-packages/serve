export interface StreamSizeReader {
  read(size: number): Promise<Uint8Array | null>;
  close(): void;
}

export function streamSizeReader(
  stream: ReadableStream<Uint8Array>,
): StreamSizeReader {
  const reader = stream.getReader();
  let buffer = new Uint8Array(0);
  return {
    async read(size: number): Promise<Uint8Array | null> {
      while (buffer.byteLength < size) {
        const { done, value } = await reader.read();
        if (done) {
          break;
        }
        const prev = buffer;
        buffer = new Uint8Array(prev.byteLength + value.byteLength);
        buffer.set(prev);
        buffer.set(value, prev.byteLength);
      }
      if (buffer.byteLength < size) {
        throw new Error("Unexpected end of stream");
      }
      const result = buffer.slice(0, size);
      buffer = buffer.slice(size);
      return result;
    },
    close() {
      reader.cancel();
    },
  };
}
