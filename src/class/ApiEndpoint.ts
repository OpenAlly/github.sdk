// Import Internal Dependencies
import { HttpLinkParser } from "./HttpLinkParser.ts";
import {
  DEFAULT_USER_AGENT,
  GITHUB_API
} from "../constants.ts";
import type { RequestConfig } from "../types.ts";

export interface ApiEndpointOptions<T> extends RequestConfig {
  /**
   * By default, the raw response from the GitHub API is returned as-is.
   * You can provide a custom extractor function to transform the raw response
   * into an array of type T.
   */
  extractor?: (raw: any) => T[];
}

export class ApiEndpoint<T> {
  #userAgent: string;
  #bearerToken?: string;

  #nextURL: string | null = null;
  #apiEndpoint: string | URL;
  #extractor: (raw: any) => T[];

  constructor(
    apiEndpoint: string | URL,
    options: ApiEndpointOptions<T> = {}
  ) {
    const {
      userAgent = DEFAULT_USER_AGENT,
      token,
      extractor = ((raw) => raw as T[])
    } = options;

    this.#userAgent = userAgent;
    this.#bearerToken = token;
    this.#apiEndpoint = apiEndpoint;
    this.#extractor = extractor;
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
      new URL(this.#apiEndpoint, GITHUB_API) :
      new URL(this.#nextURL, GITHUB_API);
    const response = await fetch(
      url,
      { headers }
    );
    const rawData = await response.json();

    const linkHeader = response.headers.get("link");
    this.#nextURL = linkHeader
      ? HttpLinkParser.parse(linkHeader).get("next") ?? null
      : null;

    return this.#extractor(rawData);
  }

  async* iterate(): AsyncIterableIterator<T> {
    do {
      const pageResults = await this.#next();

      yield* pageResults;
    } while (this.#nextURL !== null);
  }

  [Symbol.asyncIterator](): AsyncIterableIterator<T> {
    return this.iterate();
  }

  all(): Promise<T[]> {
    return Array.fromAsync(this.iterate());
  }

  then<TResult1 = T[], TResult2 = never>(
    onfulfilled?: ((value: T[]) => TResult1 | PromiseLike<TResult1>) | null,
    onrejected?: ((reason: any) => TResult2 | PromiseLike<TResult2>) | null
  ): Promise<TResult1 | TResult2> {
    return this.all().then(onfulfilled, onrejected);
  }
}
