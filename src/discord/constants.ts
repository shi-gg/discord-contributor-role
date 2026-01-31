export interface RESTOptions {
    api: string;
    authPrefix: "Bot" | "Bearer";
    version: string;
}

export const DefaultUserAgent = "DiscordBot (https://github.com/shi-gg/discord-github-colab-role)";

export const DefaultRestOptions = {
    api: "https://discord.com/api",
    authPrefix: "Bot",
    version: "10"
} as const satisfies RESTOptions;