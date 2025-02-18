import * as zen from "@dldc/zenjson";
import type { Middleware, TKey } from "../core/mod.ts";
import { createKey } from "../core/mod.ts";
import { GetJsonBodyKeyConsumer } from "../json/mod.ts";

export type GetZenjsonBody = () => Promise<any>;

export const GetZenjsonBodyKey: TKey<GetZenjsonBody> = createKey<
  GetZenjsonBody
>("ZenjsonParser");
export const GetZenjsonBodyKeyConsumer = GetZenjsonBodyKey.Consumer;

interface TZenjsonConfig {
  sanitize?: typeof zen.sanitize;
  restore?: typeof zen.restore;
}

export const ZenjsonConfig: TKey<TZenjsonConfig> = createKey<TZenjsonConfig>(
  "ZenjsonConfig",
);

export function ZenjsonParser(options: TZenjsonConfig = {}): Middleware {
  const restore = options.restore ?? zen.restore;

  return (ctx, next): Promise<any> => {
    const ctxWithZenjsonConfig = ctx.with(ZenjsonConfig.Provider(options));
    const getJsonBody = ctx.get(GetJsonBodyKeyConsumer);
    if (!getJsonBody) {
      return next(ctxWithZenjsonConfig);
    }
    const getZenjson: GetZenjsonBody = async () => {
      const json = await getJsonBody();
      return restore(json);
    };
    return next(
      ctxWithZenjsonConfig.with(GetZenjsonBodyKey.Provider(getZenjson)),
    );
  };
}
