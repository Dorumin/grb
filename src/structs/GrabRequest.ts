import FormData from 'form-data';
import { Stream } from 'stream';
import { GrabRequestOptions } from '../types';
import extend from '../util/extend';
import GrabResponse from './GrabResponse';
import { CookieJar } from 'tough-cookie';

export default class GrabRequest {
    static get beforeSend() {
        return [
            this.normalizeBody,
            this.setContentLength,
            this.setCookies
        ];
    }

    static async normalizeBody(self: GrabRequest) {
        const form = self.options.form;
        const body = self.options.body;
        let updated: string | Buffer | Stream;

        if (form) {
            const formData = GrabRequest.makeForm(form);
            updated = formData;
            extend(self.options.headers, formData.getHeaders());
        }
        else if (typeof body === 'string') updated = body;
        else if (body instanceof Buffer) updated = body.toString();
        else if (body instanceof Stream) updated = body;
        else if (body && Object.getPrototypeOf(body) === Object.prototype) {
            updated = JSON.stringify(body);
            extend(self.options.headers, {
                'content-type': 'application/json'
            });
        }

        self.options.body = updated;
    }

    static async setContentLength(self: GrabRequest) {
        if (self.options.body === undefined) return;
        if (self.options.headers['content-length'] !== undefined) return;

        self.options.headers['content-length'] = await this.getByteLength(self.options.body);
    }

    static getByteLength(object: any): Promise<string> {
        return new Promise((resolve, reject) => {
            if (object.getLength) {
                object.getLength((err: Error, len: number) => {
                    if (err) {
                        reject(err);
                        return;
                    }

                    resolve(len.toString());
                });
            } else {
                resolve(Buffer.byteLength(String(object)).toString());
            }
        });
    }

    static async setCookies(self: GrabRequest) {
        if (self.options.jar === undefined) return;
        if (self.options.headers.cookie !== undefined) return;

        self.options.headers.cookie = await this.getCookies(self.options.jar, self.options.url);
    }

    static getCookies(jar: CookieJar, url: string): Promise<string> {
        return new Promise((resolve, reject) => {
            jar.getCookieString(url, (err, cookies) => {
                if (err) {
                    reject(err);
                    return;
                }

                resolve(cookies);
            })
        });
    }

    static makeForm(entries: Record<string, any>): FormData {
        const form = new FormData();

        for (const key in entries) {
            const value = entries[key];

            if (value instanceof Array) {
                for (const val of value) {
                    form.append(key, val);
                }
            } else {
                form.append(key, entries[key]);
            }
        }

        return form;
    }

    private options: GrabRequestOptions;

    constructor(options: GrabRequestOptions) {
        this.options = options;
    }

    async send(): Promise<GrabResponse> {
        for (const modifier of GrabRequest.beforeSend) {
            await modifier.call(GrabRequest, this);
        }

        const response = new GrabResponse(this.options);
        await response.wait();

        return response;
    }
}