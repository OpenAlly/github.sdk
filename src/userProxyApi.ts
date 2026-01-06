// Import Third-party Dependencies
import type { Endpoints } from "@octokit/types";

// Import Internal Dependencies
import { ApiEndpoint } from "./class/ApiEndpoint.ts";

// CONSTANTS
const kUserEndpointResponseMap = {
  orgs: {} as Endpoints["GET /users/{username}/orgs"]["response"]["data"][number],
  repos: {} as Endpoints["GET /users/{username}/repos"]["response"]["data"][number],
  gists: {} as Endpoints["GET /users/{username}/gists"]["response"]["data"][number],
  followers: {} as Endpoints["GET /users/{username}/followers"]["response"]["data"][number],
  following: {} as Endpoints["GET /users/{username}/following"]["response"]["data"][number],
  starred: {} as Endpoints["GET /users/{username}/starred"]["response"]["data"][number]
};

type UserEndpoint = keyof typeof kUserEndpointResponseMap;
type UserEndpointMethods = {
  [K in UserEndpoint]: () => ApiEndpoint<typeof kUserEndpointResponseMap[K]>;
};
type UsersProxy = {
  [username: string]: UserEndpointMethods;
};

function createUserProxy(
  username: string
): UserEndpointMethods {
  return new Proxy({} as UserEndpointMethods, {
    get(_, endpoint: string) {
      if (endpoint in kUserEndpointResponseMap) {
        return () => new ApiEndpoint(`/users/${username}/${endpoint}`);
      }

      return undefined;
    }
  });
}

export const users = new Proxy(Object.create(null), {
  get(_, username: string) {
    return createUserProxy(username);
  }
}) as UsersProxy;
