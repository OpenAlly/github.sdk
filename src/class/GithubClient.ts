// Import Internal Dependencies
import {
  createUsersProxy,
  type UsersProxy
} from "../api/users.ts";
import {
  createReposProxy,
  type ReposProxy
} from "../api/repos.ts";
import {
  fetchRawFile,
  type FetchRawFileClientOptions,
  type RawFileParser
} from "../api/rawFile.ts";
import type { RequestConfig } from "../types.ts";

export interface GithubClientOptions extends RequestConfig {}

export class GithubClient {
  readonly users: UsersProxy;
  readonly repos: ReposProxy;
  #config: RequestConfig;

  constructor(
    options: GithubClientOptions = {}
  ) {
    this.#config = {
      token: options.token,
      userAgent: options.userAgent
    };

    this.users = createUsersProxy(this.#config);
    this.repos = createReposProxy(this.#config);
  }

  fetchRawFile(
    repository: `${string}/${string}`,
    filePath: string,
    options?: FetchRawFileClientOptions & { parser?: undefined; }
  ): Promise<string>;
  fetchRawFile<T = unknown>(
    repository: `${string}/${string}`,
    filePath: string,
    options: FetchRawFileClientOptions & { parser: "json"; }
  ): Promise<T>;
  fetchRawFile<T>(
    repository: `${string}/${string}`,
    filePath: string,
    options: FetchRawFileClientOptions & { parser: (content: string) => T; }
  ): Promise<T>;
  fetchRawFile<T>(
    repository: `${string}/${string}`,
    filePath: string,
    options: FetchRawFileClientOptions & { parser?: RawFileParser<T>; } = {}
  ): Promise<string | T> {
    return fetchRawFile<T>(
      repository,
      filePath,
      { ...this.#config, ...options } as any
    );
  }
}
