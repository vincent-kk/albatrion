import { describe, expect, it } from 'vitest';

import { blueprint } from '../index';

/** Return the active gate on a nested declaration for location checks. */
const nestedGate = (active: string) =>
  blueprint({
    type: 'object',
    properties: {
      p: {
        type: 'object',
        properties: {
          child: { type: 'string', controls: { active } },
        },
      },
    },
  }).root.childEntries[0].node.childEntries[0].node.declarations[0].gates[0];

// filid:contract gate-evaluation-location
describe('BlueprintGate evaluation reads', () => {
  it('SETTLE-045 root: # alone and (/) relocate to root', () => {
    expect(nestedGate('#').evaluationReads).toEqual(['']);
    expect(nestedGate('(/)').evaluationReads).toEqual(['']);
  });

  it('SETTLE-045 p location: /p and #/p relocate to p', () => {
    expect(nestedGate('/p').evaluationReads).toEqual(['/p']);
    expect(nestedGate('#/p').evaluationReads).toEqual(['/p']);
  });

  it('SETTLE-045 at excluded: @ leaves the declaration host intact', () => {
    expect(nestedGate('@').evaluationReads).toEqual([]);
  });

  it('SETTLE-045 preserves one read list for a shared reference template', () => {
    const analysis = blueprint({ type: 'object',
      $defs: { branch: { type: 'object', properties: {
        flag: { type: 'boolean' },
        child: { type: 'string', controls: { active: '../flag' } },
      } } },
      properties: { p: { $ref: '#/$defs/branch' }, q: { $ref: '#/$defs/branch' } },
    });
    const [p, q] = analysis.root.childEntries;
    expect(p.node).toBe(q.node);
    expect(p.node.childEntries[1].declarations[0].gates[0].evaluationReads).toEqual([1]);
  });

  it('SETTLE-045 keeps finite recursive template reads independent of depth', () => {
    const analysis = blueprint({
      $defs: { loop: { type: 'object', properties: {
        flag: { type: 'boolean' },
        next: { $ref: '#/$defs/loop', controls: { active: '../flag' } },
      } } },
      $ref: '#/$defs/loop',
    });
    const first = analysis.root.childEntries[1];
    const second = first.node.childEntries[1];
    expect(analysis.nodes.length).toBeLessThan(10);
    expect(first.declarations[0].gates[0].evaluationReads).toEqual([1]);
    expect(second.declarations[0].gates[0].evaluationReads).toEqual([1]);
  });

});
