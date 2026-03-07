// Import Node.js Dependencies
import { describe, it, beforeEach, afterEach } from "node:test";
import assert from "node:assert/strict";

// Import Third-party Dependencies
import { MockAgent, setGlobalDispatcher, getGlobalDispatcher, type Dispatcher } from "undici";

// Import Internal Dependencies
import { ApiEndpoint } from "../src/class/ApiEndpoint.ts";

// CONSTANTS
const kGithubOrigin = "https://api.github.com";

describe("ApiEndpoint", () => {
  let mockAgent: MockAgent;
  let originalDispatcher: Dispatcher;

  beforeEach(() => {
    originalDispatcher = getGlobalDispatcher();
    mockAgent = new MockAgent();
    mockAgent.disableNetConnect();
    setGlobalDispatcher(mockAgent);
  });

  afterEach(async() => {
    await mockAgent.close();
    setGlobalDispatcher(originalDispatcher);
  });

  describe("constructor", () => {
    it("should accept a string endpoint", () => {
      const endpoint = new ApiEndpoint("/users/foo/repos");

      assert.ok(endpoint instanceof ApiEndpoint);
    });

    it("should accept a URL endpoint", () => {
      const endpoint = new ApiEndpoint(new URL("https://api.github.com/users/foo/repos"));

      assert.ok(endpoint instanceof ApiEndpoint);
    });
  });

  describe("setBearerToken()", () => {
    it("should return this for chaining", () => {
      const endpoint = new ApiEndpoint("/users/foo/repos");

      assert.strictEqual(endpoint.setBearerToken("mytoken"), endpoint);
    });
  });

  describe("setAgent()", () => {
    it("should return this for chaining", () => {
      const endpoint = new ApiEndpoint("/users/foo/repos");

      assert.strictEqual(endpoint.setAgent("my-agent/1.0"), endpoint);
    });
  });

  describe("all()", () => {
    it("should fetch a single page and return all items", async() => {
      mockAgent
        .get(kGithubOrigin)
        .intercept({ path: "/users/foo/repos", method: "GET" })
        .reply(200, JSON.stringify([{ id: 1 }, { id: 2 }]), {
          headers: { "content-type": "application/json" }
        });

      const result = await new ApiEndpoint("/users/foo/repos").all();

      assert.deepEqual(result, [{ id: 1 }, { id: 2 }]);
    });

    it("should return an empty array when the response is empty", async() => {
      mockAgent
        .get(kGithubOrigin)
        .intercept({ path: "/users/foo/repos", method: "GET" })
        .reply(200, JSON.stringify([]), {
          headers: { "content-type": "application/json" }
        });

      const result = await new ApiEndpoint("/users/foo/repos").all();

      assert.deepEqual(result, []);
    });

    it("should follow pagination using the link header", async() => {
      const pool = mockAgent.get(kGithubOrigin);

      pool
        .intercept({ path: "/users/foo/repos", method: "GET" })
        .reply(200, JSON.stringify([{ id: 1 }]), {
          headers: {
            "content-type": "application/json",
            link: '<https://api.github.com/users/foo/repos?page=2>; rel="next"'
          }
        });

      pool
        .intercept({ path: "/users/foo/repos?page=2", method: "GET" })
        .reply(200, JSON.stringify([{ id: 2 }]), {
          headers: { "content-type": "application/json" }
        });

      const result = await new ApiEndpoint("/users/foo/repos").all();

      assert.deepEqual(result, [{ id: 1 }, { id: 2 }]);
    });

    it("should follow multiple pages until no next link", async() => {
      const pool = mockAgent.get(kGithubOrigin);

      pool
        .intercept({ path: "/users/foo/repos", method: "GET" })
        .reply(200, JSON.stringify([{ id: 1 }]), {
          headers: {
            "content-type": "application/json",
            link: '<https://api.github.com/users/foo/repos?page=2>; rel="next"'
          }
        });

      pool
        .intercept({ path: "/users/foo/repos?page=2", method: "GET" })
        .reply(200, JSON.stringify([{ id: 2 }]), {
          headers: {
            "content-type": "application/json",
            link: '<https://api.github.com/users/foo/repos?page=3>; rel="next"'
          }
        });

      pool
        .intercept({ path: "/users/foo/repos?page=3", method: "GET" })
        .reply(200, JSON.stringify([{ id: 3 }]), {
          headers: { "content-type": "application/json" }
        });

      const result = await new ApiEndpoint("/users/foo/repos").all();

      assert.deepEqual(result, [{ id: 1 }, { id: 2 }, { id: 3 }]);
    });
  });

  describe("iterate()", () => {
    it("should yield items one at a time", async() => {
      mockAgent
        .get(kGithubOrigin)
        .intercept({ path: "/users/foo/repos", method: "GET" })
        .reply(200, JSON.stringify([{ id: 1 }, { id: 2 }]), {
          headers: { "content-type": "application/json" }
        });

      const items: unknown[] = [];
      for await (const item of new ApiEndpoint("/users/foo/repos").iterate()) {
        items.push(item);
      }

      assert.deepEqual(items, [{ id: 1 }, { id: 2 }]);
    });

    it("should yield items across paginated pages", async() => {
      const pool = mockAgent.get(kGithubOrigin);

      pool
        .intercept({ path: "/users/foo/repos", method: "GET" })
        .reply(200, JSON.stringify([{ id: 1 }]), {
          headers: {
            "content-type": "application/json",
            link: '<https://api.github.com/users/foo/repos?page=2>; rel="next"'
          }
        });

      pool
        .intercept({ path: "/users/foo/repos?page=2", method: "GET" })
        .reply(200, JSON.stringify([{ id: 2 }, { id: 3 }]), {
          headers: { "content-type": "application/json" }
        });

      const items: unknown[] = [];
      for await (const item of new ApiEndpoint("/users/foo/repos").iterate()) {
        items.push(item);
      }

      assert.deepEqual(items, [{ id: 1 }, { id: 2 }, { id: 3 }]);
    });
  });

  describe("Symbol.asyncIterator", () => {
    it("should yield items one at a time", async() => {
      mockAgent
        .get(kGithubOrigin)
        .intercept({ path: "/users/foo/repos", method: "GET" })
        .reply(200, JSON.stringify([{ id: 1 }, { id: 2 }]), {
          headers: { "content-type": "application/json" }
        });

      const items: unknown[] = [];
      for await (const item of new ApiEndpoint("/users/foo/repos")) {
        items.push(item);
      }

      assert.deepEqual(items, [{ id: 1 }, { id: 2 }]);
    });

    it("should yield items across paginated pages", async() => {
      const pool = mockAgent.get(kGithubOrigin);

      pool
        .intercept({ path: "/users/foo/repos", method: "GET" })
        .reply(200, JSON.stringify([{ id: 1 }]), {
          headers: {
            "content-type": "application/json",
            link: '<https://api.github.com/users/foo/repos?page=2>; rel="next"'
          }
        });

      pool
        .intercept({ path: "/users/foo/repos?page=2", method: "GET" })
        .reply(200, JSON.stringify([{ id: 2 }, { id: 3 }]), {
          headers: { "content-type": "application/json" }
        });

      const items: unknown[] = [];
      for await (const item of new ApiEndpoint("/users/foo/repos")) {
        items.push(item);
      }

      assert.deepEqual(items, [{ id: 1 }, { id: 2 }, { id: 3 }]);
    });
  });

  describe("headers", () => {
    it("should send the default User-Agent header", async() => {
      mockAgent
        .get(kGithubOrigin)
        .intercept({
          path: "/users/foo/repos",
          method: "GET",
          headers: { "user-agent": "@openally/github.sdk/1.0.0" }
        })
        .reply(200, JSON.stringify([]), {
          headers: { "content-type": "application/json" }
        });

      // If header doesn't match, undici will throw — this is the assertion
      await assert.doesNotReject(
        new ApiEndpoint("/users/foo/repos").all()
      );
    });

    it("should send a custom User-Agent when set via setAgent()", async() => {
      mockAgent
        .get(kGithubOrigin)
        .intercept({
          path: "/users/foo/repos",
          method: "GET",
          headers: { "user-agent": "custom-agent/2.0" }
        })
        .reply(200, JSON.stringify([]), {
          headers: { "content-type": "application/json" }
        });

      await assert.doesNotReject(
        new ApiEndpoint("/users/foo/repos").setAgent("custom-agent/2.0").all()
      );
    });

    it("should send the Authorization header when a token is provided", async() => {
      mockAgent
        .get(kGithubOrigin)
        .intercept({
          path: "/users/foo/repos",
          method: "GET",
          headers: { authorization: "token secret123" }
        })
        .reply(200, JSON.stringify([]), {
          headers: { "content-type": "application/json" }
        });

      await assert.doesNotReject(
        new ApiEndpoint("/users/foo/repos", { token: "secret123" }).all()
      );
    });

    it("should send the Authorization header when set via setBearerToken()", async() => {
      mockAgent
        .get(kGithubOrigin)
        .intercept({
          path: "/users/foo/repos",
          method: "GET",
          headers: { authorization: "token runtime-token" }
        })
        .reply(200, JSON.stringify([]), {
          headers: { "content-type": "application/json" }
        });

      await assert.doesNotReject(
        new ApiEndpoint("/users/foo/repos").setBearerToken("runtime-token").all()
      );
    });
  });

  describe("extractor", () => {
    it("should apply the extractor to transform the raw response", async() => {
      const workflows = [{ id: 10 }, { id: 20 }];

      mockAgent
        .get(kGithubOrigin)
        .intercept({ path: "/repos/foo/bar/actions/workflows", method: "GET" })
        .reply(200, JSON.stringify({ total_count: 2, workflows }), {
          headers: { "content-type": "application/json" }
        });

      const result = await new ApiEndpoint(
        "/repos/foo/bar/actions/workflows",
        { extractor: (raw) => raw.workflows }
      ).all();

      assert.deepEqual(result, workflows);
    });

    it("should apply the extractor on every page when paginating", async() => {
      const pool = mockAgent.get(kGithubOrigin);

      pool
        .intercept({ path: "/repos/foo/bar/actions/workflows", method: "GET" })
        .reply(200, JSON.stringify({ total_count: 3, workflows: [{ id: 10 }] }), {
          headers: {
            "content-type": "application/json",
            link: '<https://api.github.com/repos/foo/bar/actions/workflows?page=2>; rel="next"'
          }
        });

      pool
        .intercept({ path: "/repos/foo/bar/actions/workflows?page=2", method: "GET" })
        .reply(200, JSON.stringify({ total_count: 3, workflows: [{ id: 20 }, { id: 30 }] }), {
          headers: { "content-type": "application/json" }
        });

      const result = await new ApiEndpoint(
        "/repos/foo/bar/actions/workflows",
        { extractor: (raw) => raw.workflows }
      ).all();

      assert.deepEqual(result, [{ id: 10 }, { id: 20 }, { id: 30 }]);
    });
  });
});
