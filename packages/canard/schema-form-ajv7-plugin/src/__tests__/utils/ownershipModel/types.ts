import type { JSONSchema, ValidatorFactory } from '@canard/schema-form';

/** Native surface used by the independent application oracle. */
export interface ModelApplication {
  addSchema(schema: object | boolean, key?: string): unknown;
  compile(schema: object | boolean): (data: unknown) => unknown;
  validate(schema: object | boolean | string, data: unknown): unknown;
  getSchema(key: string): ((data: unknown) => unknown) | undefined;
  removeSchema(key?: string | RegExp): unknown;
  errors?: unknown;
}
/** Version-specific construction is separate from the reference algorithm. */
export interface ModelProfile<T extends ModelApplication> {
  version: number;
  /** Observe generated operation classes without changing the oracle or assertions. */
  onOperation?: (operation: number) => void;
  /** Observe a successful same-root recompilation after a keyword-only replacement. */
  onKeywordReplacement?: () => void;
  direct: boolean;
  observe: (root: object) => WeakRef<object>;
  create: () => T;
  createFresh: (source: T) => T;
  addMeta: (instance: T, schema: object, key: string) => void;
  installRule: (instance: T, mode: number) => void;
  adapter: (instance: T) => ValidatorFactory;
  factory?: (instance: T) => ValidatorFactory['compile'];
}
/** Caller-owned roots and their expected immutable compiled result. */
export interface ModelRoot {
  schema: JSONSchema;
  verdict: unknown;
  data: unknown;
  validate: ReturnType<ValidatorFactory['compile']>;
}
