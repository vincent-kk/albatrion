import { isArray } from '@winglet/common-utils/filter';
import { hasOwnProperty } from '@winglet/common-utils/lib';

import { CONTROL_KEY } from '../../../../constants/controlKey';
import type { AnalysisContext } from '../../../types/analysis';
import type { BlueprintSchema } from '../../../types/schema';
import { readSchemaObject } from '../../../utils/analyze/readSchemaObject';
import { EXPRESSION_CONTROL_KEYS } from '../../../utils/expressions/expressionControlKeys';
import { isLiteralDefault } from './isLiteralDefault';

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
  if (context.staticFirstLoad) {
    const fallback = Object.getOwnPropertyDescriptor(record, 'default');
    if (
      fallback &&
      (!('value' in fallback) ||
        (fallback.value !== undefined && !isLiteralDefault(fallback.value)))
    )
      context.staticFirstLoad = false;
  }
  if (
    record.oneOf !== undefined ||
    record.anyOf !== undefined ||
    record.if !== undefined ||
    record.then !== undefined ||
    record.else !== undefined
  )
    capabilities.branchless = false;
  if (record.readOnly !== undefined) capabilities.hasState = true;
  const controls = record.controls;
  if (!controls) return;
  if (controls.discriminator !== undefined) capabilities.branchless = false;
  const fields = controls.fields;
  for (let index = -1; index < (isArray(fields) ? fields.length : 0); index++) {
    const group = index < 0 ? controls : fields[index].controls;
    if (!group) continue;
    if (
      hasOwnProperty(group, CONTROL_KEY.default) ||
      group.unsetValue !== undefined ||
      group.injectTo !== undefined
    )
      context.staticFirstLoad = false;
    if (group.active !== undefined) capabilities.branchless = false;
    if (group.watch !== undefined) capabilities.hasWatch = true;
    if (
      group.visible !== undefined ||
      group.readOnly !== undefined ||
      group.disabled !== undefined
    )
      capabilities.hasState = true;
    if (
      group.derived !== undefined ||
      group.unsetValue !== undefined ||
      group.resetInteraction !== undefined ||
      group.injectTo !== undefined
    )
      capabilities.hasDerive = true;
    if (!capabilities.hasExpressions)
      for (let key = 0; key < EXPRESSION_CONTROL_KEYS.length; key++)
        if (typeof group[EXPRESSION_CONTROL_KEYS[key]] === 'string') {
          capabilities.hasExpressions = true;
          break;
        }
  }
};
