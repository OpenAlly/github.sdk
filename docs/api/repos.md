# repos

The `repos` proxy provides access to GitHub repository endpoints.

```ts
import { repos } from "@openally/github.sdk";

// Collect all tags
const tags = await repos.OpenAlly["github.sdk"].tags();

// Collect all contributors
const contributors = await repos.OpenAlly["github.sdk"].contributors();

// Stream pull requests page by page
for await (const pr of repos.nodejs.node.pulls()) {
  console.log(pr.number, pr.title);
}

// Stream workflow runs for a specific workflow file
for await (const run of repos.nodejs.node.workflowRuns("ci.yml")) {
  console.log(run.id, run.status);
}

// Collect all jobs for a specific run
const jobs = await repos.nodejs.node.runJobs(12345678);
```

## Access pattern

```ts
repos[owner][repo].<method>()
```

All methods return an [`ApiEndpoint<T>`](./ApiEndpoint.md) instance.

## Methods

### `.tags()`

Returns `ApiEndpoint<Tag>`.

Lists all tags for the repository.

> GitHub docs: [List repository tags](https://docs.github.com/en/rest/repos/repos#list-repository-tags)

### `.pulls()`

Returns `ApiEndpoint<PullRequest>`.

Lists pull requests.

> GitHub docs: [List pull requests](https://docs.github.com/en/rest/pulls/pulls#list-pull-requests)

### `.issues()`

Returns `ApiEndpoint<Issue>`.

Lists repository issues.

> GitHub docs: [List repository issues](https://docs.github.com/en/rest/issues/issues#list-repository-issues)

### `.commits()`

Returns `ApiEndpoint<Commit>`.

Lists commits.

> GitHub docs: [List commits](https://docs.github.com/en/rest/commits/commits#list-commits)

### `.contributors()`

Returns `ApiEndpoint<Contributor>`.

Lists contributors to the repository, sorted by number of commits.

> GitHub docs: [List repository contributors](https://docs.github.com/en/rest/repos/repos#list-repository-contributors)

### `.workflows()`

Returns `ApiEndpoint<Workflow>`.

Lists all GitHub Actions workflows defined in the repository.

> GitHub docs: [List repository workflows](https://docs.github.com/en/rest/actions/workflows#list-repository-workflows)

### `.workflowRuns(workflowId: string | number)`

Returns `ApiEndpoint<WorkflowRun>`.

Lists runs for a specific workflow, identified by filename (e.g. `"ci.yml"`) or numeric ID.

> GitHub docs: [List workflow runs for a workflow](https://docs.github.com/en/rest/actions/workflow-runs#list-workflow-runs-for-a-workflow)

### `.runJobs(runId: number)`

Returns `ApiEndpoint<Job>`.

Lists all jobs for a given workflow run.

> GitHub docs: [List jobs for a workflow run](https://docs.github.com/en/rest/actions/workflow-jobs#list-jobs-for-a-workflow-run)

### `.runArtifacts(runId: number)`

Returns `ApiEndpoint<Artifact>`.

Lists all artifacts produced by a given workflow run.

> GitHub docs: [List workflow run artifacts](https://docs.github.com/en/rest/actions/artifacts#list-workflow-run-artifacts)
