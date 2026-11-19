import 'ajv';

import type { Dictionary } from '@aileron/declare';

/**
 * Types the read-only application registries and plugin-owned compilers of Ajv 6.12.
 */
declare module 'ajv' {
  interface Options {
    /** Native default meta-schema address selected when schemas omit $schema. */
    defaultMeta?: string;
    /** AJV's derived property-path flag, reset when a private profile overrides errorDataPath. */
    _errorDataPathProperty?: boolean;
  }
  interface CompilationContext {
    /** Generated expression for the current instance path. */
    errorPath: string;
    /** Authored schema pointer of the current compilation position. */
    errSchemaPath: string;
  }
  interface Ajv {
    /**
     * Register object or boolean schemas accepted by the Ajv 6 runtime.
     * @param schema - JSON Schema or schema collection to register.
     * @param key - Optional application address for the schema.
     * @returns This instance for chaining.
     */
    addMetaSchema(schema: object, key?: string, skipValidation?: boolean): Ajv;
    addSchema(
      schema: object | boolean,
      key?: string,
      skipValidation?: boolean,
    ): Ajv;
    /**
     * Validate a schema with AJV6's supported throw-or-log mode.
     * @param schema - Object or boolean schema accepted by the native runtime.
     * @param throwOrLogError - Report an invalid schema using the configured validation policy.
     * @returns The native schema-validity result.
     */
    validateSchema(
      schema: object | boolean,
      throwOrLogError?: boolean,
    ): boolean;
    readonly constructor: new (options?: Options) => Ajv;
    /** Native compilation profile selected while compiling a meta-schema. */
    _metaOpts: Options;
    readonly _formats: Readonly<Dictionary<Parameters<Ajv['addFormat']>[1]>>;
    readonly RULES: readonly {
      readonly type?: string;
      readonly rules: readonly object[];
    }[] & {
      readonly custom: Readonly<
        Dictionary<{ readonly definition: KeywordDefinition }>
      >;
      readonly keywords: Readonly<Dictionary<boolean>>;
      readonly all: Readonly<Dictionary<unknown>>;
      readonly types: Readonly<Dictionary<unknown>>;
    };
    /** Private cache operations used without reserializing a resolved registered schema. */
    readonly _cache: {
      get(key: unknown): unknown;
      put(key: unknown, value: unknown): void;
      del(key: unknown): void;
    };
    readonly _schemas: Dictionary<
      | {
          readonly schema: object | boolean;
          /** Normalized resource id and local references already resolved by native registration. */
          readonly id?: string;
          readonly localRefs?: Readonly<Dictionary<object | boolean>>;
          /** Native serialization key retained by the registration. */
          readonly cacheKey?: unknown;
          /** Native flag separating meta-schema programs from application data schemas. */
          readonly meta?: boolean;
        }
      | undefined
    >;
    /** Current native URI entries, read without compiling or changing the application instance. */
    readonly _refs: Dictionary<unknown>;
  }
}
