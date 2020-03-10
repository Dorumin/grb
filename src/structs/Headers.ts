export default class Headers extends Map {
    constructor(rawHeaders: Record<string, string | string[]>) {
        super();

        if (rawHeaders !== undefined) {
            this.preloadHeaders(rawHeaders);
        }
    }

    private preloadHeaders(rawHeaders: Record<string, string | string[]>) {
        for (const key in rawHeaders) {
            let value = rawHeaders[key];

            this.set(key, value);
        }
    }

    set(key: string, value: string | string[]): this {
        if (typeof value === 'string') {
            value = [value];
        }

        super.set(key.toLowerCase(), value);

        return this;
    }

    get(key: string): string {
        const value = super.get(key.toLowerCase());
        if (value === null) {
            return value;
        }

        return value[0];
    }

    getAll(key: string): string[] {
        return super.get(key.toLowerCase());
    }
}