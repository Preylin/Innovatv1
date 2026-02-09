declare module 'written-number' {
  interface Options {
    lang?: string;
  }
  function writtenNumber(n: number, options?: Options): string;
  export = writtenNumber;
}