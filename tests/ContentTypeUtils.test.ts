import { expect } from "@std/expect";
import { ContentType } from "../mod.ts";

const invalidTypes = [
  " ",
  "null",
  "undefined",
  "/",
  "text / plain",
  "text/;plain",
  'text/"plain"',
  "text/p£ain",
  "text/(plain)",
  "text/@plain",
  "text/plain,wrong",
];

Deno.test("should parse basic type", () => {
  const type = ContentType.parse("text/html");
  expect(type.type).toBe("text/html");
});

Deno.test("should parse with suffix", () => {
  const type = ContentType.parse("image/svg+xml");
  expect(type.type).toBe("image/svg+xml");
});

Deno.test("should parse basic type with surrounding OWS", () => {
  const type = ContentType.parse(" text/html ");
  expect(type.type).toBe("text/html");
});

Deno.test("should parse parameters", () => {
  const type = ContentType.parse("text/html; charset=utf-8; foo=bar");
  expect(type.type).toBe("text/html");
  expect(type.parameters).toEqual({
    charset: "utf-8",
    foo: "bar",
  });
});

Deno.test("should parse parameters with extra LWS", () => {
  const type = ContentType.parse("text/html ; charset=utf-8 ; foo=bar");
  expect(type.type).toBe("text/html");
  expect(type.parameters).toEqual({
    charset: "utf-8",
    foo: "bar",
  });
});

Deno.test("should lower-case type", () => {
  const type = ContentType.parse("IMAGE/SVG+XML");
  expect(type.type).toBe("image/svg+xml");
});

Deno.test("should lower-case parameter names", () => {
  const type = ContentType.parse("text/html; Charset=UTF-8");
  expect(type.type).toBe("text/html");
  expect(type.parameters).toEqual({
    charset: "UTF-8",
  });
});

Deno.test("should unquote parameter values", () => {
  const type = ContentType.parse('text/html; charset="UTF-8"');
  expect(type.type).toBe("text/html");
  expect(type.parameters).toEqual({
    charset: "UTF-8",
  });
});

Deno.test("should unquote parameter values with escapes", () => {
  const type = ContentType.parse('text/html; charset = "UT\\F-\\\\\\"8\\""');
  expect(type.type).toBe("text/html");
  expect(type.parameters).toEqual({
    charset: 'UTF-\\"8"',
  });
});

Deno.test("should handle balanced quotes", () => {
  const type = ContentType.parse(
    'text/html; param="charset=\\"utf-8\\"; foo=bar"; bar=foo',
  );
  expect(type.type).toBe("text/html");
  expect(type.parameters).toEqual({
    param: 'charset="utf-8"; foo=bar',
    bar: "foo",
  });
});

invalidTypes.forEach(function (type) {
  Deno.test("should throw on invalid media type: " + type, () => {
    expect(() => ContentType.parse(type)).toThrow(/invalid media type/);
  });
});

Deno.test("should throw on invalid parameter format", () => {
  expect(() => ContentType.parse('text/plain; foo="bar')).toThrow(
    /invalid parameter format/,
  );
  expect(() =>
    ContentType.parse("text/plain; profile=http://localhost; foo=bar")
  ).toThrow(
    /invalid parameter format/,
  );
  expect(() => ContentType.parse("text/plain; profile=http://localhost"))
    .toThrow(/invalid parameter format/);
});

Deno.test("parse weird stuff from unidici", () => {
  const parsed = ContentType.parse(
    "multipart/form-data; boundary=----formdata-undici-057891035902",
  );
  expect(parsed).toEqual({
    type: "multipart/form-data",
    parameters: {
      boundary: "----formdata-undici-057891035902",
    },
  });
});

Deno.test("should format basic type", function () {
  const str = ContentType.format("text/html");
  expect(str).toBe("text/html");
});

Deno.test("should format type with suffix", function () {
  const str = ContentType.format("image/svg+xml");
  expect(str).toBe("image/svg+xml");
});

Deno.test("should format type with parameter", function () {
  const str = ContentType.format("text/html", { charset: "utf-8" });
  expect(str).toBe("text/html; charset=utf-8");
});

Deno.test("should format type with parameter that needs quotes", function () {
  const str = ContentType.format("text/html", { foo: 'bar or "baz"' });
  expect(str).toBe('text/html; foo="bar or \\"baz\\""');
});

Deno.test("should format type with parameter with empty value", function () {
  const str = ContentType.format("text/html", { foo: "" });
  expect(str).toBe('text/html; foo=""');
});

Deno.test("should format type with multiple parameters", function () {
  const str = ContentType.format("text/html", {
    charset: "utf-8",
    foo: "bar",
    bar: "baz",
  });
  expect(str).toBe("text/html; bar=baz; charset=utf-8; foo=bar");
});

Deno.test("should reject invalid type", function () {
  expect(() => ContentType.format("text/")).toThrow(/invalid type/);
});

Deno.test("should reject invalid type with LWS", function () {
  expect(() => ContentType.format(" text/html")).toThrow(/invalid type/);
});

Deno.test("should reject invalid parameter name", function () {
  expect(() => ContentType.format("image/svg", { "foo/": "bar" })).toThrow(
    /invalid parameter name/,
  );
});

Deno.test("should reject invalid parameter value", function () {
  expect(() => ContentType.format("image/svg", { foo: "bar\u0000" })).toThrow(
    /invalid parameter value/,
  );
});
