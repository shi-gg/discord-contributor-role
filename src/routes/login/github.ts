// I love RFCs
import type { RESTPostOAuth2AccessTokenResult } from "discord-api-types/v10";

import { Routes } from "../../github/constants";
import { REST } from "../../github/rest";
import type { Contributor, RESTError, RESTGetAPIRepoContributorsResult, RESTGetAPIUserResult } from "../../github/types";
import { discordCookie, githubCookie } from "../../jwt";
import { assignDiscordRole, err, getRedirectUri, github } from "../../shared";

export async function loginGithub(request: Request, env: Env) {
    const { host, searchParams } = new URL(request.url);

    const code = searchParams.get("code");
    if (!code) return err(request, "Invalid code");

    const discordUser = await discordCookie.get(request);
    if (!discordUser) return err(request, "Invalid discord user");

    const access = await exchangeToken(env, host, code);
    if ("error_description" in access) return err(request, access.error_description);

    const rest = new REST({ version: "2022-11-28", authPrefix: "Bearer" }).setToken(access.access_token);
    const user = await rest.get(Routes.user()) as RESTGetAPIUserResult | RESTError;
    if (!user || "message" in user || !user.id || !user.login) return err(request, "Invalid user");

    const connection = await env.db.prepare("SELECT * FROM users WHERE github_id = ?").bind(user.id).first();
    if (connection && connection.discord_id !== discordUser.id) return err(request, "You already connected another account");

    const contributors = await getContributors(rest, env);
    if (!contributors || "message" in contributors || !Array.isArray(contributors)) return err(request, "Invalid contributors");

    if (!contributors.some((contributor) => contributor.id === user.id)) return err(request, "You must be a contributor to the repository");

    try {
        await env.db.prepare("INSERT INTO users (discord_id, github_id) VALUES (?, ?)").bind(discordUser.id, user.id).run();
    } catch (error) {
        console.error(error);
    }

    try {
        await assignDiscordRole(discordUser.id);
    } catch (error) {
        console.error(error);
        return err(request, "Failed to assign Discord role");
    }

    const token = await githubCookie.set(user.id, user.login);

    return new Response(null, {
        status: 302,
        headers: {
            Location: "/connection",
            "Set-Cookie": `github=${token}; Path=/; HttpOnly; Secure; SameSite=Lax; Max-Age=31536000`
        }
    });
}

async function exchangeToken(env: Env, host: string, code: string) {
    const params = new URLSearchParams();

    params.append("client_id", env.GITHUB_CLIENT_ID);
    params.append("client_secret", env.GITHUB_CLIENT_SECRET);
    params.append("redirect_uri", getRedirectUri(host, "github"));
    params.append("grant_type", "authorization_code");
    params.append("code", code);

    const access = await github.post(Routes.oauth2TokenExchange(), {
        auth: false,
        passThroughBody: true,
        headers: {
            "Content-Type": "application/x-www-form-urlencoded",
            accept: "application/json"
        },
        body: params
    }) as RESTPostOAuth2AccessTokenResult | { error_description: string; };

    return access;
}

async function getContributors(rest: REST, env: Env) {
    let page = 1;
    const contributors = [] as Contributor[];

    while (true) {
        const response = await rest.get(Routes.repoContributors(env.GITHUB_OWNER, env.GITHUB_REPO, page)) as RESTGetAPIRepoContributorsResult | RESTError;
        if ("message" in response) break;

        contributors.push(...response);

        if (response.length < 100) break;
        page++;
    }

    return contributors;
}