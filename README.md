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
import { GithubClient } from "@openally/github.sdk";

const github = new GithubClient({
  token: process.env.GITHUB_TOKEN
});

for await (const pr of github.repos.nodejs.node.pulls()) {
  console.log(pr.title);
}

const tags = await github.repos.OpenAlly["github.sdk"].tags();

const userRepos = await github.users.torvalds.repos();
```

## 📚 API

- [ApiEndpoint](./docs/api/ApiEndpoint.md)
- [GithubClient](./docs/api/GithubClient.md)

Available GitHub APIs:

- [repos](./docs/api/repos.md)
- [users](./docs/api/users.md)
- [fetchRawFile](./docs/api/fetchRawFile.md)

---

Proxy provides access to GitHub repository endpoints.

```ts
import { repos } from "@openally/github.sdk";
```

Via GithubClient (recommended for authenticated use)

```ts
import { GithubClient } from "@openally/github.sdk";

const { repos } = new GithubClient({
  token: process.env.GITHUB_TOKEN
});
```

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
