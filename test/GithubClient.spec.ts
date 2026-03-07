// Import Node.js Dependencies
import { describe, it, beforeEach, afterEach } from "node:test";
import assert from "node:assert/strict";

// Import Third-party Dependencies
import { MockAgent, setGlobalDispatcher, getGlobalDispatcher, type Dispatcher } from "undici";

// Import Internal Dependencies
import { GithubClient } from "../src/class/GithubClient.ts";
import { ApiEndpoint } from "../src/class/ApiEndpoint.ts";

// CONSTANTS
const kGithubOrigin = "https://api.github.com";

describe("GithubClient", () => {
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
    it("should instantiate with no options", () => {
      const client = new GithubClient();

      assert.ok(client instanceof GithubClient);
    });

    it("should instantiate with a token", () => {
      const client = new GithubClient({ token: "mytoken" });

      assert.ok(client instanceof GithubClient);
    });

    it("should instantiate with a custom userAgent", () => {
      const client = new GithubClient({ userAgent: "my-app/1.0" });

      assert.ok(client instanceof GithubClient);
    });

    it("should expose a users proxy", () => {
      const client = new GithubClient();

      assert.ok(client.users !== undefined);
    });

    it("should expose a repos proxy", () => {
      const client = new GithubClient();

      assert.ok(client.repos !== undefined);
    });
  });

  describe("client.users", () => {
    it("should return ApiEndpoints for user sub-resources", () => {
      const client = new GithubClient();

      assert.ok(client.users.foo.repos() instanceof ApiEndpoint);
      assert.ok(client.users.foo.orgs() instanceof ApiEndpoint);
    });

    it("should use the configured token when fetching user data", async() => {
      const client = new GithubClient({ token: "clienttoken" });

      mockAgent
        .get(kGithubOrigin)
        .intercept({
          path: "/users/octocat/repos",
          method: "GET",
          headers: { authorization: "token clienttoken" }
        })
        .reply(200, JSON.stringify([{ id: 1 }]), {
          headers: { "content-type": "application/json" }
        });

      const result = await client.users.octocat.repos().all();

      assert.deepEqual(result, [{ id: 1 }]);
    });

    it("should fetch user data without a token", async() => {
      const client = new GithubClient();

      mockAgent
        .get(kGithubOrigin)
        .intercept({ path: "/users/octocat/followers", method: "GET" })
        .reply(200, JSON.stringify([{ login: "user1" }]), {
          headers: { "content-type": "application/json" }
        });

      const result = await client.users.octocat.followers().all();

      assert.deepEqual(result, [{ login: "user1" }]);
    });
  });

  describe("client.repos", () => {
    it("should return ApiEndpoints for repo sub-resources", () => {
      const client = new GithubClient();

      assert.ok(
        client.repos.owner.myrepo.tags() instanceof ApiEndpoint
      );
      assert.ok(
        client.repos.owner.myrepo.pulls() instanceof ApiEndpoint
      );
      assert.ok(
        client.repos.owner.myrepo.workflows() instanceof ApiEndpoint
      );
    });

    it("should use the configured token when fetching repo data", async() => {
      const client = new GithubClient({ token: "repotoken" });

      mockAgent
        .get(kGithubOrigin)
        .intercept({
          path: "/repos/octocat/hello-world/tags",
          method: "GET",
          headers: { authorization: "token repotoken" }
        })
        .reply(200, JSON.stringify([{ name: "v1.0.0" }]), {
          headers: { "content-type": "application/json" }
        });

      const result = await client.repos.octocat["hello-world"]
        .tags()
        .all();

      assert.deepEqual(result, [{ name: "v1.0.0" }]);
    });

    it("should use the configured userAgent when fetching", async() => {
      const client = new GithubClient({ userAgent: "my-app/1.0" });

      mockAgent
        .get(kGithubOrigin)
        .intercept({
          path: "/repos/octocat/hello-world/tags",
          method: "GET",
          headers: { "user-agent": "my-app/1.0" }
        })
        .reply(200, JSON.stringify([]), {
          headers: { "content-type": "application/json" }
        });

      await assert.doesNotReject(
        client.repos.octocat["hello-world"].tags().all()
      );
    });

    it("should fetch workflows with the envelope extractor", async() => {
      const client = new GithubClient();
      const workflows = [{ id: 7, name: "CI" }];

      mockAgent
        .get(kGithubOrigin)
        .intercept({
          path: "/repos/octocat/hello-world/actions/workflows",
          method: "GET"
        })
        .reply(200, JSON.stringify({ total_count: 1, workflows }), {
          headers: { "content-type": "application/json" }
        });

      const result = await client.repos.octocat["hello-world"]
        .workflows()
        .all();

      assert.deepEqual(
        result,
        workflows
      );
    });
  });
});
