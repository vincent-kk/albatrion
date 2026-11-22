import 'ajv';

import type { Dictionary } from '@aileron/declare';

/**
 * Types only the Ajv 6.12 internals this plugin reads. R2 requires siblings to
 * see schemas consumers added to a bound instance before compilation; a failed
 * validation registration restores `_refs` and `_schemas` in place.
 */
/** Native resource record created by AJV 6 for a schema or compiled reference. */
interface NativeSchema {
  readonly schema: object;
  readonly meta?: boolean;
  readonly id?: string;
}

declare module 'ajv' {
  interface Ajv {
    readonly constructor: new (options?: Options) => Ajv;
    readonly _formats: Readonly<Dictionary<Parameters<Ajv['addFormat']>[1]>>;
    readonly RULES: readonly { readonly rules: readonly unknown[] }[] & {
      readonly types: Readonly<Dictionary<unknown>>;
      readonly custom: Readonly<Dictionary<{ readonly definition: KeywordDefinition }>>;
      readonly all: Readonly<Dictionary<unknown>>;
      readonly keywords: Readonly<Dictionary<boolean>>;
    };
    readonly _schemas: Dictionary<NativeSchema | undefined>;
    readonly _cache: object;
    readonly _fragments: Dictionary<NativeSchema | undefined>;
    readonly _compilations: object;
    /** Resolved references by URI: compiled schema objects or string aliases; restored in place after a failed validation registration. */
    readonly _refs: Dictionary<NativeSchema | string | undefined>;
  }
}
