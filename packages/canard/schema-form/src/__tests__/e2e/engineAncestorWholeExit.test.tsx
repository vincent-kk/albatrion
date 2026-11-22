import { expect, it } from 'vitest';

import {
  type JSONSchema as AuthoredSchema,
  ValidationMode,
  SetValueOption as WriteOption,
} from '../../index';
import { mountEngineForm } from './fixtures/mountEngineForm';

/*
 * Settle DETAIL VALUE-043: only a caller value written inside the leaving subtree names a leaving
 * address over its exit policy; a whole write of an ancestor above the exit omits the address and
 * does not name it. /o/y is active while /on is true. Closing the gate and writing the live /o whole
 * (undefined, or an object without y) in one batch in either order, in a nested batch, or in one
 * Merge applies y's exit policy once to the final caller state: default keeps y's final value
 * (none after the whole write, y0 after a Merge that deep-merges /o without y), unsetOnInactive
 * keeps nothing, inactiveValue keeps 'resolved'. The same calls in sequence with the gate first are
 * two settlements: the later whole write clears the retained value, so inactiveValue keeps nothing.
 */
type Root = ReturnType<typeof mountEngineForm>;
type Policy = 'default' | 'unsetOnInactive' | 'inactiveValue';

const createSchema = (policy: Policy): AuthoredSchema => ({
  type: 'object',
  properties: {
    on: { type: 'boolean' },
    o: {
      type: 'object',
      properties: {
        x: { type: 'string' },
        y: {
          type: 'string',
          controls: {
            active: '/on === true',
            ...(policy === 'unsetOnInactive'
              ? { unsetOnInactive: true }
              : policy === 'inactiveValue'
                ? { inactiveValue: 'resolved' }
                : {}),
          },
        },
      },
    },
  },
});

const observe = (policy: Policy, write: (root: Root) => void) => {
  const root = mountEngineForm({
    jsonSchema: createSchema(policy),
    defaultValue: { on: true, o: { x: 'x0', y: 'y0' } },
    validationMode: ValidationMode.None,
  });
  write(root);
  return {
    o: root.find('/o')?.value,
    retained: Object.fromEntries(
      root.inactiveValues.map(({ path, value }) => [path, value]),
    ),
  };
};

const PAYLOADS = [
  ['undefined', undefined],
  ['an object omitting y', { x: 'x1' }],
] as const;

const close = (root: Root) => root.find('/on')!.setValue(false);

/** The single-settlement forms of one gate close and one whole write of /o. */
const FORMS = [
  [
    'batch, gate first',
    (whole: unknown) => (root: Root) =>
      root.batch(() => {
        close(root);
        root.find('/o')!.setValue(whole);
      }),
  ],
  [
    'batch, whole first',
    (whole: unknown) => (root: Root) =>
      root.batch(() => {
        root.find('/o')!.setValue(whole);
        close(root);
      }),
  ],
  [
    'nested batch',
    (whole: unknown) => (root: Root) =>
      root.batch(() =>
        root.batch(() => {
          close(root);
          root.find('/o')!.setValue(whole);
        }),
      ),
  ],
  [
    'nested batch, whole first',
    (whole: unknown) => (root: Root) =>
      root.batch(() =>
        root.batch(() => {
          root.find('/o')!.setValue(whole);
          close(root);
        }),
      ),
  ],
  [
    'one Merge, whole first',
    (whole: unknown) => (root: Root) =>
      root.setValue({ o: whole, on: false }, WriteOption.Merge),
  ],
  [
    'one Merge',
    (whole: unknown) => (root: Root) =>
      root.setValue({ on: false, o: whole }, WriteOption.Merge),
  ],
] as const;

/** The retained y the exit policy leaves for the final caller state. */
const expectedRetained = (
  policy: Policy,
  finalY: string | undefined,
): Record<string, unknown> =>
  policy === 'inactiveValue'
    ? { '/o/y': 'resolved' }
    : policy === 'default' && finalY !== undefined
      ? { '/o/y': finalY }
      : {};

it.each(['default', 'unsetOnInactive', 'inactiveValue'] as const)(
  'an ancestor whole write above the exit does not name y under the %s policy',
  (policy) => {
    for (const [payload, whole] of PAYLOADS)
      for (const [form, write] of FORMS) {
        // A Merge deep-merges an object into the live /o, so y keeps its committed value.
        const finalY =
          form.startsWith('one Merge') && whole !== undefined
            ? 'y0'
            : undefined;
        expect(observe(policy, write(whole)), `${payload}, ${form}`).toEqual({
          o: whole === undefined ? {} : { x: 'x1' },
          retained: expectedRetained(policy, finalY),
        });
      }
  },
);

it('the same calls in sequence with the gate first clear the resolved value in the second settlement', () => {
  for (const [payload, whole] of PAYLOADS)
    expect(
      observe('inactiveValue', (root) => {
        close(root);
        root.find('/o')!.setValue(whole);
      }).retained,
      payload,
    ).toEqual({});
});

it.each([
  ['default', { '/o/y': 'caller' }],
  ['unsetOnInactive', {}],
  ['inactiveValue', { '/o/y': 'caller' }],
] as const)(
  'applies %s once to a whole write naming the leaving child (VALUE-043 and WRITE-031)',
  (policy, retained) => {
    const whole = { x: 'x1', y: 'caller' };
    for (const [form, write] of FORMS)
      expect(observe(policy, write(whole)), form).toEqual({
        o: { x: 'x1' },
        retained,
      });
    const valueFirst = observe(policy, (root) => {
      root.find('/o')!.setValue(whole);
      close(root);
    });
    expect(valueFirst.retained).toEqual(
      policy === 'inactiveValue' ? { '/o/y': 'resolved' } : retained,
    );
    expect(
      observe(policy, (root) => {
        close(root);
        root.find('/o')!.setValue(whole);
      }).retained,
    ).toEqual({ '/o/y': 'caller' });
  },
);
