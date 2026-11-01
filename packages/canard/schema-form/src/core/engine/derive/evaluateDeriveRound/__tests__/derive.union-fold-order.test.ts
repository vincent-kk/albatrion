import { describe, expect, it } from 'vitest';

import { createTestTree } from '../../../__tests__/fixtures/createTestTree';
import { getDeriveSourceOrder } from '../utils/rank/getDeriveSourceOrder';

describe('same-name union source order', () => {
  it('ranks a later fold by its own blueprint edge', () => {
    const { root } = createTestTree({
      type: 'object',
      allOf: [
        {
          controls: { active: 'false' },
          properties: { shared: { type: ['string', 'number'] } },
        },
        {
          controls: { active: 'true' },
          properties: { shared: { type: ['string', 'boolean'] } },
        },
      ],
    });
    const edges = root.blueprintNode.childEntries.filter(
      (entry) => entry.name === 'shared',
    );
    const source = root.runtime.nodeFactory(edges[1], root, root.runtime);
    expect(getDeriveSourceOrder(source)).toEqual([
      root.blueprintNode.childEntries.indexOf(edges[1]),
    ]);
    expect(getDeriveSourceOrder(source)).not.toEqual([
      root.blueprintNode.childEntries.indexOf(edges[0]),
    ]);
  });
});
