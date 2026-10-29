import { isArray } from '@winglet/common-utils/filter';

import type { Blueprint, BlueprintNode } from '../../../../blueprint';
import { getBlueprintDerived } from '../../../../utils/cache/derivedRecords';
import type { GateSelectionTable } from '../../../types/gateSelectionTable';
import { getDependencyIndex } from '../../dependencies/getDependencyIndex';
import { getDirectChildSelectionPlan } from './getDirectChildSelectionPlan';
import { getGateSelectionTable } from './getGateSelectionTable';

/** Preparation is a one-time blueprint operation, including negative table evidence. */

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
  const known = getBlueprintDerived<'splitOwnersPrepared', boolean>(
    blueprint,
  ).splitOwnersPrepared;
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
        (isArray(schema.anyOf) && schema.anyOf.length > 1) ||
        (isArray(schema.allOf) &&
          schema.allOf.length > 1 &&
          (() => {
            const collection = host.childEntries;
            for (
              let cursor = 0, end = collection.length;
              cursor < end;
              cursor++
            ) {
              if (!(cursor in collection)) continue;
              const entry = collection[cursor];
              if (
                (() => {
                  const values = entry.declarations;
                  for (
                    let position = 0, limit = values.length;
                    position < limit;
                    position++
                  ) {
                    if (!(position in values)) continue;
                    const declaration = values[position];
                    if (
                      (() => {
                        const items = declaration.gates;
                        for (
                          let index = 0, count = items.length;
                          index < count;
                          index++
                        ) {
                          if (!(index in items)) continue;
                          const gate = items[index];
                          if (gate.kind === 'if') return true;
                        }
                        return false;
                      })()
                    )
                      return true;
                  }
                  return false;
                })()
              )
                return true;
            }
            return false;
          })())
      )
    )
      continue;
    getDirectChildSelectionPlan(host, blueprint, true);
    const table = getGateSelectionTable(host, blueprint);
    if (table) tables.set(host, table);
  }
  if (tables.size) getDependencyIndex(blueprint, tables);
  const split = tables.size > 0 && getDependencyIndex(blueprint).hasSplitOwners;
  getBlueprintDerived<'splitOwnersPrepared', boolean>(
    blueprint,
  ).splitOwnersPrepared = split;
  return split;
};
