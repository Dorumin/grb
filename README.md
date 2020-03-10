# gr(a)b

Yet another HTTP library, and an attempt to bring the simplicity of `got` 9.x back.

Once great, I believe `got` turned unwieldy for the simple usecases it was meant to make easier than ever.

```console
$ npm install grb
```

# Learn by example
```ts
const grab = require('grb');
// import grab from 'grb'; works too

// Basic GET
const response = await grab('https://google.com');
console.log('Headers', response.headers);
console.log('HTML', response.body);

// Query parameters and explicit method
// If you use the `query` field, query params in the url will be ignored
const response = await grab('https://www.google.com/search', {
    method: 'GET',
    query: {
        q: 'example'
    }
});

// Parse JSON and extract body
const { body } = await grab('https://jsonplaceholder.typicode.com/todos/1', {
    json: true
});
console.log('JSON', body);

// Basic POST
await grab.post('https://example.com', {
    body: 'any payload! But there are better ways for forms and json payloads'
});

// If body is an object, it will be parsed as JSON and the Content-Type header will be set to application/json
await grab.post('https://example.com', {
    body: {
        hello: 'there',
        'obi-wan': 'kenobi'
    }
});

// Form payloads can also be used, just use the form field for the payload
const { body: message } = await grab.post('https://discordapp.com/api/v6/channels/505815497598828570/messages', {
    form: {
        content: 'forms are versatile',
        file: fs.createReadStream('kitten.png')
    },
    headers: {
        authorization: 'Discord token'
    },
    json: true
});

console.log(message);

// You could also just pass a FormData instance to body!

// Cookies
// You could extract this to a file, like http.js, and require it directly from other files
// They will all share a single CookieJar
// This pattern is common when creating adapter classes, but with .defaults, a complete class is often overkill
const { CookieJar } = require('tough-cookie');
const instance = grab.defaults({
    jar: new CookieJar()
});

await instance('https://google.com');
console.log('Cookies', instance.jar.toJSON());
```

Voila! Now you should be armed to use this library to your heart's content. Everything else you should be able to figure out through IntelliSense; it's all TypeScript. Go on and make something awesome.

# FAQ
## Why yet another HTTP library?
0. Personal challenge. I wanted to make one, and so I did
1. Have a simple library that makes the most common interactions easy. This rules out fluid interfaces; nobody wants to remember to `.send()` requests manually
2. While not a primary objective, keep the bundle size small and competitive.
[![install size](https://packagephobia.now.sh/badge?p=grb)](https://packagephobia.now.sh/result?p=grb) (about one third of `got`, but 10 times bigger than `phin` or `centra` because they don't include `form-data` integration)
3. Have a simple and easy to remember API, that won't change over time. No need to re-learn everything, and the less keystrokes, the better. This means that nearly everything is done with a single function call. This also means that it doesn't ship with stream support or a callback interface; it's all done with promises.
4. Don't make awkward API decisions, like `fetch`, with their chained `Response.json()` method looking weird with async/await, or `got`'s `.json()` method that can be called on a `Promise` object directly. Sure, you can get *used* to them, but you shouldn't *have* to.
5. I found the `grb` name was available by chance, and it honestly sounded great for a `got` successor and an http library. You want something off the internet? Just `grb` it.

## Callbacks?
No.

## Streams?
Someday. Perhaps around the same time I add progress indicators. Are those often used? Do people really download and upload big files through node often, and show some indicator to the user? I don't know

## Caching?
Not yet, most Node programs often just want the freshest data there is, but perhaps if we were available for client-side code.

## Cancelation?
Yikes, I should add that eventually, `response.abort()` is fairly easy to implement, although impaling the returned `Promise` object with a `cancel` method sounds icky to me... We'll see.