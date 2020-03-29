import { CookieJar } from 'tough-cookie';
import GrabResponse from './structs/GrabResponse';

export type GrabHttpMethods = 'GET' |  'HEAD' | 'POST' | 'PUT' | 'DELETE' | 'CONNECT' | 'OPTIONS' | 'TRACE' | 'PATCH' ;

export type GrabRequestBody = string | Buffer | Record<string, any>;

export interface GrabRequestOptions {
    method?: GrabHttpMethods;
    url?: string;
    query?: Record<string, any>;
    body?: GrabRequestBody;
    form?: Record<string, any>;
    json?: boolean;
    buffer?: boolean;
    headers?: Record<string, any>;
    decompress?: boolean;
    timeout?: number;
    jar?: CookieJar;
    redirects?: boolean;
    maxRedirects?: number;
}

export type GrabFunction = (url: string, options: GrabRequestOptions) => Promise<GrabResponse>;

export interface Grab {
    (url: string, options: GrabRequestOptions): Promise<GrabResponse>;
    get: GrabFunction;
    head: GrabFunction;
    post: GrabFunction;
    patch: GrabFunction;
    delete: GrabFunction;
    put: GrabFunction;
    defaults: (options: GrabRequestOptions) => Grab;
    jar?: CookieJar;
};