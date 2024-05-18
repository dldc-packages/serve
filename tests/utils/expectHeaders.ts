import { expect } from "@std/expect";
import { dedent } from "./dedent.ts";
import { printHttpHeaders } from "./printHttpHeaders.ts";

export function expectHeaders(res: Response, expected: string) {
  return expect(printHttpHeaders(res)).toEqual(dedent`${expected}`);
}
