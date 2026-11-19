import { describe, expect, it } from 'vitest';

import { SetValueOption } from '@/schema-form';

import { attempt, build } from './probeHelpers';

/**
 * FP2 and EQ10 against the round 4 item 12 fix (883740bb1): a suppressing form settles a batch
 * that mixes EnableAutomaticWrites with plain writes one write at a time. When one of those
 * settlements fails, the writes after it must still commit, as they do one by one and as the
 * composed path does.
 */
const schema = {
  type: 'object',
  properties: {
    src: {
      type: 'string',
      controls: {
        injectTo: (value: unknown) => {
          if (value === 'boom') throw new Error('inject failed');
          return { '../copy': value };
        },
      },
    },
    copy: { type: 'string' },
    b: { type: 'number' },
    note: { type: 'string' },
  },
} as const;

const load = () => ({ src: 's', copy: 's', b: 1, note: 'n' });

/** Run each call one by one, catching each failure, like an application that reports and goes on. */
const sequential = (extra: any, calls: ((root: any) => void)[]) => {
  const { root, records } = build(schema, load(), extra);
  const thrown = calls.map((call) => attempt(() => call(root)));
  return { value: root.value, thrown, codes: records.map((r) => r.code) };
};

const batched = (extra: any, calls: ((root: any) => void)[]) => {
  const { root, records } = build(schema, load(), extra);
  const thrown = attempt(() =>
    root.batch(() => {
      for (const call of calls) call(root);
    }),
  );
  return { value: root.value, thrown, codes: records.map((r) => r.code) };
};

describe('a failing settlement inside a batch does not drop the later writes', () => {
  it('control: composed batch path (no suppression) keeps the write after the failing one', () => {
    const calls = [
      (root: any) => root.find('/src').setValue('boom'),
      (root: any) => root.find('/b').setValue(7),
      (root: any) => root.find('/note').setValue('m'),
    ];
    const one = sequential({}, calls);
    const many = batched({}, calls);
    expect({ b: many.value.b, note: many.value.note }).toEqual({
      b: one.value.b,
      note: one.value.note,
    });
  });

  it('suppressing form, mixed options: the writes after a failing EnableAutomaticWrites write commit as they do one by one', () => {
    const extra = { disableAutomaticWrites: true };
    const calls = [
      (root: any) =>
        root
          .find('/src')
          .setValue('boom', SetValueOption.EnableAutomaticWrites),
      (root: any) => root.find('/b').setValue(7),
      (root: any) => root.find('/note').setValue('m'),
    ];
    const one = sequential(extra, calls);
    const many = batched(extra, calls);
    expect({
      sequential: { b: one.value.b, note: one.value.note },
      batched: { b: many.value.b, note: many.value.note },
    }).toEqual({
      sequential: { b: 7, note: 'm' },
      batched: { b: 7, note: 'm' },
    });
  });

  it('suppressing form, same writes without the option: every plain write commits', () => {
    const extra = { disableAutomaticWrites: true };
    const calls = [
      (root: any) =>
        root
          .find('/src')
          .setValue('boom', SetValueOption.EnableAutomaticWrites),
      (root: any) => root.find('/b').setValue(7, SetValueOption.EnableAutomaticWrites),
      (root: any) => root.find('/note').setValue('m', SetValueOption.EnableAutomaticWrites),
    ];
    const many = batched(extra, calls);
    expect({ b: many.value.b, note: many.value.note }).toEqual({
      b: 7,
      note: 'm',
    });
  });

  it('rejected hypothesis: the mixed path and the composed path report the failure once and keep every write', () => {
    const extra = { disableAutomaticWrites: true };
    const calls = [
      (root: any) =>
        root
          .find('/src')
          .setValue('boom', SetValueOption.EnableAutomaticWrites),
      (root: any) => root.find('/b').setValue(7),
    ];
    const one = sequential(extra, calls);
    const many = batched(extra, calls);
    const composed = batched({}, [
      (root: any) => root.find('/src').setValue('boom'),
      (root: any) => root.find('/b').setValue(7),
    ]);
    expect([many.value, composed.value, many.codes, composed.codes]).toEqual([
      one.value,
      one.value,
      one.codes,
      one.codes,
    ]);
  });
});
