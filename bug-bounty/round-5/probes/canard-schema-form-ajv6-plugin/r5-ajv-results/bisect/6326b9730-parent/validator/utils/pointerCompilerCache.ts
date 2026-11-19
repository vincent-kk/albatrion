import type Ajv from 'ajv';

/** Independent compiler profiles; self-mappings identify instances owned entirely by the plugin. */
export const pointerCompilers = new WeakMap<Ajv.Ajv, Ajv.Ajv>();

/** Actual schemas retained by private compilers for registered roots, released with their source registrations. */
export const pointerCompilations = new WeakMap<
  object,
  {
    /** Compiler whose schema cache is independent of the application's cache. */
    compiler: Ajv.Ajv;
    /** Actual schema, including an asynchronous wrapper when compilation requires it. */
    schema: object | boolean;
  }
>();
