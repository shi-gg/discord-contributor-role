import { env } from "cloudflare:workers";
import { jwtVerify, SignJWT } from "jose";

const secret = new TextEncoder().encode(env.SECRET);

async function sign(payload: Record<string, unknown>) {
    return await new SignJWT(payload)
        .setProtectedHeader({ alg: "HS256" })
        .setIssuedAt()
        .sign(secret);
}

async function verify<T extends Record<string, unknown>>(token: string): Promise<T> {
    const { payload } = await jwtVerify(token, secret);
    return payload as T;
}

function extractToken(request: Request, name: string): string | null {
    const cookie = request.headers.get("Cookie");
    if (!cookie) return null;

    const token = cookie.split(";").find((c) => c.trim().startsWith(`${name}=`));
    if (!token) return null;

    const parts = token.split("=");
    if (parts.length < 2) return null;

    const value = parts.slice(1).join("=").trim();
    if (!value) return null;

    return value;
}

interface JWTDiscordPayload extends Record<string, unknown> {
    id: string;
    username: string;
    avatar: string | null;
}

export const discordCookie = {
    set: (id: string, username: string, avatar: string | null) => sign({ id, username, avatar } satisfies JWTDiscordPayload),
    get: async (request: Request) => {
        const value = extractToken(request, "discord");
        if (!value) return null;

        try {
            return await verify<JWTDiscordPayload>(value);
        } catch (error) {
            console.error("JWT Verify Error:", error);
            return null;
        }
    }
};

interface JWTGithubPayload extends Record<string, unknown> {
    id: number;
    login: string;
}

export const githubCookie = {
    set: (id: number, login: string) => sign({ id, login } satisfies JWTGithubPayload),
    get: async (request: Request) => {
        const value = extractToken(request, "github");
        if (!value) return null;

        try {
            return await verify<JWTGithubPayload>(value);
        } catch (error) {
            console.error("JWT Verify Error:", error);
            return null;
        }
    }
};