import { isArray } from '@winglet/common-utils/filter';

import type { Blueprint } from '../../../../blueprint';
import { getDirectChildSelectionPlan } from './getDirectChildSelectionPlan';
import { getGateSelectionTable } from './getGateSelectionTable';

/**
 * Memoize static selection metadata before a mount's load without evaluating gates.
 * @param blueprint - Immutable mount analysis with branches and compiled expressions
 * @returns Nothing; caches retain plans, tables and negative eligibility by host identity
 */
export const prepareGateSelection = (blueprint: Blueprint): void => {
  for (const host of blueprint.nodes) {
    const schema = host.declarations[0]?.schema;
    if (
      typeof schema !== 'object' ||
      schema === null ||
      !(
        (isArray(schema.oneOf) && schema.oneOf.length > 1) ||
        (isArray(schema.anyOf) && schema.anyOf.length > 1)
      )
    )
      continue;
    getDirectChildSelectionPlan(host, blueprint, true);
    getGateSelectionTable(host, blueprint);
  }
};
