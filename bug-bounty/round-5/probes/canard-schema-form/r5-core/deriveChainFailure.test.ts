import { describe, expect, it } from 'vitest';

import { attempt, build } from './probeHelpers';

/**
 * FP2: one `derived` rule throws during a write. Whether an independent rule of the same write
 * settles must not depend on the authored order of the two properties.
 */
const THROWING = '(../a) === "boom" ? null.x : (../a) + "-b"';
const INDEPENDENT = '(../a) + "-d"';

const schemaWith = (order: 'throwing-first' | 'independent-first') => {
  const b = { type: 'string', controls: { derived: THROWING } };
  const d = { type: 'string', controls: { derived: INDEPENDENT } };
  return {
    type: 'object',
    properties:
      order === 'throwing-first'
        ? { a: { type: 'string' }, b, d }
        : { a: { type: 'string' }, d, b },
  } as const;
};

const run = (order: 'throwing-first' | 'independent-first') => {
  const { root, records } = build(schemaWith(order), { a: 'x' });
  const thrown = attempt(() => root.find('/a').setValue('boom'));
  const value = root.value;
  return {
    a: value.a,
    b: value.b,
    d: value.d,
    thrown,
    codes: records.map((record) => record.code),
    status: root.diagnostics?.status,
  };
};

describe('a throwing derived rule and an independent rule of the same write', () => {
  it('the independent rule settles the same way whichever property is declared first', () => {
    expect(run('throwing-first')).toEqual(run('independent-first'));
  });

  it('diagnostic: results of both orders', () => {
    expect({
      first: run('throwing-first'),
      second: run('independent-first'),
    }).toMatchObject({
      first: { a: 'boom' },
      second: { a: 'boom' },
    });
  });
});

describe('a later write after the failure recovers the independent rule', () => {
  it('both orders reach the same value after a following valid write', () => {
    const after = (order: 'throwing-first' | 'independent-first') => {
      const { root } = build(schemaWith(order), { a: 'x' });
      attempt(() => root.find('/a').setValue('boom'));
      attempt(() => root.find('/a').setValue('ok'));
      return root.value;
    };
    expect(after('throwing-first')).toEqual(after('independent-first'));
  });
});
