import http from 'http';
import https from 'https';
import qs from 'querystring';
import Headers from './Headers';
import def from '../util/def';
import consumeStream from '../util/consumeStream';
import { GrabRequestOptions } from '../types';
import { Stream } from 'stream';
import { CookieJar } from 'tough-cookie';

type PromiseFn = (value: unknown) => void;

export default class GrabResponse {
    static get afterResponse() {
        return [
            this.parseCookies
        ];
    }

    static async parseCookies(self: GrabResponse) {
        if (self.options.jar === undefined) return;
        const cookieHeader = self.headers['set-cookie'];
        if (cookieHeader === undefined) return;

        const cookies = Array.isArray(cookieHeader) ? cookieHeader : [cookieHeader];

        await Promise.all(
            cookies.map(cookie => this.setCookie(self.options.jar, cookie, self.url))
        );
    }

    static setCookie(jar: CookieJar, cookieStr: string, url: string): Promise<void> {
        return new Promise((resolve, reject) => {
            jar.setCookie(cookieStr, url, (err, cookie) => {
                if (err) {
                    reject(err);
                    return;
                }

                resolve();
            });
        });
    }

    private redirectCount: number;
    private options: GrabRequestOptions;
    private bodyType: string;
	private buffer: Buffer;
    url: string;
    rawHeaders: Record<string, string | string[]>;
    headers: Headers;
    statusCode: number;
    body: string | Buffer | Record<string, any>;

    constructor(options: GrabRequestOptions) {
        def(this, 'options', options);
        this.url = options.url;

        def(this, 'redirectCount', 0);
        def(this, 'bodyType', 'utf8');
        if (options.buffer) this.bodyType = 'buffer';
        if (options.json) this.bodyType = 'json';
    }

    private buildRequest() {
        const url = new URL(this.url);

        if (this.options.query) {
            // Collect first with Array.from because modifying under iteration breaks shit
            for (const key of Array.from(url.searchParams.keys())) {
                url.searchParams.delete(key);
            }

            url.pathname += '?' + qs.stringify(this.options.query);
        }

        const fetch = url.protocol === 'https:' ? https.request : http.request;

        const request = fetch(url, {
            method: this.options.method,
            headers: this.options.headers,
            timeout: this.options.timeout
        });

        let end = true;

        if (this.options.body !== undefined) {
            if (this.options.body instanceof Stream) {
                this.options.body.pipe(request);
                end = false;
            } else {
                request.write(this.options.body);
            }
        }

        if (end) {
            request.end();
        }

        return request;
    }

    private makeRequest(res?: PromiseFn, rej?: PromiseFn) {
        return new Promise((resolve, reject) => {
            resolve = res || resolve;
            reject = rej || reject;

            const request = this.buildRequest();

            request.on('response', async res => {
                if (this.options.redirects && res.statusCode >= 300 && res.statusCode < 400) {
                    this.redirectCount++;
                    if (this.redirectCount > this.options.maxRedirects) {
                        reject(new Error('Too many redirects'));
                        return;
                    }

                    this.url = res.headers.location;
                    this.makeRequest(resolve, reject);
                    return;
                }

                def(this, 'rawHeaders', res.headers);
                this.headers = new Headers(res.headers);
                this.statusCode = res.statusCode;

                for (const modifier of GrabResponse.afterResponse) {
                    await modifier.call(GrabResponse, this);
                }

                this.buffer = await consumeStream(res);

                switch (this.bodyType) {
                    case 'buffer':
                        this.body = this.buffer;
                        break;
                    case 'json':
                        try {
                            this.body = JSON.parse(this.buffer.toString());
                        } catch(e) {
                            reject(new Error('Invalid JSON'));
                        }
                        break;
                    case 'utf8':
                        this.body = this.buffer.toString();
                        break;
                }

                resolve();
            });

            request.on('error', err => reject(err));
        });
    }

    json() {
        return JSON.parse(this.buffer.toString());
    }

    wait() {
        return this.makeRequest();
    }
}