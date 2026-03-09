// Import Internal Dependencies
import {
  DEFAULT_USER_AGENT,
  GITHUB_RAW_API
} from "../constants.ts";
import type { RequestConfig } from "../types.ts";

// CONSTANTS
const kDefaultRef = "HEAD";

export interface FetchRawFileOptions extends RequestConfig {
  /**
   * Branch, tag, or commit SHA.
   * @default "HEAD"
   */
  ref?: string;
}

export type FetchRawFileClientOptions = Omit<FetchRawFileOptions, "token" | "userAgent">;
export type RawFileParser<T> = "json" | ((content: string) => T);

export function fetchRawFile(
  repository: `${string}/${string}`,
  filePath: string,
  options?: FetchRawFileOptions & { parser?: undefined; }
): Promise<string>;
export function fetchRawFile<T = unknown>(
  repository: `${string}/${string}`,
  filePath: string,
  options: FetchRawFileOptions & { parser: "json"; }
): Promise<T>;
export function fetchRawFile<T>(
  repository: `${string}/${string}`,
  filePath: string,
  options: FetchRawFileOptions & { parser: (content: string) => T; }
): Promise<T>;
export async function fetchRawFile<T>(
  repository: `${string}/${string}`,
  filePath: string,
  options: FetchRawFileOptions & { parser?: RawFileParser<T>; } = {}
): Promise<string | T> {
  const {
    ref = kDefaultRef,
    token,
    userAgent = DEFAULT_USER_AGENT,
    parser
  } = options;

  const url = new URL(`${repository}/${ref}/${filePath}`, GITHUB_RAW_API);
  const headers: Record<string, string> = {
    "User-Agent": userAgent,
    ...(typeof token === "string" ? { Authorization: `token ${token}` } : {})
  };

  const response = await fetch(url, { headers });

  if (!response.ok) {
    throw new Error(
      `Failed to fetch raw file '${filePath}' from ${repository}@${ref}: HTTP ${response.status}`
    );
  }

  const content = await response.text();

  if (parser === "json") {
    return JSON.parse(content) as T;
  }
  if (typeof parser === "function") {
    return parser(content);
  }

  return content;
}
