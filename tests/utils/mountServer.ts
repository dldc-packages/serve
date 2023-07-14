import type { Server } from 'node:http';
import { Agent, fetch } from 'undici';

interface MountedServer {
  url: string;
  port: number;
  close: () => Promise<void>;
  fetch: typeof fetch;
}

export async function mountServer(server: Server): Promise<MountedServer> {
  return new Promise((resolve) => {
    server.listen(undefined, () => {
      const address = server.address();
      if (address === null || typeof address === 'string') {
        throw new Error('Whut ?');
      }
      // Force close the connection after each request
      const dispatcher = new Agent({ pipelining: 0 });
      resolve({
        url: `http://localhost:${address.port}`,
        port: address.port,
        close: () => {
          return new Promise((resolve) => {
            server.close(() => {
              resolve();
            });
          });
        },
        fetch(input, init) {
          return fetch(input, {
            ...init,
            dispatcher,
            headers: {
              ...init?.headers,
              host: `http://localhost:${address.port}`,
            },
          });
        },
      });
    });
  });
}
