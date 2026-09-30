import { isArray } from '@winglet/common-utils/filter';

import type { SchemaNodeRecord } from '../../../record';
import { getControlExpression } from './getControlExpression';
import { getControlLayers } from './getControlLayers';
import { readStateDependency } from './readStateDependency';

/** Each state key has its own identity and order-independent combination. */
const STATE_KEYS = {
  visible: { initial: true, combine: (left: boolean, right: boolean) => left && right },
  readOnly: { initial: false, combine: (left: boolean, right: boolean) => left || right },
  disabled: { initial: false, combine: (left: boolean, right: boolean) => left || right },
} as const;
/** Fixed control key order; combination does not depend on this order. */
const KEY_NAMES = ['visible', 'readOnly', 'disabled'] as const;

/** Pure calculation result, including the first expression that failed. */
export interface CalculatedStateKeys<Self> {
  /** Final local values paired with their live targets. */
  readonly entries: readonly { readonly node: Self; readonly visible: boolean;
    readonly readOnly: boolean; readonly disabled: boolean }[];
  /** First failed state expression, retained for a degraded commit. */
  readonly failure?: { readonly path: string; readonly schemaPath: string;
    readonly cause: unknown };
}

/**
 * Calculate local state keys only for visited nodes and addressed direct children.
 * @param root - Final emitted tree and compiled expression owner
 * @param stateDirtyNodes - Nodes reached by this settlement's calculation
 * @param selectedDeclarationIds - Active declarations chosen during the settlement
 * @param expandFrom - Whether this host's declarations may affect direct children
 * @returns Local values and the first expression failure, without mutating records
 */
export const calculateStateKeys = <Self extends SchemaNodeRecord<Self>>(
  root: Self, stateDirtyNodes: ReadonlySet<Self>,
  selectedDeclarationIds: ReadonlyMap<Self, readonly number[]>,
  expandFrom: (source: Self) => boolean,
): CalculatedStateKeys<Self> => {
  const candidates = new Set(stateDirtyNodes);
  for (const source of stateDirtyNodes) {
    if (source.detached || !source.children?.length) continue;
    if (!expandFrom(source)) continue;
    if (source.blueprintNode.declarations.some((declaration) => {
      if (declaration.scope === 'fragment') return true;
      const schema = declaration.schema;
      if (!schema || typeof schema !== 'object') return false;
      const controls: unknown = Reflect.get(schema, 'controls');
      return controls && typeof controls === 'object' &&
        isArray(Reflect.get(controls, 'children'));
    })) for (const child of source.children) candidates.add(child);
  }
  const evaluated = new Map<string, boolean | undefined>();
  const blueprint = root.runtime.blueprint;
  const entries: CalculatedStateKeys<Self>['entries'][number][] = [];
  let failure: CalculatedStateKeys<Self>['failure'];
  for (const node of candidates) {
    if (node.detached || node.parent && node.parent.structure?.[node.name] !== node)
      continue;
    const schema = node.schema.schema;
    const next: Record<keyof typeof STATE_KEYS, boolean> = {
      visible: STATE_KEYS.visible.initial,
      readOnly: typeof schema === 'object' && schema.readOnly === true,
      disabled: STATE_KEYS.disabled.initial };
    for (const group of getControlLayers(node, selectedDeclarationIds))
      for (const key of KEY_NAMES) {
        const literal: unknown = Reflect.get(group.controls, key);
        if (literal === undefined) continue;
        let value: boolean | undefined;
        if (typeof literal === 'boolean') value = literal;
        else if (typeof literal === 'string') {
          const schemaPath = `${group.schemaPath}/${key}`;
          const cacheKey = JSON.stringify([group.host.path, schemaPath]);
          if (evaluated.has(cacheKey)) value = evaluated.get(cacheKey);
          else {
            const expression = getControlExpression(blueprint,
              group.declarationId, schemaPath, key);
            if (expression) try {
              value = Boolean(expression.evaluate(expression.dependencies.map(
                (dependency) => readStateDependency(root,
                  group.host.path, dependency))));
            } catch (cause) {
              failure ??= { path: group.host.path, schemaPath, cause };
            }
            evaluated.set(cacheKey, value);
          }
        }
        if (value !== undefined) next[key] = STATE_KEYS[key].combine(next[key], value);
      }
    entries.push({ node, ...next });
  }
  return { entries, ...(failure ? { failure } : {}) };
};
