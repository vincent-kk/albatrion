import 'ajv';

/** Ajv 6 accepts a definition-less keyword at runtime; its typings omit that overload. */
declare module 'ajv' {
  interface Ajv {
    addKeyword(keyword: string): Ajv;
  }
}
