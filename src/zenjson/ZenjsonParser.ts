import { Key } from '@dldc/stack';
import * as zen from '@dldc/zenjson';
import { Middleware } from '../core/mod';
import { GetJsonBodyKeyConsumer } from '../json/mod';

export type GetZenjsonBody = () => Promise<any>;

export const GetZenjsonBodyKey = Key.create<GetZenjsonBody>('ZenjsonParser');
export const GetZenjsonBodyKeyConsumer = GetZenjsonBodyKey.Consumer;

interface IZenjsonConfig {
  sanitize?: typeof zen.sanitize;
  restore?: typeof zen.restore;
}

export const ZenjsonConfig = Key.create<IZenjsonConfig>('ZenjsonConfig');

export function ZenjsonParser(options: IZenjsonConfig = {}): Middleware {
  const restore = options.restore ?? zen.restore;

  return async (ctx, next): Promise<any> => {
    const ctxWithZenjsonConfig = ctx.with(ZenjsonConfig.Provider(options));
    const getJsonBody = ctx.get(GetJsonBodyKeyConsumer);
    if (!getJsonBody) {
      return next(ctxWithZenjsonConfig);
    }
    const getZenjson: GetZenjsonBody = async () => {
      const json = await getJsonBody();
      return restore(json);
    };
    return next(ctxWithZenjsonConfig.with(GetZenjsonBodyKey.Provider(getZenjson)));
  };
}
