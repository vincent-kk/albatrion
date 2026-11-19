import { describe, expect, it } from 'vitest';

import { ValidationMode } from '@/schema-form';
import { nodeFromJSONSchema } from '@/schema-form/__tests__/fixtures/nodeFromJSONSchema';

const build = <Schema extends Parameters<typeof nodeFromJSONSchema>[0]['jsonSchema']>(jsonSchema: Schema, defaultValue: unknown) => ({ root: nodeFromJSONSchema({ jsonSchema, defaultValue, validationMode: ValidationMode.None }) });

describe('virtual group reset with a gated-off constituent', () => {
  /** `booking` holds the gate source outside its scope, the two constituents and a virtual group over them. */
  const schema = {
    type: 'object',
    properties: {
      on: { type: 'boolean' },
      booking: {
        type: 'object',
        properties: {
          start: { type: 'string' },
          end: { type: 'string', controls: { active: '../../on === true' } },
        },
        options: { virtual: { period: { fields: ['start', 'end'] } } },
      },
    },
  } as const;
  const load = () => ({ on: true, booking: { start: 's0', end: 'e0' } });

  const run = (scope: '/booking' | '/booking/period') => {
    const { root } = build(schema, load());
    root.find('/booking/start').setValue('s1');
    root.find('/booking/end').setValue('e1');
    root.find('/on').setValue(false);
    root.find(scope).resetSubtree();
    const whileOff = { ...root.value.booking };
    root.find('/on').setValue(true);
    return { whileOff, afterOn: { ...root.value.booking } };
  };

  it('control: resetting the owning object restores the gated-off end to its loaded value', () => {
    expect(run('/booking')).toEqual({
      whileOff: { start: 's0' },
      afterOn: { start: 's0', end: 'e0' },
    });
  });

  it('resetting the virtual group restores both constituents like resetting the object that owns them', () => {
    expect(run('/booking/period')).toEqual(run('/booking'));
  });
});

describe('virtual tuple positions follow `fields` when a constituent is gated off', () => {
  /** A cascading address picker: `state` exists only for US addresses. */
  const schema = {
    type: 'object',
    properties: {
      country: { type: 'string' },
      state: {
        type: 'string',
        controls: { active: '../country === "US"' },
      },
      city: { type: 'string' },
    },
    options: { virtual: { address: { fields: ['country', 'state', 'city'] } } },
  } as const;
  const load = () => ({ country: 'KR', city: 'Seoul' });

  it('the tuple keeps the city at position 2, the position of city in fields', () => {
    const { root } = build(schema, load());
    const address = root.find('/address');
    expect({
      value: address.value,
      children: address.children.map((child) => child.path),
    }).toEqual({
      value: ['KR', undefined, 'Seoul'],
      children: ['/country', '/city'],
    });
  });

  it('writing the group its own value back leaves the stored fields unchanged', () => {
    const { root } = build(schema, load());
    const address = root.find('/address');
    const before = root.value;
    address.setValue(address.value);
    expect(root.value).toEqual(before);
  });

  it('an identity updater on the group gives the same value outside a batch as inside one', () => {
    const run = (batched: boolean) => {
      const { root } = build(schema, load());
      const address = root.find('/address');
      const write = () => address.setValue((previous: unknown) => previous);
      if (batched) root.batch(write);
      else write();
      return root.value;
    };
    expect({ outside: run(false), inside: run(true) }).toEqual({
      outside: { country: 'KR', city: 'Seoul' },
      inside: { country: 'KR', city: 'Seoul' },
    });
  });

  it('a widget that edits position 0 (country) as the documented tuple keeps the city', () => {
    const { root } = build(schema, load());
    const address = root.find('/address');
    const [, state, city] = address.value;
    address.setValue(['JP', state, city]);
    expect(root.value).toEqual({ country: 'JP', city: 'Seoul' });
  });

  it('control: with every constituent active the tuple and the write-back agree', () => {
    const { root } = build(schema, { country: 'US', state: 'CA', city: 'LA' });
    const address = root.find('/address');
    const before = root.value;
    address.setValue(address.value);
    expect([address.value, root.value]).toEqual([['US', 'CA', 'LA'], before]);
  });
});
