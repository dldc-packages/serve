import { getAvailablePortSync } from "../deps.ts";

interface MountedServer {
  url: string;
  port: number;
  close: () => Promise<void>;
  fetch: typeof fetch;
}

export function mountServer(handler: Deno.ServeHandler): MountedServer {
  const port = getAvailablePortSync();
  if (!port) {
    throw new Error("No available port");
  }
  console.log(`Mounting server on port ${port}`);
  const server = Deno.serve({
    port,
    onListen: () => {},
  }, handler);
  const url = `http://localhost:${port}`;
  return {
    port,
    url,
    close() {
      return server.shutdown();
    },
    fetch(input, init) {
      return fetch(input, {
        ...init,
        headers: {
          "Accept-Encoding": "identity",
          ...init?.headers,
          host: url,
        },
      });
    },
  };
}
