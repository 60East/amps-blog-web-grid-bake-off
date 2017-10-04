// Implementation is taken from https://github.com/zlepper/typescript-webworker
declare module 'file-loader?name=[name].js!*' {
    const value: string;
    export = value;
}
