export function request(init: RequestInit = {}) {
  return new Request("http://localhost.test", {
    method: "GET",
    ...init,
  });
}
