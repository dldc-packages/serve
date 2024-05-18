import { ZenContext } from "./ZenContext.ts";
import { ZenResponse } from "./ZenResponse.ts";
import type { Middleware } from "./compose.ts";

export interface CreateHandlerOptions {
  base?: string;
}

export type Handler = (req: Request) => Promise<Response>;

export function createHandler(middleware: Middleware): Handler {
  return async (request: Request): Promise<Response> => {
    try {
      const zenContext = ZenContext.fromRequest(request);
      const zenResponse = await middleware(zenContext, () => {
        throw new Error("Server did not respond");
      });
      const res = ZenResponse.toResponse(zenResponse);
      return res;
    } catch (error) {
      // Handled error (throwing a response)
      if (error instanceof ZenResponse) {
        return ZenResponse.toResponse(error);
      }
      throw error;
    }
  };
}
