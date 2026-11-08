import type * as AjvModule from 'ajv';

/** Mirror AJV7's default-constructor interop in both NodeNext and Bundler types. */
type ConstructorInstance<T> = T extends abstract new (
  ...args: never[]
) => infer Instance
  ? Instance
  : T extends { default: infer Default }
    ? ConstructorInstance<Default>
    : never;

/** The class behind AJV7's CommonJS namespace, without widening its methods. */
export type AjvInstance = ConstructorInstance<typeof AjvModule>;
