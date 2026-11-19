import { pointerCompilations } from '../pointerCompilerCache';
import type { SchemaRootRegistration } from '../registerSchemaRoot';
import { releaseSeededPointerCompilation } from '../releaseSeededPointerCompilation';

/**
 * Release private path-profile resources with the corresponding source registration.
 * @param registration - Source ownership whose snapshot addressed the private compile.
 * @returns Nothing; removes only matching private references and the compiled snapshot.
 */
export const disposePointerCompilation = (
  registration: SchemaRootRegistration,
): void => {
  const copy = registration.validationCopy;
  if (!copy) return;
  if (releaseSeededPointerCompilation(copy)) return;
  const compiled = pointerCompilations.get(copy);
  if (!compiled) return;
  if (typeof compiled.schema === 'object')
    compiled.compiler.removeSchema(compiled.schema);
  for (const [key, original] of registration.validationOwnership?.refs ?? []) {
    const current = compiled.compiler._refs[key];
    if (
      current === original ||
      (current &&
        typeof current === 'object' &&
        'schema' in current &&
        (current.schema === compiled.schema ||
          (original &&
            typeof original === 'object' &&
            'schema' in original &&
            current.schema === original.schema)))
    )
      delete compiled.compiler._refs[key];
  }
  pointerCompilations.delete(copy);
};
