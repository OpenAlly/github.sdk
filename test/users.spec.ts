// Import Node.js Dependencies
import { describe, it, beforeEach, afterEach } from "node:test";
import assert from "node:assert/strict";

// Import Third-party Dependencies
import { MockAgent, setGlobalDispatcher, getGlobalDispatcher, type Dispatcher } from "undici";

// Import Internal Dependencies
import { ApiEndpoint } from "../src/class/ApiEndpoint.ts";
import { users, createUsersProxy } from "../src/api/users.ts";

// CONSTANTS
const kGithubOrigin = "https://api.github.com";
const kUserEndpoints = ["orgs", "repos", "gists", "followers", "following", "starred"] as const;

describe("Users API", () => {
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

  describe("createUsersProxy()", () => {
    it("should return an ApiEndpoint for each standard user endpoint", () => {
      const proxy = createUsersProxy();

      for (const endpoint of kUserEndpoints) {
        const result = proxy.testuser[endpoint]();
        assert.ok(result instanceof ApiEndpoint, `${endpoint}() should return an ApiEndpoint`);
      }
    });

    it("should create independent ApiEndpoints per username", () => {
      const proxy = createUsersProxy();

      const fooOrgs = proxy.foo.orgs();
      const barOrgs = proxy.bar.orgs();

      assert.ok(fooOrgs instanceof ApiEndpoint);
      assert.ok(barOrgs instanceof ApiEndpoint);
      assert.notStrictEqual(fooOrgs, barOrgs);
    });

    it("should pass the token from config to the ApiEndpoint", async() => {
      const proxy = createUsersProxy({ token: "mytoken" });

      mockAgent
        .get(kGithubOrigin)
        .intercept({
          path: "/users/testuser/repos",
          method: "GET",
          headers: { authorization: "token mytoken" }
        })
        .reply(200, JSON.stringify([]), {
          headers: { "content-type": "application/json" }
        });

      await assert.doesNotReject(proxy.testuser.repos().all());
    });

    it("should create a new ApiEndpoint on each method call", () => {
      const proxy = createUsersProxy();

      const first = proxy.testuser.repos();
      const second = proxy.testuser.repos();

      assert.notStrictEqual(first, second);
    });
  });

  describe("users (default export)", () => {
    it("should be a UsersProxy with no token", async() => {
      mockAgent
        .get(kGithubOrigin)
        .intercept({ path: "/users/octocat/orgs", method: "GET" })
        .reply(200, JSON.stringify([{ id: 1, login: "github" }]), {
          headers: { "content-type": "application/json" }
        });

      const result = await users.octocat.orgs().all();

      assert.deepEqual(result, [{ id: 1, login: "github" }]);
    });

    it("should fetch repos for a user", async() => {
      mockAgent
        .get(kGithubOrigin)
        .intercept({ path: "/users/octocat/repos", method: "GET" })
        .reply(200, JSON.stringify([{ id: 42, name: "hello-world" }]), {
          headers: { "content-type": "application/json" }
        });

      const result = await users.octocat.repos().all();

      assert.deepEqual(result, [{ id: 42, name: "hello-world" }]);
    });

    it("should fetch followers for a user", async() => {
      mockAgent
        .get(kGithubOrigin)
        .intercept({ path: "/users/octocat/followers", method: "GET" })
        .reply(200, JSON.stringify([{ login: "user1" }, { login: "user2" }]), {
          headers: { "content-type": "application/json" }
        });

      const result = await users.octocat.followers().all();

      assert.deepEqual(result, [{ login: "user1" }, { login: "user2" }]);
    });

    it("should fetch following for a user", async() => {
      mockAgent
        .get(kGithubOrigin)
        .intercept({ path: "/users/octocat/following", method: "GET" })
        .reply(200, JSON.stringify([{ login: "user3" }]), {
          headers: { "content-type": "application/json" }
        });

      const result = await users.octocat.following().all();

      assert.deepEqual(result, [{ login: "user3" }]);
    });

    it("should fetch gists for a user", async() => {
      mockAgent
        .get(kGithubOrigin)
        .intercept({ path: "/users/octocat/gists", method: "GET" })
        .reply(200, JSON.stringify([{ id: "abc123" }]), {
          headers: { "content-type": "application/json" }
        });

      const result = await users.octocat.gists().all();

      assert.deepEqual(result, [{ id: "abc123" }]);
    });

    it("should fetch starred repos for a user", async() => {
      mockAgent
        .get(kGithubOrigin)
        .intercept({ path: "/users/octocat/starred", method: "GET" })
        .reply(200, JSON.stringify([{ id: 99, name: "starred-repo" }]), {
          headers: { "content-type": "application/json" }
        });

      const result = await users.octocat.starred().all();

      assert.deepEqual(result, [{ id: 99, name: "starred-repo" }]);
    });
  });
});
