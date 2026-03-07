// Import Node.js Dependencies
import { describe, it } from "node:test";
import assert from "node:assert/strict";

// Import Internal Dependencies
import { HttpLinkParser } from "../src/class/HttpLinkParser.ts";

describe("HttpLinkParser", () => {
  describe("parse()", () => {
    it("should return a Map instance", () => {
      const result = HttpLinkParser.parse("");

      assert.ok(result instanceof Map);
    });

    it("should return an empty map for an empty string", () => {
      const result = HttpLinkParser.parse("");

      assert.equal(result.size, 0);
    });

    it("should return an empty map for a malformed header", () => {
      const result = HttpLinkParser.parse("not a link header");

      assert.equal(result.size, 0);
    });

    it("should parse a single link relation", () => {
      const header = '<https://api.github.com/repos/foo/bar/tags?page=2>; rel="next"';
      const result = HttpLinkParser.parse(header);

      assert.equal(result.size, 1);
      assert.equal(result.get("next"), "https://api.github.com/repos/foo/bar/tags?page=2");
    });

    it("should parse multiple link relations", () => {
      const header = [
        '<https://api.github.com/repos/foo/bar/tags?page=2>; rel="next"',
        '<https://api.github.com/repos/foo/bar/tags?page=5>; rel="last"'
      ].join(", ");
      const result = HttpLinkParser.parse(header);

      assert.equal(result.size, 2);
      assert.equal(result.get("next"), "https://api.github.com/repos/foo/bar/tags?page=2");
      assert.equal(result.get("last"), "https://api.github.com/repos/foo/bar/tags?page=5");
    });

    it("should parse all four standard link relations", () => {
      const header = [
        '<https://api.github.com/repos/foo/bar/tags?page=2>; rel="next"',
        '<https://api.github.com/repos/foo/bar/tags?page=5>; rel="last"',
        '<https://api.github.com/repos/foo/bar/tags?page=1>; rel="first"',
        '<https://api.github.com/repos/foo/bar/tags?page=1>; rel="prev"'
      ].join(", ");
      const result = HttpLinkParser.parse(header);

      assert.equal(result.size, 4);
      assert.ok(result.has("next"));
      assert.ok(result.has("last"));
      assert.ok(result.has("first"));
      assert.ok(result.has("prev"));
    });

    it("should ignore parts that have no URL match", () => {
      const header = 'no-url; rel="next"';
      const result = HttpLinkParser.parse(header);

      assert.equal(result.size, 0);
    });

    it("should ignore parts that have no rel match", () => {
      const header = "<https://api.github.com/repos/foo/bar/tags?page=2>";
      const result = HttpLinkParser.parse(header);

      assert.equal(result.size, 0);
    });
  });
});
