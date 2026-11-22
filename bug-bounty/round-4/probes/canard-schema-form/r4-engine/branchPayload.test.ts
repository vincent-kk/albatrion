import { describe, expect, it } from 'vitest';

import { FieldNodeEventType } from '@/schema-form';

import { build, diag } from './probeHelpers';

const schema = {
  type: 'object',
  properties: {
    kind: { type: 'string', enum: ['A', 'B'], default: 'A' },
  },
  oneOf: [
    { properties: { kind: { const: 'A' }, fa: { type: 'string' } } },
    { properties: { kind: { const: 'B' }, fb: { type: 'string' } } },
  ],
} as const;

describe('diagnostic: branch field write and its UpdateValue payload', () => {
  it('D1 fa write delivers the written value', () => {
    const { root } = build(schema, { kind: 'A', fa: 'kept-a' });
    const fa = root.find('/fa');
    const fb = root.find('/fb');
    const events: unknown[] = [];
    fa.subscribe((event: any) => {
      if (event.type & FieldNodeEventType.UpdateValue)
        events.push(event.payload?.[FieldNodeEventType.UpdateValue]);
    });
    fa.setValue('q');
    diag('D1', {
      events,
      value: fa.value,
      root: root.value,
      out: root.outputValue,
      fbActive: fb?.isActive,
      fbPresent: fb?.isPresent,
      fbValue: fb?.value,
    });
    expect((events.at(-1) as any)?.current?.value).toBe('q');
  });

  it('D2 write to the inactive branch field', () => {
    const { root } = build(schema, { kind: 'A', fa: 'kept-a' });
    const fb = root.find('/fb');
    const events: unknown[] = [];
    fb?.subscribe((event: any) => {
      if (event.type & FieldNodeEventType.UpdateValue)
        events.push(event.payload?.[FieldNodeEventType.UpdateValue]);
    });
    fb?.setValue('z');
    diag('D2', {
      found: !!fb,
      events,
      value: fb?.value,
      root: root.value,
      out: root.outputValue,
      inactive: root.inactiveValues,
    });
    expect(root.value).not.toHaveProperty('fb');
  });
});
