import { discordCookie, githubCookie } from "../jwt";
import { generateDiscordOauthUrl } from "../shared";

export async function index(request: Request) {
    const { searchParams } = new URL(request.url);
    if (searchParams.get("force") !== "true" && await discordCookie.get(request) && await githubCookie.get(request)) {
        return new Response(null, {
            status: 302,
            headers: {
                Location: "/connection"
            }
        });
    }

    const { host } = new URL(request.url);
    const url = generateDiscordOauthUrl(host);

    return new Response(null, {
        status: 302,
        headers: {
            Location: url
        }
    });
}