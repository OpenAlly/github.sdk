// Import Internal Dependencies
import {
  createUsersProxy,
  type UsersProxy
} from "../api/users.ts";
import {
  createReposProxy,
  type ReposProxy
} from "../api/repos.ts";

export interface GithubClientOptions {
  token?: string;
  userAgent?: string;
}

export class GithubClient {
  readonly users: UsersProxy;
  readonly repos: ReposProxy;

  constructor(
    options: GithubClientOptions = {}
  ) {
    const config = {
      token: options.token,
      userAgent: options.userAgent
    };

    this.users = createUsersProxy(config);
    this.repos = createReposProxy(config);
  }
}
