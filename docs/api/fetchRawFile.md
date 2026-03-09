# fetchRawFile

Fetches the raw content of a file from a GitHub repository via `raw.githubusercontent.com`.

```ts
import { fetchRawFile } from "@openally/github.sdk";

// Fetch file as plain text (default)
const content = await fetchRawFile("nodejs/node", "README.md");

// Fetch and parse as JSON
const pkg = await fetchRawFile<{ version: string }>("nodejs/node", "package.json", {
  parser: "json"
});

// Fetch and parse with a custom parser
const lines = await fetchRawFile("nodejs/node", ".gitignore", {
  parser: (content) => content.split("\n").filter(Boolean)
});

// Fetch from a specific branch or tag
const content = await fetchRawFile("nodejs/node", "README.md", {
  ref: "v20.0.0"
});

// Fetch a private file with a token
const content = await fetchRawFile("myorg/private-repo", "config.json", {
  token: process.env.GITHUB_TOKEN,
  parser: "json"
});
```

## Signature

```ts
function fetchRawFile(
  repository: `${string}/${string}`,
  filePath: string,
  options?: FetchRawFileOptions
): Promise<string>;

function fetchRawFile<T>(
  repository: `${string}/${string}`,
  filePath: string,
  options: FetchRawFileOptions & { parser: "json" }
): Promise<T>;

function fetchRawFile<T>(
  repository: `${string}/${string}`,
  filePath: string,
  options: FetchRawFileOptions & { parser: (content: string) => T }
): Promise<T>;
```

## Parameters

### `repository`

Type: `` `${string}/${string}` ``

The repository in `owner/repo` format (e.g. `"nodejs/node"`).

### `filePath`

Type: `string`

Path to the file within the repository (e.g. `"src/index.ts"` or `"README.md"`).

### `options`

```ts
interface FetchRawFileOptions extends RequestConfig {
  /**
   * Branch, tag, or commit SHA.
   * @default "HEAD"
   */
  ref?: string;
}

interface RequestConfig {
  /**
   * A personal access token is required to access private resources,
   * and to increase the rate limit for unauthenticated requests.
   */
  token?: string;
  /**
   * @default "@openally/github.sdk/1.0.0"
   * @see https://docs.github.com/en/rest/using-the-rest-api/getting-started-with-the-rest-api?apiVersion=2022-11-28#user-agent
   */
  userAgent?: string;
}

```

## Return value

- `Promise<string>` when no `parser` is provided.
- `Promise<T>` when `parser: "json"` or a custom parser function is provided.

## Errors

Throws an `Error` if the HTTP response is not `ok` (e.g. 404 for a missing file, 401 for an unauthorized request):

```
Failed to fetch raw file 'README.md' from nodejs/node@HEAD: HTTP 404
```
