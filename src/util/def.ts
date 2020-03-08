export default (obj: any, prop: string, val: any) => {
    Object.defineProperty(obj, prop, {
        enumerable: false,
        configurable: true,
        writable: true,
        value: val
    });
};