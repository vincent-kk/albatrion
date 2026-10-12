import 'ajv';

/**
 * Types only the Ajv 6.12 internals this plugin reads. R2 requires siblings to
 * see schemas consumers added to a bound instance before compilation.
 */
declare module 'ajv' {
  interface Ajv {
    readonly constructor: new (options?: Options) => Ajv;
    readonly _formats: Readonly<Record<string, Parameters<Ajv['addFormat']>[1]>>;
    readonly RULES: {
      readonly custom: Readonly<Record<string, { readonly definition: KeywordDefinition }>>;
      readonly keywords: Readonly<Record<string, boolean>>;
    };
    readonly _schemas: Readonly<Record<string, { readonly schema: object } | undefined>>;
  }
}
