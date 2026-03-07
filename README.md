<p align="center"><h1 align="center">
  Github.SDK
</h1></p>

<p align="center">
  Opiniated Node.js Github SDK
</p>

<p align="center">
    <a href="https://github.com/OpenAlly/github.sdk">
      <img src="https://img.shields.io/github/package-json/v/OpenAlly/github.sdk?style=for-the-badge" alt="npm version">
    </a>
    <a href="https://github.com/OpenAlly/github.sdk">
      <img src="https://img.shields.io/github/license/OpenAlly/github.sdk?style=for-the-badge" alt="license">
    </a>
    <a href="https://api.securityscorecards.dev/projects/github.com/OpenAlly/github.sdk">
      <img src="https://api.securityscorecards.dev/projects/github.com/OpenAlly/github.sdk/badge?style=for-the-badge" alt="ossf scorecard">
    </a>
    <a href="https://github.com/OpenAlly/github.sdk/actions?query=workflow%3A%22Node.js+CI%22">
      <img src="https://img.shields.io/github/actions/workflow/status/OpenAlly/github.sdk/node.js.yml?style=for-the-badge" alt="github ci workflow">
    </a>
    <a href="https://github.com/OpenAlly/github.sdk">
      <img src="https://img.shields.io/github/languages/code-size/OpenAlly/github.sdk?style=for-the-badge" alt="size">
    </a>
</p>

## 🚧 Requirements

- [Node.js](https://nodejs.org/en/) version 24 or higher

## 🚀 Getting Started

This package is available in the Node Package Repository and can be easily installed with [npm](https://doc.npmjs.com/getting-started/what-is-npm) or [yarn](https://yarnpkg.com)

```bash
$ npm i @openally/github.sdk
# or
$ yarn add @openally/github.sdk
```

## 👀 Usage

```ts
import {
  repos,
  users
} from "@openally/github.sdk";

// Iterate over all pull requests (pagination handled automatically)
for await (const pr of repos.OpenAlly["github.sdk"].pulls().iterate()) {
  console.log(pr.title);
}

// Fetch all tags at once
const tags = await repos.OpenAlly["github.sdk"].tags().all();

// List all repos for a user
const userRepos = await users.torvalds.repos().all();

// Iterate over workflow runs for a specific workflow
for await (const run of repos.nodejs.node.workflowRuns("ci.yml").iterate()) {
  console.log(run.id, run.status);
}
```

Each method returns an `ApiEndpoint<T>` instance with:
- `.setBearerToken(token)` — attach a GitHub personal access token
- `.setAgent(userAgent)` — override the default `User-Agent` header
- `.iterate()` — `AsyncIterableIterator<T>` that handles pagination transparently
- `.all()` — `Promise<T[]>` collecting all pages

## 📚 API

### `repos[owner][repo]`

| Method | GitHub Documentation |
|---|---|
| `.tags()` | [List repository tags](https://docs.github.com/en/rest/repos/repos#list-repository-tags) |
| `.pulls()` | [List pull requests](https://docs.github.com/en/rest/pulls/pulls#list-pull-requests) |
| `.issues()` | [List repository issues](https://docs.github.com/en/rest/issues/issues#list-repository-issues) |
| `.commits()` | [List commits](https://docs.github.com/en/rest/commits/commits#list-commits) |
| `.workflows()` | [List repository workflows](https://docs.github.com/en/rest/actions/workflows#list-repository-workflows) |
| `.workflowRuns(workflowId)` | [List workflow runs for a workflow](https://docs.github.com/en/rest/actions/workflow-runs#list-workflow-runs-for-a-workflow) |
| `.runJobs(runId)` | [List jobs for a workflow run](https://docs.github.com/en/rest/actions/workflow-jobs#list-jobs-for-a-workflow-run) |
| `.runArtifacts(runId)` | [List workflow run artifacts](https://docs.github.com/en/rest/actions/artifacts#list-workflow-run-artifacts) |

### `users[username]`

| Method | GitHub Documentation |
|---|---|
| `.orgs()` | [List organizations for a user](https://docs.github.com/en/rest/orgs/orgs#list-organizations-for-a-user) |
| `.repos()` | [List repositories for a user](https://docs.github.com/en/rest/repos/repos#list-repositories-for-a-user) |
| `.gists()` | [List gists for a user](https://docs.github.com/en/rest/gists/gists#list-gists-for-a-user) |
| `.followers()` | [List followers of a user](https://docs.github.com/en/rest/users/followers#list-followers-of-a-user) |
| `.following()` | [List the people a user follows](https://docs.github.com/en/rest/users/followers#list-the-people-a-user-follows) |
| `.starred()` | [List repositories starred by a user](https://docs.github.com/en/rest/activity/starring#list-repositories-starred-by-a-user) |

## Contributors ✨

<!-- ALL-CONTRIBUTORS-BADGE:START - Do not remove or modify this section -->
[![All Contributors](https://img.shields.io/badge/all_contributors-2-orange.svg?style=flat-square)](#contributors-)
<!-- ALL-CONTRIBUTORS-BADGE:END -->

Thanks goes to these wonderful people ([emoji key](https://allcontributors.org/docs/en/emoji-key)):

<!-- ALL-CONTRIBUTORS-LIST:START - Do not remove or modify this section -->
<!-- prettier-ignore-start -->
<!-- markdownlint-disable -->


<!-- markdownlint-restore -->
<!-- prettier-ignore-end -->

<!-- ALL-CONTRIBUTORS-LIST:END -->

## License
MIT
