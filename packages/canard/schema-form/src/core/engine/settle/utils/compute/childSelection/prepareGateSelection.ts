import { isArray } from '@winglet/common-utils/filter';

import type { Blueprint, BlueprintNode } from '../../../../blueprint';
import { registerEngineDerivedReset } from '../../../../utils/cache/engineModes';
import type { GateSelectionTable } from '../../../types/gateSelectionTable';
import { getDependencyIndex } from '../../dependencies/getDependencyIndex';
import { getDirectChildSelectionPlan } from './getDirectChildSelectionPlan';
import { getGateSelectionTable } from './getGateSelectionTable';

/** Preparation is a one-time blueprint operation, including negative table evidence. */
let PREPARED = new WeakMap<Blueprint, boolean>();
registerEngineDerivedReset(() => {
  PREPARED = new WeakMap<Blueprint, boolean>();
});

/**
 * Memoize static selection metadata before a mount's load without evaluating gates.
 * @param blueprint - Immutable mount analysis with branches and compiled expressions
 * @param allowPreparation - False for a generic load; only already-prepared metadata may be consumed there
 * @returns Whether the injected registration index contains split owners
 */
export const prepareGateSelection = (
  blueprint: Blueprint,
  allowPreparation = true,
): boolean => {
  const known = PREPARED.get(blueprint);
  if (known !== undefined) return known;
  if (!allowPreparation) return false;
  const tables = new Map<BlueprintNode, GateSelectionTable>();
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
    const table = getGateSelectionTable(host, blueprint);
    if (table) tables.set(host, table);
  }
  if (tables.size) getDependencyIndex(blueprint, tables);
  const split = tables.size > 0 && getDependencyIndex(blueprint).hasSplitOwners;
  PREPARED.set(blueprint, split);
  return split;
};
