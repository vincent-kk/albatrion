import { describe, expect, it } from 'vitest';

import { createTestTree } from '../../__tests__/fixtures/createTestTree';
import { getContextOwners } from '../utils/dependencies/getContextOwners';

// filid:contract settle-derive-context-owners
describe('context dependency owners', () => {
  it('28C-03 context slot retains @ readers outside the path trie', () => {
    const { blueprint } = createTestTree({
      type: 'object',
      properties: {
        target: { type: 'string', controls: { derived: '@.label' } },
        gate: { type: 'string', controls: { active: '@.enabled' } },
      },
    });
    expect(getContextOwners(blueprint)).toContain('/target');
    expect(getContextOwners(blueprint)).toContain('/gate');
  });
});
