import { describe, expect, it } from 'vitest';

import { blueprint } from '../../../blueprint';
import { getDeriveRuleTable } from '../index';

// filid:contract derive-edge
describe('derive rule table', () => {
  it('SETTLE-043 caches occurrences and combines only authored watches', () => {
    const analysis = blueprint({ type: 'object', properties: {
      source: { type: 'string' }, watched: { type: 'string' }, other: { type: 'string' },
      target: { type: 'string', controls: {
        watch: '../watched', derived: '../source',
        unsetValue: '../other',
      } },
    } });
    const first = getDeriveRuleTable(analysis);
    expect(getDeriveRuleTable(analysis)).toBe(first);
    const derived = first.rules.find((rule) => rule.kind === 'derived');
    expect(derived?.dependencies).toEqual(['../source', '../watched']);
  });

  it('SETTLE-017 shares an empty table across rule-free blueprints', () => {
    const first = getDeriveRuleTable(blueprint({ type: 'string' }));
    const second = getDeriveRuleTable(blueprint({ type: 'number' }));
    expect(first).toBe(second);
    expect(first.rules).toHaveLength(0);
  });
});
