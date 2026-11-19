import type { Ajv } from 'ajv';

/**
 * Resolve a missing external schema from the application without replacing an isolated compiler.
 * @param compiler - Instance whose caches remain local to the form or compiler pool.
 * @param source - Application instance that may receive schemas after the compiler is created.
 * @param compile - Synchronous compilation retried after each newly resolved schema.
 * @returns The compiled result, preserving its original return type.
 * @throws The compilation error when its schema is absent or recovery cannot advance.
 */
export const compileWithSchemaFallback = <T>(
  compiler: Ajv,
  source: Ajv,
  compile: () => T,
): T => {
  let recovered: string[] | undefined;
  for (;;) {
    try {
      return compile();
    } catch (error) {
      if (compiler === source || !error || typeof error !== 'object' ||
          !('missingSchema' in error) || typeof error.missingSchema !== 'string' ||
          recovered?.includes(error.missingSchema)) throw error;
      const external = source.getSchema(error.missingSchema);
      if (!external || external.schema === undefined) throw error;
      (recovered ??= []).push(error.missingSchema);
      compiler.addSchema(external.schema, error.missingSchema);
    }
  }
};
