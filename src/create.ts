import { GrabRequestOptions, GrabHttpMethods, Grab } from './types';
import extend from './util/extend';
import GrabRequest from './structs/GrabRequest';

const aliases: readonly string[] = [
    'get',
    'head',
    'post',
    'delete',
    'patch',
    'put'
];

const create = (defaults: GrabRequestOptions): Grab => {
    // @ts-ignore
    const grab: Grab = (url: string, options: GrabRequestOptions = {}) => {
        options.url = url;
        extend(options, defaults);

        return new GrabRequest(options).send();
    };

    for (const alias of aliases) {
        grab[alias] = (url: string, options: GrabRequestOptions = {}) => {
            options.method = alias.toUpperCase() as GrabHttpMethods;

            return grab(url, options);
        };
    }

    grab.defaults = (options: GrabRequestOptions): Grab => {
        extend(options, defaults);

        return create(options);
    };

    if (defaults.jar) {
        grab.jar = defaults.jar;
    }

    // @ts-ignore Missing props assigned in the aliases loop
    return grab;
};

export default create;