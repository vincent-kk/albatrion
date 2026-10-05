import type { PropertyDeclaration } from '../../../../type';
import { BlueprintErrorCode } from '../../../diagnostics/constant';
import { throwBlueprintError } from '../../../diagnostics/throwBlueprintError';
import type { AnalysisContext } from '../../type';

/**
 * Validate a dependency path and register its declaration in the owned index.
 * @param context - Invocation-owned dependency index and diagnostic options
 * @param path - Authored watch or compiled expression dependency
 * @param declaration - Declaration consuming this dependency
 * @param schemaPath - Authored control location used for errors
 * @returns Nothing; adds the declaration once to the dependency index
 */
export const registerBlueprintDependency = (
  context: AnalysisContext,
  path: unknown,
  declaration: PropertyDeclaration,
  schemaPath: string,
): void => {
  if (typeof path !== 'string' || path.split('/').includes('*'))
    throwBlueprintError(
      BlueprintErrorCode.ObservedValues,
      schemaPath,
      {
        path,
        guidance:
          'Dependencies must be strings without wildcard path segments.',
      },
      context.options,
    );
  const dependencies = context.dependencies ??= Object.create(null);
  context.capabilities.hasDependencies = true;
  const ids = dependencies[path as string] ?? (dependencies[path as string] = []);
  if (!ids.includes(declaration.id)) ids.push(declaration.id);
};
