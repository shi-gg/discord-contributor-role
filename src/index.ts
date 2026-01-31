import { index } from "./routes";
import { connection } from "./routes/connection";
import { error } from "./routes/error";
import { loginDiscord } from "./routes/login/discord";
import { loginGithub } from "./routes/login/github";
import { render } from "./templates";

export default {
    fetch(request, env): Promise<Response> | Response {
        if (request.method !== "GET") return new Response("Method Not Allowed", { status: 405 });

        if (request.headers.get("User-Agent")?.includes("Discordbot/2.0")) {
            return new Response(render(env.GITHUB_REPO, "Link your GitHub account to your Discord account."), {
                headers: { "Content-Type": "text/html" }
            });
        }

        const path = new URL(request.url).pathname;

        switch (path) {
            case "/": return index(request);
            case "/login/discord": return loginDiscord(request, env);
            case "/login/github": return loginGithub(request, env);
            case "/connection": return connection(request);
            case "/error": return error(request);
        }

        return new Response("Not Found", { status: 404 });
    }
} satisfies ExportedHandler<Env>;