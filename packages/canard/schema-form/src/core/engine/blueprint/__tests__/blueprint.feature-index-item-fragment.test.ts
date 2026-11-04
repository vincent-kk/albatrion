import { describe, expect, it } from 'vitest';

import { JSONPointer as $ } from '@/schema-form/helpers/jsonPointer';

import { blueprint } from '../blueprint';
import { getFeatureNodeIndex } from '../utils/features/getFeatureNodeIndex';

/**
 * Read the state-key child names indexed for the `/list` template.
 * @param list - Array schema authored at `/list`
 * @returns Sorted child names whose state keys the list's declarations address
 */
const listTargets = (list: Record<string, unknown>) => {
  const analysis = blueprint({ type: 'object', properties: { list } });
  const host = analysis.nodes.find((node) => node.path === '/list');
  return [
    ...(getFeatureNodeIndex(analysis).stateKeyChildren.get(host!.id) ?? []),
  ].sort();
};

// filid:contract feature-index-item-fragment
describe('feature index of array item fragments', () => {
  it('CONTROLS-077 indexes the items wildcard of an items fragment', () => {
    expect(
      listTargets({
        type: 'array',
        allOf: [{ controls: { readOnly: true }, items: { type: 'string' } }],
      }),
    ).toEqual([$.Wildcard]);
  });

  it('CONTROLS-077 indexes the tail wildcard of an additionalItems fragment', () => {
    expect(
      listTargets({
        type: 'array',
        allOf: [
          {
            controls: { visible: false },
            items: [{ type: 'string' }],
            additionalItems: { type: 'string' },
          },
        ],
      }),
    ).toEqual([$.Wildcard, '0']);
  });

  it('CONTROLS-077 indexes tuple slots and the rest wildcard alike', () => {
    expect(
      listTargets({
        type: 'array',
        allOf: [
          {
            controls: { disabled: true },
            prefixItems: [{ type: 'string' }],
            items: { type: 'string' },
          },
        ],
      }),
    ).toEqual([$.Wildcard, '0']);
  });
});
