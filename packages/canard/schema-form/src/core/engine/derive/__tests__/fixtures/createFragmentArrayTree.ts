import { isTestFieldNode } from '@/schema-form/core/__tests__/fixtures/testFieldNode';
import { makeFieldNodeTree } from '@/schema-form/core/__tests__/makeFieldNodeTree';
import type { BlueprintSchema } from '@/schema-form/core/engine/blueprint';
import { isArrayNode } from '@/schema-form/core/surface';

import type { DeriveRuleKind } from '../../types/rules';

/**
 * Mount an array fragment with stable base items and a switchable value rule.
 * @param kind - Fragment value control to exercise
 * @param fragment - Item declarations owned by the fragment
 * @param base - Array declarations that remain when the fragment is off
 * @param values - Initial item values
 * @returns Public root and array operations plus the runtime edge ledger
 */
export const createFragmentArrayTree = (
  kind: Exclude<DeriveRuleKind, 'injectTo'>,
  fragment: Exclude<BlueprintSchema, boolean> = { items: { type: 'string' } },
  base: Exclude<BlueprintSchema, boolean> = fragment,
  values: readonly unknown[] = ['a', 'b', 'c'],
) => {
  /** Mounted tree and public operations for this rule scenario. */
  const { root } = makeFieldNodeTree({
    type: 'object',
    properties: {
      source: { type: 'string' },
      trigger: { type: 'boolean' },
      enabled: { type: 'boolean' },
      list: {
        type: 'array',
        ...base,
        allOf: [
          {
            ...fragment,
            controls: {
              active: '../enabled',
              [kind]: kind === 'derived' ? '../source' : '../trigger',
            },
          },
        ],
      },
    },
  });
  root.setValue({ source: 'A', trigger: false, enabled: true, list: values });
  /** Public array occurrence addressed by the fragment. */
  const list = root.find('/list');
  if (!list || !isArrayNode(list) || !isTestFieldNode(root))
    throw new Error('Expected an array and its runtime record');
  return { root, list, runtime: root.runtime };
};
