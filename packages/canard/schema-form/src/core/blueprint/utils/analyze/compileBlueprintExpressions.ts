import { isArray } from '@winglet/common-utils/filter';

import type { BlueprintExpression } from '../../type';
import { BlueprintErrorCode } from '../diagnostics/constant';
import { throwBlueprintError } from '../diagnostics/throwBlueprintError';
import { createDynamicFunction } from '../expressions/createDynamicFunction';
import { getPathManager } from '../expressions/getPathManager';
import { registerBlueprintDependency } from './compileBlueprintExpressions/utils/registerBlueprintDependency';
import { readSchemaObject } from './readSchemaObject';
import type { AnalysisContext } from './type';

/** The closed control vocabulary is shared across every declaration compilation. */
const EXPRESSION_KEYS = ['active', 'visible', 'readOnly', 'disabled',
  'unsetOnInactive', 'derived', 'unsetValue', 'resetInteraction'] as const;

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
  for (let nodeIndex = 0; nodeIndex < context.nodes.length; nodeIndex++) {
    const declarations = context.nodes[nodeIndex].declarations;
    for (let declarationIndex = 0; declarationIndex < declarations.length; declarationIndex++) {
      const declaration = declarations[declarationIndex];
      if (visited.has(declaration.id) || declaration.validationOnly) continue;
      visited.add(declaration.id);
      const controls = readSchemaObject(declaration.schema).controls;
      if (!controls) continue;
      const children = controls.children;
      for (let groupIndex = -1; groupIndex < (children?.length ?? 0); groupIndex++) {
        const groupControls = groupIndex < 0 ? controls : children[groupIndex].controls;
        if (!groupControls) continue;
        const groupPath = groupIndex < 0 ? `${declaration.schemaPath}/controls`
          : `${declaration.schemaPath}/controls/children/${groupIndex}/controls`;
        const watch = groupControls.watch;
        if (watch !== undefined) {
          const paths = isArray(watch) ? watch : [watch];
          for (let path = 0; path < paths.length; path++)
            registerBlueprintDependency(
              context,
              paths[path],
              declaration,
              `${groupPath}/watch`,
            );
        }
        for (let keyIndex = 0; keyIndex < EXPRESSION_KEYS.length; keyIndex++) {
          const key = EXPRESSION_KEYS[keyIndex];
          const source = groupControls[key];
          if (typeof source !== 'string') continue;
          const schemaPath = `${groupPath}/${key}`;
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
          for (let path = 0; path < dependencies.length; path++)
            registerBlueprintDependency(context, dependencies[path], declaration, schemaPath);
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
  }
  if (context.dependencies)
    for (const ids of Object.values(context.dependencies)) Object.freeze(ids);
  return Object.freeze(expressions);
};
