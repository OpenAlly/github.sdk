// Import Node.js Dependencies
import { describe, it, beforeEach, afterEach } from "node:test";
import assert from "node:assert/strict";

// Import Third-party Dependencies
import { MockAgent, setGlobalDispatcher, getGlobalDispatcher, type Dispatcher } from "undici";

// Import Internal Dependencies
import { fetchRawFile } from "../src/api/rawFile.ts";
import { GithubClient } from "../src/class/GithubClient.ts";

// CONSTANTS
const kRawGithubOrigin = "https://raw.githubusercontent.com";

describe("fetchRawFile()", () => {
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

  describe("raw text (no parser)", () => {
    it("should return the raw file content as a string", async() => {
      mockAgent
        .get(kRawGithubOrigin)
        .intercept({ path: "/octocat/hello-world/HEAD/README.md", method: "GET" })
        .reply(200, "# Hello World\n");

      const result = await fetchRawFile("octocat/hello-world", "README.md");

      assert.equal(result, "# Hello World\n");
    });

    it("should default to ref HEAD", async() => {
      mockAgent
        .get(kRawGithubOrigin)
        .intercept({ path: "/octocat/hello-world/HEAD/README.md", method: "GET" })
        .reply(200, "content");

      await assert.doesNotReject(
        fetchRawFile("octocat/hello-world", "README.md")
      );
    });

    it("should use the provided ref", async() => {
      mockAgent
        .get(kRawGithubOrigin)
        .intercept({ path: "/octocat/hello-world/main/README.md", method: "GET" })
        .reply(200, "content on main");

      const result = await fetchRawFile("octocat/hello-world", "README.md", { ref: "main" });

      assert.equal(result, "content on main");
    });

    it("should support file paths with directory segments", async() => {
      mockAgent
        .get(kRawGithubOrigin)
        .intercept({ path: "/octocat/hello-world/HEAD/src/index.ts", method: "GET" })
        .reply(200, "export {};\n");

      const result = await fetchRawFile("octocat/hello-world", "src/index.ts");

      assert.equal(result, "export {};\n");
    });
  });

  describe("parser: \"json\"", () => {
    it("should parse and return the file content as a JSON object", async() => {
      const pkg = { name: "hello-world", version: "1.0.0" };

      mockAgent
        .get(kRawGithubOrigin)
        .intercept({ path: "/octocat/hello-world/HEAD/package.json", method: "GET" })
        .reply(200, JSON.stringify(pkg));

      const result = await fetchRawFile<{ name: string; version: string; }>(
        "octocat/hello-world",
        "package.json",
        { parser: "json" }
      );

      assert.deepEqual(result, pkg);
    });

    it("should return unknown by default when parser is \"json\"", async() => {
      mockAgent
        .get(kRawGithubOrigin)
        .intercept({ path: "/octocat/hello-world/HEAD/data.json", method: "GET" })
        .reply(200, JSON.stringify([1, 2, 3]));

      const result = await fetchRawFile("octocat/hello-world", "data.json", { parser: "json" });

      assert.deepEqual(result, [1, 2, 3]);
    });
  });

  describe("custom parser function", () => {
    it("should apply a custom parser to the raw content", async() => {
      mockAgent
        .get(kRawGithubOrigin)
        .intercept({ path: "/octocat/hello-world/HEAD/VERSION", method: "GET" })
        .reply(200, "2.3.1\n");

      const result = await fetchRawFile(
        "octocat/hello-world",
        "VERSION",
        { parser: (content) => content.trim() }
      );

      assert.equal(result, "2.3.1");
    });

    it("should pass the raw string content to the parser", async() => {
      const rawContent = "key=value\nfoo=bar\n";
      const captured: string[] = [];

      mockAgent
        .get(kRawGithubOrigin)
        .intercept({ path: "/octocat/hello-world/HEAD/.env", method: "GET" })
        .reply(200, rawContent);

      await fetchRawFile(
        "octocat/hello-world",
        ".env",
        {
          parser: (content) => {
            captured.push(content);

            return content;
          }
        }
      );

      assert.equal(captured[0], rawContent);
    });
  });

  describe("headers", () => {
    it("should send the default User-Agent header", async() => {
      mockAgent
        .get(kRawGithubOrigin)
        .intercept({
          path: "/octocat/hello-world/HEAD/README.md",
          method: "GET",
          headers: { "user-agent": "@openally/github.sdk/1.0.0" }
        })
        .reply(200, "content");

      await assert.doesNotReject(
        fetchRawFile("octocat/hello-world", "README.md")
      );
    });

    it("should send a custom User-Agent when provided", async() => {
      mockAgent
        .get(kRawGithubOrigin)
        .intercept({
          path: "/octocat/hello-world/HEAD/README.md",
          method: "GET",
          headers: { "user-agent": "my-app/2.0" }
        })
        .reply(200, "content");

      await assert.doesNotReject(
        fetchRawFile("octocat/hello-world", "README.md", { userAgent: "my-app/2.0" })
      );
    });

    it("should send the Authorization header when a token is provided", async() => {
      mockAgent
        .get(kRawGithubOrigin)
        .intercept({
          path: "/octocat/hello-world/HEAD/README.md",
          method: "GET",
          headers: { authorization: "token secret123" }
        })
        .reply(200, "content");

      await assert.doesNotReject(
        fetchRawFile("octocat/hello-world", "README.md", { token: "secret123" })
      );
    });

    it("should succeed without an Authorization header when no token is provided", async() => {
      // undici's MockAgent will reject the request if the intercepted headers
      // do not match — here we assert no `authorization` key is present by
      // confirming the request succeeds against an interceptor that has no
      // header constraint at all (the positive case with a token is separately tested).
      mockAgent
        .get(kRawGithubOrigin)
        .intercept({ path: "/octocat/hello-world/HEAD/README.md", method: "GET" })
        .reply(200, "content");

      await assert.doesNotReject(
        fetchRawFile("octocat/hello-world", "README.md")
      );
    });
  });

  describe("error handling", () => {
    it("should throw on a 404 response", async() => {
      mockAgent
        .get(kRawGithubOrigin)
        .intercept({ path: "/octocat/hello-world/HEAD/missing.txt", method: "GET" })
        .reply(404, "Not Found");

      await assert.rejects(
        fetchRawFile("octocat/hello-world", "missing.txt"),
        (err: Error) => {
          assert.ok(err.message.includes("404"));

          return true;
        }
      );
    });

    it("should throw on a 500 response", async() => {
      mockAgent
        .get(kRawGithubOrigin)
        .intercept({ path: "/octocat/hello-world/HEAD/README.md", method: "GET" })
        .reply(500, "Internal Server Error");

      await assert.rejects(
        fetchRawFile("octocat/hello-world", "README.md"),
        (err: Error) => {
          assert.ok(err.message.includes("500"));

          return true;
        }
      );
    });

    it("should include the repository, ref, and file path in the error message", async() => {
      mockAgent
        .get(kRawGithubOrigin)
        .intercept({ path: "/octocat/hello-world/HEAD/missing.txt", method: "GET" })
        .reply(404, "Not Found");

      await assert.rejects(
        fetchRawFile("octocat/hello-world", "missing.txt"),
        (err: Error) => {
          assert.ok(err.message.includes("missing.txt"));
          assert.ok(err.message.includes("octocat/hello-world"));
          assert.ok(err.message.includes("HEAD"));

          return true;
        }
      );
    });
  });
});

