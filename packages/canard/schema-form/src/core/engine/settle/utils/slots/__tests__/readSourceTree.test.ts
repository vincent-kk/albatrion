import { expect, it } from 'vitest';

import { createDispatchTree } from '../../../../__tests__/fixtures/createDispatchTree';
import { WriteOption } from '../../../../types/value';
import { dispatchMount, dispatchSetValue } from '../../../../write';
import { getDispatchNode } from '../../../__tests__/fixtures/getDispatchNode';
import { getSettlementScratch } from '../../scratch/getSettlementScratch';
import { releaseSettlementScratch } from '../../scratch/releaseSettlementScratch';
import { createSettlementContext } from '../../settlement/createSettlementContext';
import { readSourceTree } from '../readSourceTree';

it('reads a discarded candidate descendant from its frozen source instead of a compacted survivor', () => {
  const { root, runtime } = createDispatchTree({
    type: 'object',
    properties: {
      open: { type: 'boolean' },
      object: { type: 'boolean' },
      list: {
        type: 'array',
        controls: { active: '#/open', unsetOnInactive: true },
        allOf: [
          {
            controls: { active: '#/object' },
            items: {
              type: 'object',
              properties: {
                tags: { type: 'array', items: { type: 'number' } },
                keep: {
                  type: 'number',
                  controls: { unsetOnInactive: false },
                },
              },
            },
          },
          {
            controls: { active: '!#/object' },
            items: { type: 'string' },
          },
        ],
      },
    },
  });
  dispatchMount(root, {
    open: true,
    object: true,
    list: [{ tags: [1, 2] }, { tags: [9, 10, 11], keep: 12 }],
  });
  const oldTags = getDispatchNode(root, 'list', '0', 'tags');
  dispatchSetValue(getDispatchNode(root, 'object'), false);
  dispatchSetValue(getDispatchNode(root, 'open'), false);
  expect(oldTags.path).toBe('/list/0/tags');
  const scratch = getSettlementScratch(runtime);
  const context = createSettlementContext(
    root,
    'callerReplace',
    WriteOption.Overwrite,
    scratch,
  );
  try {
    expect(readSourceTree(oldTags, context)).toEqual([1, 2]);
  } finally {
    releaseSettlementScratch(scratch);
  }
});
