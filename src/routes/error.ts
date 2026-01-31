import { renderError } from "../templates";

export function error(request: Request) {
    const { searchParams } = new URL(request.url);
    const message = searchParams.get("message") || "An unknown error occurred.";

    const html = renderError(message);

    return new Response(html, {
        headers: { "Content-Type": "text/html" },
        status: 200
    });
}