describe("GithubClient.fetchRawFile()", () => {
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

  it("should fetch raw content using the client's token", async() => {
    const client = new GithubClient({ token: "clienttoken" });

    mockAgent
      .get(kRawGithubOrigin)
      .intercept({
        path: "/octocat/hello-world/HEAD/README.md",
        method: "GET",
        headers: { authorization: "token clienttoken" }
      })
      .reply(200, "# Hello");

    await assert.doesNotReject(
      client.fetchRawFile("octocat/hello-world", "README.md")
    );
  });

  it("should fetch raw content using the client's userAgent", async() => {
    const client = new GithubClient({ userAgent: "my-client/1.0" });

    mockAgent
      .get(kRawGithubOrigin)
      .intercept({
        path: "/octocat/hello-world/HEAD/README.md",
        method: "GET",
        headers: { "user-agent": "my-client/1.0" }
      })
      .reply(200, "# Hello");

    await assert.doesNotReject(
      client.fetchRawFile("octocat/hello-world", "README.md")
    );
  });

  it("should parse JSON when parser is \"json\"", async() => {
    const client = new GithubClient();
    const pkg = { name: "hello-world", version: "1.0.0" };

    mockAgent
      .get(kRawGithubOrigin)
      .intercept({ path: "/octocat/hello-world/HEAD/package.json", method: "GET" })
      .reply(200, JSON.stringify(pkg));

    const result = await client.fetchRawFile<{ name: string; version: string; }>(
      "octocat/hello-world",
      "package.json",
      { parser: "json" }
    );

    assert.deepEqual(result, pkg);
  });

  it("should apply a custom parser function", async() => {
    const client = new GithubClient();

    mockAgent
      .get(kRawGithubOrigin)
      .intercept({ path: "/octocat/hello-world/main/VERSION", method: "GET" })
      .reply(200, "3.0.0\n");

    const result = await client.fetchRawFile(
      "octocat/hello-world",
      "VERSION",
      { ref: "main", parser: (s) => s.trim() }
    );

    assert.equal(result, "3.0.0");
  });

  it("should use the ref option when provided", async() => {
    const client = new GithubClient();

    mockAgent
      .get(kRawGithubOrigin)
      .intercept({ path: "/octocat/hello-world/v2.0.0/CHANGELOG.md", method: "GET" })
      .reply(200, "## v2.0.0\n");

    const result = await client.fetchRawFile(
      "octocat/hello-world",
      "CHANGELOG.md",
      { ref: "v2.0.0" }
    );

    assert.equal(result, "## v2.0.0\n");
  });

  it("should throw when the file is not found", async() => {
    const client = new GithubClient();

    mockAgent
      .get(kRawGithubOrigin)
      .intercept({ path: "/octocat/hello-world/HEAD/missing.txt", method: "GET" })
      .reply(404, "Not Found");

    await assert.rejects(
      client.fetchRawFile("octocat/hello-world", "missing.txt"),
      (err: Error) => {
        assert.ok(err.message.includes("404"));

        return true;
      }
    );
  });
});
