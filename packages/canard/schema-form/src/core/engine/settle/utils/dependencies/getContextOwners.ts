import {
  JSONPointer as $,
  PointerOperator,
  readPointerSegment,
} from '@/schema-form/helpers/jsonPointer';

import type { Blueprint } from '../../../blueprint';
import { getDeriveRuleTable } from '../../../derive';
import { getBlueprintDerived } from '../../../utils/cache/derivedRecords';

/** Context readers are held apart from absolute JSON Pointer dependencies. */

/** Shared result for blueprints without context reads. */
const EMPTY_OWNERS: readonly string[] = Object.freeze([]);

/**
 * Find declaration paths whose expressions or gates read the tree context token.
 * @param blueprint - Immutable analysis supplying declaration IDs and reads
 * @returns Memoized owner paths to recalculate when context changes
 */
export const getContextOwners = (blueprint: Blueprint): readonly string[] => {
  if (!blueprint.capabilities.hasDependencies) return EMPTY_OWNERS;
  const cached = getBlueprintDerived<'contextOwners', readonly string[]>(
    blueprint,
  ).contextOwners;
  if (cached) return cached;
  const ids = blueprint.dependencies[$.Context];
  if (!ids?.length) {
    getBlueprintDerived<'contextOwners', readonly string[]>(
      blueprint,
    ).contextOwners = EMPTY_OWNERS;
    return EMPTY_OWNERS;
  }
  const owners: string[] = [];
  const rules = getDeriveRuleTable(blueprint);
  for (const node of blueprint.nodes)
    for (const declaration of node.declarations)
      if (
        (ids.indexOf(declaration.id) !== -1 ||
          (() => {
            const values = rules.byDeclaration.get(declaration.id);
            if (values == null) return undefined;
            for (
              let position = 0, limit = values.length;
              position < limit;
              position++
            ) {
              if (!(position in values)) continue;
              const rule = values[position];
              if (
                rule.kind === 'derived' &&
                (rule.targetName !== undefined || rule.targetItems) &&
                (() => {
                  const items = rule.watchDependencies;
                  for (
                    let index = 0, count = items.length;
                    index < count;
                    index++
                  ) {
                    if (!(index in items)) continue;
                    const path = items[index];
                    if (readPointerSegment(path, 0) === PointerOperator.Context)
                      return true;
                  }
                  return false;
                })()
              )
                return true;
            }
            return false;
          })()) &&
        owners.indexOf(declaration.path) === -1
      )
        owners.push(declaration.path);
  getBlueprintDerived<'contextOwners', readonly string[]>(
    blueprint,
  ).contextOwners = owners;
  return owners;
};
