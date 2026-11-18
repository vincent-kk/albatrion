import { describe, expect, it } from 'vitest';

import { attempt, build, codes, diag } from './probeHelpers';

const gated = {
  type: 'object',
  properties: {
    on: { type: 'boolean' },
    b: {
      type: 'string',
      controls: { active: '../on === true', inactiveValue: 'declared' },
    },
    c: { type: 'string', controls: { derived: '(../on) ? "yes" : "no"' } },
  },
} as const;

describe('FP1 onInactive resolver that throws', () => {
  it('F1 the exit still settles, the failure is reported, and the next exit uses the resolver again', () => {
    const { root, records } = build(gated, { on: true, b: 'typed' });
    const b = root.find('/b');
    let fail = true;
    b.onInactive(() => {
      if (fail) throw new Error('resolver failed');
      return 'resolved';
    });
    records.length = 0;
    const thrown = attempt(() => root.find('/on').setValue(false));
    diag('F1 exit', {
      thrown: String(thrown),
      codes: codes(records),
      value: root.value,
      inactive: root.inactiveValues,
    });
    expect(root.find('/c').value).toBe('no');
    root.find('/on').setValue(true);
    diag('F1 back', { value: root.value });
    fail = false;
    const b2 = root.find('/b');
    b2.onInactive(() => 'resolved');
    root.find('/on').setValue(false);
    diag('F1 second exit', { value: root.value, inactive: root.inactiveValues });
  });
});

describe('FP1 onChange that throws', () => {
  it('F2 a throwing onChange does not stop later writes from notifying', () => {
    let calls = 0;
    const { root } = build(
      { type: 'object', properties: { a: { type: 'string' } } },
      { a: 'x' },
      {
        onChange: () => {
          calls++;
          if (calls === 1) throw new Error('onChange failed');
        },
      },
    );
    calls = 0;
    const t1 = attempt(() => root.find('/a').setValue('y'));
    const t2 = attempt(() => root.find('/a').setValue('z'));
    diag('F2', { t1: String(t1), t2: String(t2), calls, value: root.value });
    expect(calls).toBe(2);
    expect(t2).toBeUndefined();
  });
});
