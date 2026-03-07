// Import Internal Dependencies
import { ApiEndpoint } from "../class/ApiEndpoint.ts";
import { createApiProxy } from "../class/createApiProxy.ts";
import type {
  Tag,
  PullRequest,
  Issue,
  Commit,
  Workflow,
  WorkflowRun,
  Job,
  Artifact,
  WorkflowsResponse,
  WorkflowRunsResponse,
  JobsResponse,
  ArtifactsResponse,
  RequestConfig
} from "../types.ts";

type RepoEndpointMethods = {
  tags: () => ApiEndpoint<Tag>;
  pulls: () => ApiEndpoint<PullRequest>;
  issues: () => ApiEndpoint<Issue>;
  commits: () => ApiEndpoint<Commit>;
  workflows: () => ApiEndpoint<Workflow>;
  workflowRuns: (workflowId: string | number) => ApiEndpoint<WorkflowRun>;
  runJobs: (runId: number) => ApiEndpoint<Job>;
  runArtifacts: (runId: number) => ApiEndpoint<Artifact>;
};

export type ReposProxy = {
  [owner: string]: {
    [repo: string]: RepoEndpointMethods;
  };
};

function createRepoProxy(
  owner: string,
  repo: string,
  config: RequestConfig = {}
): RepoEndpointMethods {
  return {
    tags: () => new ApiEndpoint<Tag>(`/repos/${owner}/${repo}/tags`, config),
    pulls: () => new ApiEndpoint<PullRequest>(`/repos/${owner}/${repo}/pulls`, config),
    issues: () => new ApiEndpoint<Issue>(`/repos/${owner}/${repo}/issues`, config),
    commits: () => new ApiEndpoint<Commit>(`/repos/${owner}/${repo}/commits`, config),
    workflows: () => new ApiEndpoint<Workflow>(
      `/repos/${owner}/${repo}/actions/workflows`,
      { ...config, extractor: (raw: WorkflowsResponse) => raw.workflows }
    ),
    workflowRuns: (workflowId: string | number) => new ApiEndpoint<WorkflowRun>(
      `/repos/${owner}/${repo}/actions/workflows/${workflowId}/runs`,
      { ...config, extractor: (raw: WorkflowRunsResponse) => raw.workflow_runs }
    ),
    runJobs: (runId: number) => new ApiEndpoint<Job>(
      `/repos/${owner}/${repo}/actions/runs/${runId}/jobs`,
      { ...config, extractor: (raw: JobsResponse) => raw.jobs }
    ),
    runArtifacts: (runId: number) => new ApiEndpoint<Artifact>(
      `/repos/${owner}/${repo}/actions/runs/${runId}/artifacts`,
      { ...config, extractor: (raw: ArtifactsResponse) => raw.artifacts }
    )
  };
}

export function createReposProxy(config: RequestConfig = {}): ReposProxy {
  return createApiProxy(
    (owner) => createApiProxy(
      (repo) => createRepoProxy(owner, repo, config)
    )
  ) as ReposProxy;
}

export const repos = createReposProxy();
