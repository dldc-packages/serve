import { getPort } from "@openjs/port-free";

interface MountedServer {
  url: string;
  port: number;
  close: () => Promise<void>;
  fetch: (
    input: string | URL | globalThis.Request,
    init?: RequestInit,
  ) => Promise<Response>;
}

export async function mountServer(
  handler: Deno.ServeHandler,
): Promise<MountedServer> {
  const port = await getPort();
  if (!port) {
    throw new Error("No available port");
  }
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
