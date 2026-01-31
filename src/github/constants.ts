import type { RESTOptions, RouteLike } from "./types";

export const DefaultUserAgent = "DiscordBot (https://github.com/shi-gg/discord-github-colab-role)";

export const DefaultRestOptions = {
    api: "https://api.github.com",
    authPrefix: "",
    version: "2022-11-28"
} as const satisfies Required<RESTOptions>;

export const Routes = {
    oauth2TokenExchange() {
        return "/login/oauth/access_token" as RouteLike;
    },
    user() {
        return "/user" as RouteLike;
    },
    repoContributors(owner: string, repo: string, page: number = 1) {
        return `/repos/${owner}/${repo}/contributors?per_page=100&page=${page}` as RouteLike;
    }
};