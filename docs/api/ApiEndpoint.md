# ApiEndpoint

Every endpoint method returns an `ApiEndpoint<T>` instance. It transparently handles pagination, authentication, and data extraction.

```ts
import { repos } from "@openally/github.sdk";

const endpoint = repos.nodejs.node.pulls()
  .setBearerToken(process.env.GITHUB_TOKEN)
  .setAgent("my-app/1.0.0");

// Stream items one by one across all pages
for await (const pr of endpoint) {
  console.log(pr.title);
}

// Or collect everything at once
const allPRs = await endpoint;
```

## Methods

### `.setBearerToken(token: string): this`

Attaches a GitHub personal access token as a `Bearer` authorization header. Returns the instance for chaining.

### `.setAgent(userAgent: string): this`

Overrides the `User-Agent` request header. Returns the instance for chaining.

### `.iterate(): AsyncIterableIterator<T>`

Asynchronously iterates over all items across all pages. Pagination is handled transparently via GitHub's `Link` response header — you never need to manage page numbers or cursors manually.

### `.all(): Promise<T[]>`

Collects all pages and resolves with a flat array of every item.

### `[Symbol.asyncIterator](): AsyncIterableIterator<T>`

Makes `ApiEndpoint` compatible with `for await...of` loops. Internally delegates to `.iterate()`, so pagination is handled transparently.

```ts
for await (const pr of endpoint) {
  console.log(pr.title);
}
```

### `.then(onfulfilled?, onrejected?): Promise<TResult1 | TResult2>`

Makes `ApiEndpoint` a **Thenable**, so it can be `await`-ed directly without calling `.all()` explicitly. Internally delegates to `.all()`.

```ts
// These two are equivalent:
const prs = await endpoint;
const prs = await endpoint.all();
```

This also means `ApiEndpoint` instances can be passed to `Promise.resolve()`, used in `Promise.all()`, and chained with `.then()` / `.catch()` / `.finally()` like a regular promise.

```ts
endpoint
  .then((prs) => prs.filter((pr) => pr.draft === false))
  .then(console.log)
  .catch(console.error);
```
