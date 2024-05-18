export function dedent(
  strings: TemplateStringsArray,
  ...values: any[]
): string {
  let str = strings[0];
  for (let i = 0; i < values.length; i++) {
    str += values[i] + strings[i + 1];
  }
  const lines = str.split("\n");
  if (lines.at(0)?.trim().length === 0) lines.shift();
  if (lines.at(-1)?.trim().length === 0) lines.pop();

  const indent = lines.reduce((indent, line) => {
    if (/^\s*$/.test(line)) return indent;
    const lineIndent = line.match(/^\s*/)?.[0].length ?? 0;
    return lineIndent < indent ? lineIndent : indent;
  }, Infinity);
  return lines.map((line) => line.slice(indent)).join("\n");
}
