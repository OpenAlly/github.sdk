// Import Internal Dependencies
import { ApiEndpoint } from "../class/ApiEndpoint.ts";
import { createApiProxy } from "../class/createApiProxy.ts";
import type {
  UserOrg,
  UserRepo,
  UserGist,
  UserFollower,
  UserFollowing,
  UserStarred,
  RequestConfig
} from "../types.ts";

// CONSTANTS
const kUserEndpointResponseMap = {
  orgs: {} as UserOrg,
  repos: {} as UserRepo,
  gists: {} as UserGist,
  followers: {} as UserFollower,
  following: {} as UserFollowing,
  starred: {} as UserStarred
};

type UserEndpoint = keyof typeof kUserEndpointResponseMap;
type UserEndpointMethods = {
  [K in UserEndpoint]: () => ApiEndpoint<typeof kUserEndpointResponseMap[K]>;
};
export type UsersProxy = {
  [username: string]: UserEndpointMethods;
};

function createUserProxy(
  username: string,
  config: RequestConfig = {}
): UserEndpointMethods {
  return Object.fromEntries(
    (Object.keys(kUserEndpointResponseMap) as UserEndpoint[]).map(
      (endpoint) => [endpoint, () => new ApiEndpoint(`/users/${username}/${endpoint}`, config)]
    )
  ) as UserEndpointMethods;
}

export function createUsersProxy(config: RequestConfig = {}): UsersProxy {
  return createApiProxy((username) => createUserProxy(username, config)) as UsersProxy;
}

export const users = createUsersProxy();
