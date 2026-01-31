import { env } from "cloudflare:workers";

import connectionHtml from "./templates/connection.html";
import errorHtml from "./templates/error.html";
import layoutHtml from "./templates/layout.html";

export function render(title: string, content: string) {
    return layoutHtml
        .replace("{{title}}", title)
        .replaceAll("{{name}}", `${env.GITHUB_OWNER}/${env.GITHUB_REPO}`)
        .replace("{{content}}", content);
}

export function renderConnection(discordUsername: string, discordAvatar: string, githubUsername: string, githubAvatar: string) {
    const content = connectionHtml
        .replace("{{discordUsername}}", discordUsername)
        .replace("{{discordAvatar}}", discordAvatar)
        .replace("{{githubUsername}}", githubUsername)
        .replace("{{githubAvatar}}", githubAvatar);

    return render("Success", content);
}

export function renderError(message: string) {
    const content = errorHtml.replace("{{message}}", message);
    return render("Error", content);
}