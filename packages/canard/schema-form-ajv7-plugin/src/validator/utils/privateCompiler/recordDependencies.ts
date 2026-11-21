import type { PrivateCompiler, SchemaDependencies } from './types';

/**
 * Retain only definitions whose generated code can be reused by this compiler.
 * @param compiler - Private environment whose future reuse needs these observations.
 * @param dependencies - Facts from detached form or imported application schemas.
 * @returns No value; records only extension names and definition identities.
 */
export const recordDependencies = (
  compiler: PrivateCompiler,
  dependencies: SchemaDependencies,
): void => {
  for (const [name, definition] of dependencies.rules)
    compiler.rules.set(name, definition);
  for (const [name, definition] of dependencies.formats)
    compiler.formats.set(name, definition);
};
