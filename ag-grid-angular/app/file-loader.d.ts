// Implementation is taken from https://github.com/zlepper/typescript-webworker
declare module 'file-loader?name=[name].js!*' {
    const value: string;
    export = value;
}

declare module '*.css';

declare module '*.gif' {
    const value: string;
    export default value;
}
