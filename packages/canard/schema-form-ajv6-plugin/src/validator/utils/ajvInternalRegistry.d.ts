import 'ajv';

import type { Dictionary } from '@aileron/declare';

/**
 * Types only the Ajv 6.12 internals this plugin reads. R2 requires siblings to
 * see schemas consumers added to a bound instance before compilation; a failed
 * validation registration restores `_refs` and `_schemas` in place.
 */
declare module 'ajv' {
  interface Options {
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
    addSchema(schema: object | boolean, key?: string): Ajv;
    readonly constructor: new (options?: Options) => Ajv;
    readonly _formats: Readonly<Dictionary<Parameters<Ajv['addFormat']>[1]>>;
    readonly RULES: {
      readonly custom: Readonly<
        Dictionary<{ readonly definition: KeywordDefinition }>
      >;
      readonly keywords: Readonly<Dictionary<boolean>>;
    };
    readonly _schemas: Dictionary<
      { readonly schema: object | boolean } | undefined
    >;
    /** Resolved references by URI: compiled schema objects or string aliases; restored in place after a failed validation registration. */
    readonly _refs: Dictionary<unknown>;
  }
}
