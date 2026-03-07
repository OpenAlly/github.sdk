// Import Node.js Dependencies
import { describe, it, beforeEach, afterEach } from "node:test";
import assert from "node:assert/strict";

// Import Third-party Dependencies
import { MockAgent, setGlobalDispatcher, getGlobalDispatcher, type Dispatcher } from "undici";

// Import Internal Dependencies
import { ApiEndpoint } from "../src/class/ApiEndpoint.ts";
import { repos, createReposProxy } from "../src/api/repos.ts";

// CONSTANTS
const kGithubOrigin = "https://api.github.com";

describe("Repos API", () => {
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

  describe("createReposProxy()", () => {
    it("should return an ApiEndpoint for each simple repo endpoint", () => {
      const proxy = createReposProxy();
      const methods = proxy.owner.myrepo;

      assert.ok(methods.tags() instanceof ApiEndpoint);
      assert.ok(methods.pulls() instanceof ApiEndpoint);
      assert.ok(methods.issues() instanceof ApiEndpoint);
      assert.ok(methods.commits() instanceof ApiEndpoint);
      assert.ok(methods.workflows() instanceof ApiEndpoint);
    });

    it("should return an ApiEndpoint from workflowRuns() with a string workflow id", () => {
      const endpoint = createReposProxy().owner.myrepo.workflowRuns("ci.yml");

      assert.ok(endpoint instanceof ApiEndpoint);
    });

    it("should return an ApiEndpoint from workflowRuns() with a numeric workflow id", () => {
      const endpoint = createReposProxy().owner.myrepo.workflowRuns(42);

      assert.ok(endpoint instanceof ApiEndpoint);
    });

    it("should return an ApiEndpoint from runJobs()", () => {
      const endpoint = createReposProxy().owner.myrepo.runJobs(123);

      assert.ok(endpoint instanceof ApiEndpoint);
    });

    it("should return an ApiEndpoint from runArtifacts()", () => {
      const endpoint = createReposProxy().owner.myrepo.runArtifacts(456);

      assert.ok(endpoint instanceof ApiEndpoint);
    });

    it("should create a new ApiEndpoint on each method call", () => {
      const proxy = createReposProxy();

      assert.notStrictEqual(proxy.owner.myrepo.tags(), proxy.owner.myrepo.tags());
    });

    it("should pass the token from config to ApiEndpoints", async() => {
      const proxy = createReposProxy({ token: "repotoken" });

      mockAgent
        .get(kGithubOrigin)
        .intercept({
          path: "/repos/owner/myrepo/tags",
          method: "GET",
          headers: { authorization: "token repotoken" }
        })
        .reply(200, JSON.stringify([]), {
          headers: { "content-type": "application/json" }
        });

      await assert.doesNotReject(proxy.owner.myrepo.tags().all());
    });
  });

  describe("repos (default export)", () => {
    it("should fetch tags for a repo", async() => {
      mockAgent
        .get(kGithubOrigin)
        .intercept({ path: "/repos/octocat/hello-world/tags", method: "GET" })
        .reply(200, JSON.stringify([{ name: "v1.0.0" }, { name: "v1.1.0" }]), {
          headers: { "content-type": "application/json" }
        });

      const result = await repos.octocat["hello-world"].tags().all();

      assert.deepEqual(result, [{ name: "v1.0.0" }, { name: "v1.1.0" }]);
    });

    it("should fetch pull requests for a repo", async() => {
      mockAgent
        .get(kGithubOrigin)
        .intercept({ path: "/repos/octocat/hello-world/pulls", method: "GET" })
        .reply(200, JSON.stringify([{ number: 1, title: "Fix bug" }]), {
          headers: { "content-type": "application/json" }
        });

      const result = await repos.octocat["hello-world"].pulls().all();

      assert.deepEqual(result, [{ number: 1, title: "Fix bug" }]);
    });

    it("should fetch issues for a repo", async() => {
      mockAgent
        .get(kGithubOrigin)
        .intercept({ path: "/repos/octocat/hello-world/issues", method: "GET" })
        .reply(200, JSON.stringify([{ number: 5, title: "Bug report" }]), {
          headers: { "content-type": "application/json" }
        });

      const result = await repos.octocat["hello-world"].issues().all();

      assert.deepEqual(result, [{ number: 5, title: "Bug report" }]);
    });

    it("should fetch commits for a repo", async() => {
      mockAgent
        .get(kGithubOrigin)
        .intercept({ path: "/repos/octocat/hello-world/commits", method: "GET" })
        .reply(200, JSON.stringify([{ sha: "abc123" }]), {
          headers: { "content-type": "application/json" }
        });

      const result = await repos.octocat["hello-world"].commits().all();

      assert.deepEqual(result, [{ sha: "abc123" }]);
    });

    it("should fetch workflows using the extractor", async() => {
      mockAgent
        .get(kGithubOrigin)
        .intercept({ path: "/repos/octocat/hello-world/actions/workflows", method: "GET" })
        .reply(200, JSON.stringify({ total_count: 1, workflows: [{ id: 1, name: "CI" }] }), {
          headers: { "content-type": "application/json" }
        });

      const result = await repos.octocat["hello-world"].workflows().all();

      assert.deepEqual(result, [{ id: 1, name: "CI" }]);
    });

    it("should fetch workflow runs by string workflow id using the extractor", async() => {
      mockAgent
        .get(kGithubOrigin)
        .intercept({
          path: "/repos/octocat/hello-world/actions/workflows/ci.yml/runs",
          method: "GET"
        })
        .reply(200, JSON.stringify({ total_count: 1, workflow_runs: [{ id: 100, status: "completed" }] }), {
          headers: { "content-type": "application/json" }
        });

      const result = await repos.octocat["hello-world"].workflowRuns("ci.yml").all();

      assert.deepEqual(result, [{ id: 100, status: "completed" }]);
    });

    it("should fetch workflow runs by numeric workflow id using the extractor", async() => {
      mockAgent
        .get(kGithubOrigin)
        .intercept({
          path: "/repos/octocat/hello-world/actions/workflows/42/runs",
          method: "GET"
        })
        .reply(200, JSON.stringify({ total_count: 2, workflow_runs: [{ id: 200 }, { id: 201 }] }), {
          headers: { "content-type": "application/json" }
        });

      const result = await repos.octocat["hello-world"].workflowRuns(42).all();

      assert.deepEqual(result, [{ id: 200 }, { id: 201 }]);
    });

    it("should fetch run jobs using the extractor", async() => {
      mockAgent
        .get(kGithubOrigin)
        .intercept({
          path: "/repos/octocat/hello-world/actions/runs/999/jobs",
          method: "GET"
        })
        .reply(200, JSON.stringify({ total_count: 1, jobs: [{ id: 10, name: "build" }] }), {
          headers: { "content-type": "application/json" }
        });

      const result = await repos.octocat["hello-world"].runJobs(999).all();

      assert.deepEqual(result, [{ id: 10, name: "build" }]);
    });

    it("should fetch run artifacts using the extractor", async() => {
      mockAgent
        .get(kGithubOrigin)
        .intercept({
          path: "/repos/octocat/hello-world/actions/runs/999/artifacts",
          method: "GET"
        })
        .reply(200, JSON.stringify({ total_count: 1, artifacts: [{ id: 55, name: "build-output" }] }), {
          headers: { "content-type": "application/json" }
        });

      const result = await repos.octocat["hello-world"].runArtifacts(999).all();

      assert.deepEqual(result, [{ id: 55, name: "build-output" }]);
    });
  });
});
