export function printHttpHeaders(response: Response) {
  const headers = Array.from(response.headers.entries())
    .sort((l, r) => l[0].localeCompare(r[0]));
  return [
    `HTTP/1.1 ${response.status}${
      response.statusText ? " " + response.statusText : ""
    }`,
    ...headers.map(([key, value]) => {
      return formatValue(key, value);
    }),
  ].join("\n");
}

function formatHeaderName(name: string) {
  return name
    .split("-")
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join("-");
}

function formatValue(key: string, value: string) {
  // hide date to match every time
  if (key.toLowerCase() === "date") {
    return `${formatHeaderName(key)}: Xxx, XX Xxx XXXX XX:XX:XX GMT`;
  }
  return `${formatHeaderName(key)}: ${value}`;
}
