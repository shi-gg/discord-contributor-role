import { DefaultRestOptions, DefaultUserAgent, type RESTOptions } from "./constants";

export type RouteLike = `/${string}`;

export enum RequestMethod {
    Get = "GET",
    Post = "POST",
    Put = "PUT",
    Patch = "PATCH",
    Delete = "DELETE"
}

export interface RequestData {
    auth?: boolean;
    body?: unknown;
    headers?: Record<string, string>;
    passThroughBody?: boolean;
}

export class REST {
    public readonly options: RESTOptions;
    #token: string | null = null;

    constructor(options: Partial<RESTOptions> = {}) {
        this.options = { ...DefaultRestOptions, ...options };
    }

    public async get(route: RouteLike, options: RequestData = {}) {
        return this.request(RequestMethod.Get, route, options);
    }

    public async delete(route: RouteLike, options: RequestData = {}) {
        return this.request(RequestMethod.Delete, route, options);
    }

    public async post(route: RouteLike, options: RequestData = {}) {
        return this.request(RequestMethod.Post, route, options);
    }

    public async put(route: RouteLike, options: RequestData = {}) {
        return this.request(RequestMethod.Put, route, options);
    }

    public async patch(route: RouteLike, options: RequestData = {}) {
        return this.request(RequestMethod.Patch, route, options);
    }

    public async request(method: RequestMethod, route: RouteLike, options: RequestData = {}) {
        const url = `${this.options.api}/v${this.options.version}${route}`;

        const headers: Record<string, string> = {
            "User-Agent": DefaultUserAgent,
            ...options.headers
        };

        if (options.auth !== false && this.#token) {
            headers.Authorization = `${this.options.authPrefix} ${this.#token}`.trim();
        }

        let body: BodyInit | null = null;
        if (options.body) {
            if (options.passThroughBody) {
                body = options.body as BodyInit;
            } else {
                body = JSON.stringify(options.body);
                headers["Content-Type"] = "application/json";
            }
        }

        const res = await fetch(url, {
            method,
            headers,
            body
        });

        if (!res.ok) {
            const text = await res.text();
            throw new Error(`Request failed with status ${res.status}: ${text}`);
        }

        if (res.status === 204) return null;

        return await res.json();
    }

    public setToken(token: string) {
        this.#token = token;
        return this;
    }
}