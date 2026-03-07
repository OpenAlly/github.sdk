# GithubClient

`GithubClient` is the recommended entry point when you need a shared token or `User-Agent` applied to every request without configuring each endpoint individually.

```ts
import { GithubClient } from "@openally/github.sdk";

const github = new GithubClient({
  token: process.env.GITHUB_TOKEN,
  userAgent: "my-app/1.0.0"
});

// Iterate over all open pull requests
for await (const pr of github.repos.OpenAlly["github.sdk"].pulls()) {
  console.log(pr.title);
}

// Collect all tags at once
const tags = await github.repos.OpenAlly["github.sdk"].tags();

// List all repositories for a user
const userRepos = await github.users.torvalds.repos();
```

## Constructor

```ts
new GithubClient(options?: GithubClientOptions)
```

```ts
interface GithubClientOptions {
  /**
   * GitHub personal access token sent as a Bearer authorization header.
   * Required for private resources and to increase the API rate limit.
   */
  token?: string;

  /**
   * Value for the User-Agent request header.
   * @default "@openally/github.sdk/1.0.0"
   */
  userAgent?: string;
}
```

## Properties

- **`repos`** — `ReposProxy` — see [repos](./repos.md)
- **`users`** — `UsersProxy` — see [users](./users.md)
