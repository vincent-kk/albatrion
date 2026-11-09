import { map as mapArray } from '@winglet/common-utils/array';
import { EMPTY_ARRAY } from '@winglet/common-utils/constant';

import type { Optional } from '@aileron/declare';

import {
  RESERVED_SCHEMA_KEYS,
  STATE_CONTROL_KEYS,
} from '@/schema-form/constants/reservedSchemaKeys';
import {
  JSONPointer as $,
  appendSegment,
} from '@/schema-form/helpers/jsonPointer';

import { getFeatureNodeIndex } from '../../../blueprint';
import type { FieldNodeRecord } from '../../../record';
import { getControlExpression } from '../../../utils/controls/getControlExpression';
import { getControlLayers } from './getControlLayers';
import { readStateDependency } from './readStateDependency';

/** Pure calculation result, including the all expressions that failed. */
export interface CalculatedStateKeys<Self> {
  /** Final local values paired with their live targets. */
  readonly entries: readonly {
    readonly node: Self;
    readonly visible: boolean;
    readonly readOnly: boolean;
    readonly disabled: boolean;
  }[];
  /** Failed state expressions in evaluation order. */
  readonly failures: readonly {
    readonly path: string;
    readonly schemaPath: string;
    readonly cause: unknown;
  }[];
}

/**
 * Calculate local state keys only for visited nodes and addressed direct children.
 * @param root - Final emitted tree and compiled expression owner
 * @param stateDirtyNodes - Nodes reached by this settlement's calculation
 * @param selectedDeclarationIds - Active declarations chosen during the settlement
 * @param expandFrom - Whether this host's declarations may affect direct children
 * @returns Local values and all expression failures, without mutating records
 */
export const calculateStateKeys = <Self extends FieldNodeRecord<Self>>(
  root: Self,
  stateDirtyNodes: ReadonlySet<Self>,
  selectedDeclarationIds: ReadonlyMap<Self, readonly number[]>,
  expandFrom: (source: Self) => boolean,
): CalculatedStateKeys<Self> => {
  const blueprint = root.runtime.blueprint;
  const index = getFeatureNodeIndex(blueprint);
  const isTarget = (node: Self): boolean =>
    index.stateKeyNodes.has(node.blueprintNode.id) ||
    (!!node.parent &&
      !!(
        index.stateKeyChildren
          .get(node.parent.blueprintNode.id)
          ?.has(node.name) ||
        (node.parent.blueprintNode.kind === 'array' &&
          index.stateKeyChildren
            .get(node.parent.blueprintNode.id)
            ?.has($.Wildcard))
      ));
  const candidates = new Set<Self>();
  for (const node of stateDirtyNodes) if (isTarget(node)) candidates.add(node);
  for (const source of stateDirtyNodes) {
    const targets = index.stateKeyChildren.get(source.blueprintNode.id);
    if (!targets) continue;
    if (source.detached || !source.children?.length) continue;
    if (!expandFrom(source)) continue;
    for (const child of source.children)
      if (
        targets.has(child.name) ||
        (source.blueprintNode.kind === 'array' && targets.has($.Wildcard))
      )
        candidates.add(child);
  }
  const evaluated = new Map<string, Optional<boolean>>();
  const entries: CalculatedStateKeys<Self>['entries'][number][] = [];
  let failures: Optional<CalculatedStateKeys<Self>['failures'][number][]>;
  for (const node of candidates) {
    if (
      node.detached ||
      (node.parent && node.parent.structure?.[node.name] !== node)
    )
      continue;
    const schema = node.schema.schema;
    const next: Record<(typeof STATE_CONTROL_KEYS)[number], boolean> = {
      visible: RESERVED_SCHEMA_KEYS.controls.visible.stateInitial,
      readOnly: typeof schema === 'object' && schema.readOnly === true,
      disabled: RESERVED_SCHEMA_KEYS.controls.disabled.stateInitial,
    };
    for (const group of getControlLayers(node, selectedDeclarationIds))
      for (const key of STATE_CONTROL_KEYS) {
        const literal: unknown = Reflect.get(group.controls, key);
        if (literal === undefined) continue;
        let value: Optional<boolean>;
        if (typeof literal === 'boolean') value = literal;
        else if (typeof literal === 'string') {
          const schemaPath = appendSegment(group.schemaPath, key);
          const cacheKey = JSON.stringify([group.host.path, schemaPath]);
          if (evaluated.has(cacheKey)) value = evaluated.get(cacheKey);
          else {
            const expression = getControlExpression(
              blueprint,
              group.declarationId,
              schemaPath,
              key,
            );
            if (expression)
              try {
                value = !!expression.evaluate(
                  mapArray(expression.dependencies, (dependency) =>
                    readStateDependency(
                      root,
                      group.host.path,
                      dependency,
                      undefined,
                      group.host,
                    ),
                  ),
                );
              } catch (cause) {
                (failures ??= []).push({
                  path: group.host.path,
                  schemaPath,
                  cause,
                });
              }
            evaluated.set(cacheKey, value);
          }
        }
        if (value !== undefined)
          next[key] = RESERVED_SCHEMA_KEYS.controls[key].stateInitial
            ? next[key] && value
            : next[key] || value;
      }
    entries.push({ node, ...next });
  }
  return { entries, failures: failures ?? EMPTY_ARRAY };
};
