import { env } from "cloudflare:workers";
import { OAuth2Scopes, Routes } from "discord-api-types/v10";

import { REST as DiscordREST } from "./discord/rest";
import { REST as GithubREST } from "./github/rest";

export const discord = new DiscordREST({ version: "10" }).setToken(env.DISCORD_BOT_TOKEN);
export const github = new GithubREST({ version: "2022-11-28" }).setToken(env.GITHUB_PAT);

export const getRedirectUri = (host: string, platform: "discord" | "github") => `https://${host}/login/${platform}`;

export function generateDiscordOauthUrl(host: string) {
    const params = new URLSearchParams();

    params.append("client_id", env.DISCORD_CLIENT_ID);
    params.append("redirect_uri", getRedirectUri(host, "discord"));
    params.append("response_type", "code");
    params.append("scope", [OAuth2Scopes.Identify, OAuth2Scopes.GuildsMembersRead].join(" "));

    return "https://discord.com/oauth2/authorize?" + params.toString();
}

export function generateGithubOauthUrl(host: string) {
    const params = new URLSearchParams();

    params.append("client_id", env.GITHUB_CLIENT_ID);
    params.append("redirect_uri", getRedirectUri(host, "github"));
    params.append("prompt", "select_account");
    params.append("allow_signup", "false");
    params.append("response_type", "code");

    return "https://github.com/login/oauth/authorize?" + params.toString();
}

export function err(request: Request, message: string) {
    return Response.redirect(new URL(`/error?message=${encodeURIComponent(message)}`, request.url).toString(), 302);
}

export function assignDiscordRole(userId: string) {
    return discord.put(Routes.guildMemberRole(env.DISCORD_SERVER_ID, userId, env.DISCORD_ROLE_ID));
}