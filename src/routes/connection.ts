import { discordCookie, githubCookie } from "../jwt";
import { err } from "../shared";
import { renderConnection } from "../templates";

export async function connection(request: Request) {
    const discordUser = await discordCookie.get(request);
    const githubUser = await githubCookie.get(request);

    if (!discordUser || !githubUser) {
        return err(request, "Unauthorized");
    }

    const discordAvatar = discordUser.avatar
        ? `https://cdn.discordapp.com/avatars/${discordUser.id}/${discordUser.avatar}.png`
        : `https://cdn.discordapp.com/embed/avatars/${Number(discordUser.id) % 5}.png`;

    const githubAvatar = `https://github.com/${githubUser.login}.png`;

    const html = renderConnection(discordUser.username, discordAvatar, githubUser.login, githubAvatar);

    return new Response(html, {
        headers: { "Content-Type": "text/html" },
        status: 200
    });
}