export default (a: any, b: any) => {
    for (const key in b) {
        a[key] = a[key] ?? b[key];
    }
};