# users

The `users` proxy provides access to GitHub user endpoints.

```ts
import { users } from "@openally/github.sdk";

// Collect all repositories for a user
const repos = await users.torvalds.repos().all();

// Stream followers one by one
for await (const follower of users.torvalds.followers().iterate()) {
  console.log(follower.login);
}

// Collect all starred repositories
const starred = await users.torvalds.starred().all();
```

## Access pattern

```ts
users[username].<method>()
```

All methods return an [`ApiEndpoint<T>`](./ApiEndpoint.md) instance.

## Methods

### `.orgs()`

Returns `ApiEndpoint<UserOrg>`.

Lists all organizations the user belongs to.

> GitHub docs: [List organizations for a user](https://docs.github.com/en/rest/orgs/orgs#list-organizations-for-a-user)

### `.repos()`

Returns `ApiEndpoint<UserRepo>`.

Lists all public repositories for the user.

> GitHub docs: [List repositories for a user](https://docs.github.com/en/rest/repos/repos#list-repositories-for-a-user)

### `.gists()`

Returns `ApiEndpoint<UserGist>`.

Lists all public gists for the user.

> GitHub docs: [List gists for a user](https://docs.github.com/en/rest/gists/gists#list-gists-for-a-user)

### `.followers()`

Returns `ApiEndpoint<UserFollower>`.

Lists all followers of the user.

> GitHub docs: [List followers of a user](https://docs.github.com/en/rest/users/followers#list-followers-of-a-user)

### `.following()`

Returns `ApiEndpoint<UserFollowing>`.

Lists all users the user follows.

> GitHub docs: [List the people a user follows](https://docs.github.com/en/rest/users/followers#list-the-people-a-user-follows)

### `.starred()`

Returns `ApiEndpoint<UserStarred>`.

Lists all repositories starred by the user.

> GitHub docs: [List repositories starred by a user](https://docs.github.com/en/rest/activity/starring#list-repositories-starred-by-a-user)
