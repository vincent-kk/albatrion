import type { BlueprintExpression, PropertyDeclaration } from '../../type';
import { BlueprintErrorCode } from '../diagnostics/constant';
import { throwBlueprintError } from '../diagnostics/throwBlueprintError';
import { createDynamicFunction } from '../expressions/createDynamicFunction';
import { getPathManager } from '../expressions/getPathManager';
import { readSchemaObject } from './readSchemaObject';
import type { AnalysisContext } from './type';

/**
 * Compile authored control expressions while preserving relative dependency paths.
 * @param context - Completed graph and invocation-owned dependency index
 * @returns Frozen compiled descriptors; no user expression is executed
 */
export const compileBlueprintExpressions = (
  context: AnalysisContext,
): readonly BlueprintExpression[] => {
  const expressions: BlueprintExpression[] = [];
  const visited = new Set<number>();
  const register = (
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
    const ids =
      context.dependencies[path as string] ??
      (context.dependencies[path as string] = []);
    if (!ids.includes(declaration.id)) ids.push(declaration.id);
  };
  for (const node of context.nodes)
    for (const declaration of node.declarations) {
      if (visited.has(declaration.id) || declaration.validationOnly) continue;
      visited.add(declaration.id);
      const controls = readSchemaObject(declaration.schema).controls;
      if (!controls) continue;
      const groups = [
        { controls, schemaPath: `${declaration.schemaPath}/controls` },
        ...(controls.children ?? []).map(
          (entry: { controls: Record<string, unknown> }, index: number) => ({
            controls: entry.controls,
            schemaPath: `${declaration.schemaPath}/controls/children/${index}/controls`,
          }),
        ),
      ];
      for (const group of groups) {
        if (!group.controls) continue;
        const watch = group.controls.watch;
        if (watch !== undefined) {
          const paths = Array.isArray(watch) ? watch : [watch];
          for (const path of paths)
            register(path, declaration, `${group.schemaPath}/watch`);
        }
        for (const key of [
          'active',
          'visible',
          'readOnly',
          'disabled',
          'unsetOnInactive',
          'derived',
          'unsetValue',
          'resetInteraction',
        ]) {
          const source = group.controls[key];
          if (typeof source !== 'string') continue;
          const schemaPath = `${group.schemaPath}/${key}`;
          const manager = getPathManager();
          let evaluate;
          try {
            evaluate =
              key === 'derived'
                ? createDynamicFunction(manager, key, source)
                : createDynamicFunction(manager, key, source, true);
          } catch (cause) {
            throwBlueprintError(
              BlueprintErrorCode.CreateDynamicFunction,
              schemaPath,
              { cause, expression: source },
              context.options,
            );
          }
          if (!evaluate) continue;
          const dependencies = Object.freeze([...manager.get()]);
          for (const path of dependencies)
            register(path, declaration, schemaPath);
          expressions.push(
            Object.freeze({
              declarationId: declaration.id,
              schemaPath,
              hostPath: declaration.path,
              key,
              dependencies,
              evaluate,
            }),
          );
        }
      }
    }
  for (const ids of Object.values(context.dependencies)) Object.freeze(ids);
  return Object.freeze(expressions);
};
