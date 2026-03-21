// Import Third-party Dependencies
import type { Endpoints } from "@octokit/types";

export interface RequestConfig {
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

// --- Repo entity types ---
export type Tag = Endpoints["GET /repos/{owner}/{repo}/tags"]["response"]["data"][number];
export type PullRequest = Endpoints["GET /repos/{owner}/{repo}/pulls"]["response"]["data"][number];
export type Issue = Endpoints["GET /repos/{owner}/{repo}/issues"]["response"]["data"][number];
export type Commit = Endpoints["GET /repos/{owner}/{repo}/commits"]["response"]["data"][number];
export type Contributor = Endpoints["GET /repos/{owner}/{repo}/contributors"]["response"]["data"][number];
export type Workflow = Endpoints["GET /repos/{owner}/{repo}/actions/workflows"]["response"]["data"]["workflows"][number];
export type WorkflowRun = Endpoints[
  "GET /repos/{owner}/{repo}/actions/workflows/{workflow_id}/runs"
]["response"]["data"]["workflow_runs"][number];
export type Job = Endpoints["GET /repos/{owner}/{repo}/actions/runs/{run_id}/jobs"]["response"]["data"]["jobs"][number];
export type Artifact = Endpoints[
  "GET /repos/{owner}/{repo}/actions/runs/{run_id}/artifacts"
]["response"]["data"]["artifacts"][number];

// Extractor response types (envelope objects returned by the GitHub API)
export type WorkflowsResponse = Endpoints["GET /repos/{owner}/{repo}/actions/workflows"]["response"]["data"];
export type WorkflowRunsResponse = Endpoints[
  "GET /repos/{owner}/{repo}/actions/workflows/{workflow_id}/runs"
]["response"]["data"];
export type JobsResponse = Endpoints["GET /repos/{owner}/{repo}/actions/runs/{run_id}/jobs"]["response"]["data"];
export type ArtifactsResponse = Endpoints["GET /repos/{owner}/{repo}/actions/runs/{run_id}/artifacts"]["response"]["data"];

// --- User entity types ---
export type UserOrg = Endpoints["GET /users/{username}/orgs"]["response"]["data"][number];
export type UserRepo = Endpoints["GET /users/{username}/repos"]["response"]["data"][number];
export type UserGist = Endpoints["GET /users/{username}/gists"]["response"]["data"][number];
export type UserFollower = Endpoints["GET /users/{username}/followers"]["response"]["data"][number];
export type UserFollowing = Endpoints["GET /users/{username}/following"]["response"]["data"][number];
export type UserStarred = Endpoints["GET /users/{username}/starred"]["response"]["data"][number];
