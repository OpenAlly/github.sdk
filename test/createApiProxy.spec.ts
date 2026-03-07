/* eslint-disable no-unused-expressions */
// Import Node.js Dependencies
import { describe, it } from "node:test";
import assert from "node:assert/strict";

// Import Internal Dependencies
import { createApiProxy } from "../src/class/createApiProxy.ts";

describe("createApiProxy", () => {
  it("should call the factory with the accessed property key", () => {
    const proxy = createApiProxy((key: string) => key.toUpperCase());

    assert.equal(proxy.hello, "HELLO");
    assert.equal(proxy.world, "WORLD");
  });

  it("should call the factory on each property access", () => {
    let callCount = 0;
    const proxy = createApiProxy((key: string) => {
      callCount++;

      return key;
    });

    proxy.a;
    proxy.b;
    proxy.a;

    assert.equal(callCount, 3);
  });

  it("should return different values for different keys", () => {
    const proxy = createApiProxy((key: string) => {
      return { name: key };
    });

    assert.notDeepEqual(proxy.foo, proxy.bar);
    assert.equal(proxy.foo.name, "foo");
    assert.equal(proxy.bar.name, "bar");
  });

  it("should support nested proxies", () => {
    const proxy = createApiProxy(
      (owner: string) => createApiProxy(
        (repo: string) => `${owner}/${repo}`
      )
    );

    assert.equal(proxy.myorg.myrepo, "myorg/myrepo");
    assert.equal(proxy.another.sdk, "another/sdk");
  });

  it("should return a plain object (no prototype)", () => {
    const proxy = createApiProxy((key: string) => key);

    assert.equal(Object.getPrototypeOf(proxy), null);
  });
});
