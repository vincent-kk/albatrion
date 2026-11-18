import { describe, expect, it } from 'vitest';

import { FieldNodeEventType } from '@/schema-form';

import { build } from './probeHelpers';

const schema = {
  type: 'object',
  properties: { a: { type: 'string' }, b: { type: 'string' } },
} as const;

describe('LC2 subscription cleanup is not idempotent', () => {
  it('S1 a one-shot listener whose cleanup also runs on teardown drops a later subscriber', () => {
    const { root } = build(schema, { a: 'x', b: 'y' });
    const b = root.find('/b');

    // Consumer: wait for the first value change, then stop listening; also clean up on teardown.
    let off: () => void = () => {};
    off = b.subscribe(({ type }: { type: number }) => {
      if (type & FieldNodeEventType.UpdateValue) off();
    });
    b.setValue('first');

    // Later, something else (for example a field bridge that mounts afterwards) subscribes.
    const later: number[] = [];
    b.subscribe(({ type }: { type: number }) => later.push(type));

    // The consumer's teardown calls its cleanup a second time.
    off();

    b.setValue('second');
    expect(later.some((type) => type & FieldNodeEventType.UpdateValue)).toBe(
      true,
    );
  });

  it('S2 control: onInactive cleanup is idempotent and keeps a later registration', () => {
    const { root } = build(schema, { a: 'x', b: 'y' });
    const b = root.find('/b');
    const off = b.onInactive(() => 'one');
    off();
    b.onInactive(() => 'two');
    off();
    const listeners = (root.runtime as any).inactiveListeners as Map<unknown, Set<unknown>>;
    expect(listeners.get(b)?.size).toBe(1);
  });
});
