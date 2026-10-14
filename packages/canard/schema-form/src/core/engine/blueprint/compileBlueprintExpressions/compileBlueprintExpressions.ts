import { isArray } from '@winglet/common-utils/filter';

import { FormErrorCode } from '../../../../errors';
import type { AnalysisContext } from '../types/analysis';
import type { BlueprintExpression } from '../types/blueprint';
import { readSchemaObject } from '../utils/analyze/readSchemaObject';
import { throwBlueprintError } from '../utils/diagnostics/throwBlueprintError';
import { CompleteExpressionReads } from '../utils/expressions/CompleteExpressionReads';
import { EXPRESSION_CONTROL_KEYS } from '../utils/expressions/expressionControlKeys';
import { createDynamicFunction } from './createDynamicFunction';
import { getPathManager } from './getPathManager';
import { hasCompleteExpressionReads } from './utils/hasCompleteExpressionReads';
import { registerBlueprintDependency } from './utils/registerBlueprintDependency';

/**
 * Compile authored control expressions while preserving relative dependency paths.
 * @param context - Completed graph and invocation-owned dependency index
 * @returns Owned compiled descriptors, frozen in development; no expression is executed
 */
export const compileBlueprintExpressions = (
  context: AnalysisContext,
): readonly BlueprintExpression[] => {
  const expressions: BlueprintExpression[] = [];
  const visited = new Set<number>();
  for (let nodeIndex = 0; nodeIndex < context.nodes.length; nodeIndex++) {
    const declarations = context.nodes[nodeIndex].declarations;
    for (
      let declarationIndex = 0;
      declarationIndex < declarations.length;
      declarationIndex++
    ) {
      const declaration = declarations[declarationIndex];
      if (visited.has(declaration.id) || declaration.validationOnly) continue;
      visited.add(declaration.id);
      const controls = readSchemaObject(declaration.schema).controls;
      if (!controls) continue;
      const fields = controls.fields;
      for (
        let groupIndex = -1;
        groupIndex < (fields?.length ?? 0);
        groupIndex++
      ) {
        const groupControls =
          groupIndex < 0 ? controls : fields[groupIndex].controls;
        if (!groupControls) continue;
        const groupPath =
          groupIndex < 0
            ? declaration.schemaPath + '/controls'
            : declaration.schemaPath +
              '/controls/fields/' +
              groupIndex +
              '/controls';
        const watch = groupControls.watch;
        if (watch !== undefined) {
          const paths = isArray(watch) ? watch : [watch];
          for (let path = 0; path < paths.length; path++)
            registerBlueprintDependency(
              context,
              paths[path],
              declaration,
              groupPath + '/watch',
            );
        }
        for (
          let keyIndex = 0;
          keyIndex < EXPRESSION_CONTROL_KEYS.length;
          keyIndex++
        ) {
          const key = EXPRESSION_CONTROL_KEYS[keyIndex];
          const source = groupControls[key];
          if (typeof source !== 'string') continue;
          const schemaPath = groupPath + '/' + key;
          const manager = getPathManager();
          let evaluate;
          try {
            evaluate =
              key === 'derived'
                ? createDynamicFunction(manager, key, source)
                : createDynamicFunction(manager, key, source, true);
          } catch (cause) {
            throwBlueprintError(
              FormErrorCode.CreateDynamicFunction,
              schemaPath,
              { cause, expression: source },
              context.options,
            );
          }
          if (!evaluate) continue;
          const dependencies = [...manager.get()];
          for (let path = 0; path < dependencies.length; path++)
            registerBlueprintDependency(
              context,
              dependencies[path],
              declaration,
              schemaPath,
            );
          const compiled = {
            declarationId: declaration.id,
            schemaPath,
            hostPath: declaration.path,
            key,
            dependencies,
            evaluate,
          };
          if (process.env.NODE_ENV !== 'production') {
            Object.freeze(dependencies);
            Object.freeze(compiled);
          }
          if (
            context.capabilities.hasDerive &&
            hasCompleteExpressionReads(source)
          )
            CompleteExpressionReads.add(compiled);
          expressions.push(compiled);
        }
      }
    }
  }
  if (process.env.NODE_ENV !== 'production' && context.dependencies)
    for (const ids of Object.values(context.dependencies)) Object.freeze(ids);
  return process.env.NODE_ENV !== 'production'
    ? Object.freeze(expressions)
    : expressions;
};
