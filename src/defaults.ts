import { GrabRequestOptions } from './types';

export default {
    method: 'GET',
    headers: {},
    decompress: true,
    redirects: true,
    maxRedirects: 10,
    timeout: 30000
} as GrabRequestOptions;