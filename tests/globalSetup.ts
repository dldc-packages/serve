import { Response } from 'undici';
import { expect } from 'vitest';

expect.addSnapshotSerializer({
  print(val) {
    const response = val as Response;
    const headers = Array.from(response.headers.entries());
    const sortedHeaders = headers.sort((l, r) => (l[0] < r[0] ? -1 : l[0] > r[0] ? 1 : 0));
    return [
      `HTTP/1.1 ${response.status}${response.statusText ? ' ' + response.statusText : ''}`,
      ...sortedHeaders.map(([key, value]) => {
        return formatValue(key, value);
      }),
    ].join('\n');
  },
  test(val) {
    return val instanceof Response;
  },
});

function formatHeaderName(name: string) {
  return name
    .split('-')
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join('-');
}

function formatValue(key: string, value: string) {
  // hide date to match every time
  if (key.toLowerCase() === 'date') {
    return `${formatHeaderName(key)}: Xxx, XX Xxx XXXX XX:XX:XX GMT`;
  }
  return `${formatHeaderName(key)}: ${value}`;
}
