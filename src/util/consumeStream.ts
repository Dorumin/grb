import { Stream } from 'stream';

export default (stream: Stream): Promise<Buffer> => {
    return new Promise((resolve, reject) => {
        const chunks = [];

        stream.on('error', err => reject(err));
        stream.on('data', chunk => chunks.push(chunk));
        stream.on('end', () => resolve(Buffer.concat(chunks)));
    });
};