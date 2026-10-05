import { isArray } from '@winglet/common-utils/filter';

import type { BlueprintSchema } from '../../type';
import { readSchemaObject } from './readSchemaObject';
import type { AnalysisContext } from './type';

/** Supported string controls, matching the expression compiler's closed vocabulary. */
const EXPRESSION_KEYS = ['active', 'visible', 'readOnly', 'disabled',
  'unsetOnInactive', 'derived', 'unsetValue', 'resetInteraction'] as const;

/**
 * Fuse independent capability evidence into the existing declaration traversal.
 * @param context - Invocation-owned monotonic evidence, published only after analysis
 * @param schema - Validated authored position reached by declaration collection
 * @returns Nothing; records feature presence without evaluating values or following new paths
 */
export const collectSchemaCapabilities = (
  context: AnalysisContext,
  schema: BlueprintSchema,
): void => {
  const record = readSchemaObject(schema);
  const capabilities = context.capabilities;
  if (record.oneOf !== undefined || record.anyOf !== undefined ||
    record.if !== undefined || record.then !== undefined || record.else !== undefined)
    capabilities.branchless = false;
  if (record.readOnly !== undefined) capabilities.hasState = true;
  const controls = record.controls;
  if (!controls) return;
  if (controls.discriminator !== undefined) capabilities.branchless = false;
  const children = controls.children;
  for (let index = -1; index < (isArray(children) ? children.length : 0); index++) {
    const group = index < 0 ? controls : children[index].controls;
    if (!group) continue;
    if (group.active !== undefined) capabilities.branchless = false;
    if (group.watch !== undefined) capabilities.hasWatch = true;
    if (group.visible !== undefined || group.readOnly !== undefined || group.disabled !== undefined)
      capabilities.hasState = true;
    if (group.derived !== undefined || group.unsetValue !== undefined ||
      group.resetInteraction !== undefined || group.injectTo !== undefined)
      capabilities.hasDerive = true;
    if (!capabilities.hasExpressions)
      for (let key = 0; key < EXPRESSION_KEYS.length; key++)
        if (typeof group[EXPRESSION_KEYS[key]] === 'string') {
          capabilities.hasExpressions = true;
          break;
        }
  }
};
