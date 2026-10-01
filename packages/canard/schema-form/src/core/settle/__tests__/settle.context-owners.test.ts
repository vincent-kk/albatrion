import { describe, expect, it } from 'vitest';

import { getContextOwners } from '../utils/context/getContextOwners';
import { createTestTree } from './fixtures/createTestTree';

// filid:contract settle-derive
describe('context dependency owners', () => {
  it('28C-03 context slot retains @ readers outside the path trie', () => {
    const { blueprint } = createTestTree({ type: 'object', properties: {
      target: { type: 'string', controls: { derived: '@.label' } },
      gate: { type: 'string', controls: { active: '@.enabled' } },
    } });
    expect(getContextOwners(blueprint)).toContain('/target');
    expect(getContextOwners(blueprint)).toContain('/gate');
  });
});
