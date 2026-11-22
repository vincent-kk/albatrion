import { describe, expect, it } from 'vitest';

import { build, diag } from './probeHelpers';

const schema = {
  type: 'object',
  properties: {
    start: { type: 'string', format: 'date' },
    end: { type: 'string', format: 'date' },
    note: { type: 'string' },
  },
  options: { virtual: { period: { fields: ['start', 'end'] } } },
} as const;

const load = () => ({ start: '2025-01-01', end: '2025-01-31', note: 'n' });
const loaded = { start: '2025-01-01', end: '2025-01-31', note: 'n' };

describe('virtual group resetSubtree', () => {
  it('V1 resetSubtree on an unedited virtual group keeps the loaded field values', () => {
    const { root } = build(schema, load());
    root.find('/period').resetSubtree();
    diag('V1', { value: root.value, period: root.find('/period').value });
    expect(root.value).toEqual(loaded);
  });

  it('V2 resetSubtree on a virtual group restores its edited fields to the loaded values', () => {
    const { root } = build(schema, load());
    root.find('/period').setValue(['2025-02-01', '2025-02-28']);
    root.find('/period').resetSubtree();
    diag('V2', { value: root.value, period: root.find('/period').value });
    expect(root.value).toEqual(loaded);
  });

  it('V3 control: resetSubtree on each field restores it', () => {
    const { root } = build(schema, load());
    root.find('/period').setValue(['2025-02-01', '2025-02-28']);
    root.find('/start').resetSubtree();
    root.find('/end').resetSubtree();
    diag('V3', root.value);
    expect(root.value).toEqual(loaded);
  });

  it('V4 control: root resetSubtree restores the fields', () => {
    const { root } = build(schema, load());
    root.find('/period').setValue(['2025-02-01', '2025-02-28']);
    root.resetSubtree();
    diag('V4', root.value);
    expect(root.value).toEqual(loaded);
  });

  it('[diagnostic] V7 isDivergent and defaultValue of a virtual group', () => {
    const { root } = build(schema, load());
    const period = root.find('/period');
    const before = { divergent: period.isDivergent, defaultValue: period.defaultValue };
    root.find('/start').setValue('2025-05-01');
    const after = {
      divergent: period.isDivergent,
      startDivergent: root.find('/start').isDivergent,
    };
    diag('V7', { before, after });
    expect(after.divergent).toBe(after.startDivergent);
  });

  it('V5 batch: a field write marked before resetSubtree of its virtual group is not applied over the reset', () => {
    const sequential = build(schema, load()).root;
    sequential.find('/start').setValue('2025-03-01');
    sequential.find('/period').resetSubtree();
    const batched = build(schema, load()).root;
    batched.batch(() => {
      batched.find('/start').setValue('2025-03-01');
      batched.find('/period').resetSubtree();
    });
    diag('V5', { sequential: sequential.value, batched: batched.value });
    expect(batched.value).toEqual(sequential.value);
  });

  it('V6 batch: a virtual group write marked before resetSubtree of one of its fields is not applied over the reset', () => {
    const sequential = build(schema, load()).root;
    sequential.find('/period').setValue(['2025-04-01', '2025-04-30']);
    sequential.find('/start').resetSubtree();
    const batched = build(schema, load()).root;
    batched.batch(() => {
      batched.find('/period').setValue(['2025-04-01', '2025-04-30']);
      batched.find('/start').resetSubtree();
    });
    diag('V6', { sequential: sequential.value, batched: batched.value });
    expect(batched.value).toEqual(sequential.value);
  });
});
