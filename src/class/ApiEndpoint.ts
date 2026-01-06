// Import Internal Dependencies
import * as utils from "../utils/index.ts";

// CONSTANTS
const kGithubURL = new URL("https://api.github.com/");

/**
 * @see https://github.com/dashlog/fetch-github-repositories/blob/master/src/api.ts#L66
 * @see https://github.com/fraxken/dep-updater/blob/master/src/githubActions.ts#L97C53-L97C66
 */

export class ApiEndpoint<T> {
  #userAgent: string;
  #bearerToken?: string;

  #nextURL: string | null = null;
  #apiEndpoint: string | URL;

  constructor(
    apiEndpoint: string | URL
  ) {
    this.#userAgent = "@openally/github.sdk/1.0.0";
    this.#apiEndpoint = apiEndpoint;
  }

  setBearerToken(
    token: string
  ): this {
    this.#bearerToken = token;

    return this;
  }

  setAgent(
    userAgent: string
  ): this {
    this.#userAgent = userAgent;

    return this;
  }

  async #next(): Promise<T[]> {
    const headers = {
      "User-Agent": this.#userAgent,
      Accept: "application/vnd.github.v3.raw",
      ...(
        typeof this.#bearerToken === "string" ?
          { Authorization: `token ${this.#bearerToken}` } :
          {}
      )
    };

    const url = this.#nextURL === null ?
      new URL(this.#apiEndpoint, kGithubURL) :
      new URL(this.#nextURL, kGithubURL);
    const response = await fetch(
      url,
      { headers }
    );
    const data = await response.json() as T[];

    const linkHeader = response.headers.get("link");
    this.#nextURL = utils.getNextPageURL(linkHeader);

    return data;
  }

  async* iterate(): AsyncIterableIterator<T> {
    do {
      const pageResults = await this.#next();

      yield* pageResults;
    } while (this.#nextURL !== null);
  }

  all(): Promise<T[]> {
    return utils.fromAsync(this.iterate());
  }
}
