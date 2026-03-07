// Import Internal Dependencies
import { HttpLinkParser } from "./HttpLinkParser.ts";

// CONSTANTS
const kGithubURL = new URL("https://api.github.com/");

export class ApiEndpointOptions<T> {
  /**
   * By default, the raw response from the GitHub API is returned as-is.
   * You can provide a custom extractor function to transform the raw response
   * into an array of type T.
   */
  extractor?: (raw: any) => T[];
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
      userAgent = "@openally/github.sdk/1.0.0",
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
      new URL(this.#apiEndpoint, kGithubURL) :
      new URL(this.#nextURL, kGithubURL);
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

  all(): Promise<T[]> {
    return Array.fromAsync(this.iterate());
  }
}
