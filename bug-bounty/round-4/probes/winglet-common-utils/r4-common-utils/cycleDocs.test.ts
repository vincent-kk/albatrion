import { runInNewContext } from 'node:vm';

import { describe, expect, it } from 'vitest';

import { cloneLite, equals, merge } from '@/common-utils';

// docs/agents/skills/common-utils-skill/knowledge/semantics.md:94 and SKILL.md:15 list
// cloneLite and equals as "recursion, so a cycle overflows the stack" (fail fast), apart
// from the iterative functions that "spin forever". The probe runs each call under a vm
// watchdog so a call that never ends is reported instead of hanging the test run.
const outcomeOnCycle = (call: () => unknown, timeout: number) => {
  try {
    runInNewContext('call()', { call }, { timeout });
    return 'returned';
  } catch (error) {
    const message = String((error as Error)?.message ?? error);
    if (/timed out/.test(message)) return 'did not finish';
    return (error as Error)?.constructor?.name === 'RangeError' ||
      /call stack/.test(message)
      ? 'stack overflow'
      : `threw ${message}`;
  }
};

const cycle = () => {
  const node: Record<string, unknown> = { name: 'n' };
  node.self = node;
  return node;
};

describe('packaged knowledge: functions documented to overflow the stack on a cycle fail fast', () => {
  it('equals on two cyclic objects overflows the stack as documented', () => {
    expect(outcomeOnCycle(() => equals(cycle(), cycle()), 500)).toBe('stack overflow');
  });

  it('cloneLite on a cyclic object overflows the stack as documented', () => {
    expect(outcomeOnCycle(() => cloneLite(cycle()), 100)).toBe('stack overflow');
  });

  // equals.ts:163-170 JSDoc example, verbatim: "This will crash ... RangeError".
  it('the equals JSDoc example (two objects referencing each other) throws RangeError', () => {
    const circular1: any = { name: 'obj1' };
    const circular2: any = { name: 'obj2' };
    circular1.ref = circular2;
    circular2.ref = circular1;
    expect(outcomeOnCycle(() => equals(circular1, circular2), 500)).toBe(
      'stack overflow',
    );
  });

  it('equals on two isomorphic mutual cycles throws RangeError as the JSDoc example says', () => {
    const make = () => {
      const left: any = { name: 'node' };
      const right: any = { name: 'node' };
      left.ref = right;
      right.ref = left;
      return left;
    };
    expect(outcomeOnCycle(() => equals(make(), make()), 500)).toBe(
      'stack overflow',
    );
  });

  it('control: merge with a cyclic source overflows the stack as documented', () => {
    const source = cycle();
    expect(outcomeOnCycle(() => merge({}, source), 2000)).toBe('stack overflow');
  });
});
