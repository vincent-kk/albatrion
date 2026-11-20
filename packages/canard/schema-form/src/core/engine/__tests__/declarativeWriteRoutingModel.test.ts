import { expect, it } from 'vitest';

import { nodeFromJSONSchema } from '@/schema-form/__tests__/fixtures/nodeFromJSONSchema';

import type { AuthoredSchema } from '../types/jsonSchema';
import { ValidationMode } from '../types/state';
import { WriteOption } from '../types/value';

/*
 * Reference model for where a declarative value lands (settle DETAIL WRITE-079) and for a reset the
 * barrier settlement detaches (write DETAIL EVENT-013). The expected retained source and live value
 * of /object/y come from closed-form rules written from those contracts, never from a second run of
 * the product. Dimensions: a rule that writes the gate in the same round, a caller value for an
 * inactive address followed by a rule naming it, an exit a later rule of the settlement cancels, a
 * higher winner whose live target leaves after a lower overlapping winner's compute, and a reset its
 * own barrier detaches. Exit policies and one batch or one root Merge write are drawn per seed.
 */

type Root = ReturnType<typeof nodeFromJSONSchema>;
type Policy = 'default' | 'unsetOnInactive' | 'inactiveValue';
type Dimension =
  | 'gateRule'
  | 'callerThenRule'
  | 'exitCancelled'
  | 'layered'
  | 'resetDetached';

const POLICIES: readonly Policy[] = [
  'default',
  'unsetOnInactive',
  'inactiveValue',
];
const DIMENSIONS: readonly Dimension[] = [
  'gateRule',
  'callerThenRule',
  'exitCancelled',
  'layered',
  'resetDetached',
];

const rule = (target: string, value: (source: string) => unknown) => ({
  type: 'string' as const,
  controls: {
    injectTo: (source: unknown) =>
      typeof source === 'string' && source ? { [target]: value(source) } : {},
  },
});

/** src carries `y:<value>` or `x:<value>`: the rule names y, or only its live sibling x. */
const createSchema = (policy: Policy): AuthoredSchema => ({
  type: 'object',
  properties: {
    low: rule('../object', () => ({ on: false, x: 'low' })),
    object: {
      type: 'object',
      properties: {
        on: { type: 'boolean' },
        x: { type: 'string' },
        y: {
          type: 'string',
          controls: {
            active: '/object/on === true',
            ...(policy === 'unsetOnInactive'
              ? { unsetOnInactive: true }
              : policy === 'inactiveValue'
                ? { inactiveValue: 'resolved' }
                : {}),
          },
        },
      },
    },
    src: {
      type: 'string',
      controls: {
        injectTo: (source: unknown) => {
          if (typeof source !== 'string' || !source) return {};
          const [key, value] = source.split(':');
          return { [`../object/${key}`]: value };
        },
      },
    },
    close: rule('../object/on', () => false),
    reopen: rule('../object/on', () => true),
  },
});

/** The model's view of /object/y after the scenario: live value, or retained source, or neither. */
type Expected = { readonly live?: string; readonly retained?: string };

/** Exit of y from value `value` under `policy`, with nothing named for it afterwards. */
const exit = (policy: Policy, value: string | undefined): Expected =>
  policy === 'unsetOnInactive'
    ? {}
    : policy === 'inactiveValue'
      ? { retained: 'resolved' }
      : value === undefined
        ? {}
        : { retained: value };

const model = (
  dimension: Dimension,
  policy: Policy,
  named: string | undefined,
  caller: string,
): Expected => {
  if (dimension === 'gateRule') return exit(policy, named ?? 'y0');
  if (dimension === 'callerThenRule') return { retained: named ?? caller };
  if (dimension === 'exitCancelled') return { live: named ?? 'y0' };
  // The lower winner omits the live y it makes leave; that exit keeps y's committed value, as the
  // lower winner's own single call does, so the policy applies to y0.
  if (dimension === 'layered')
    return named !== undefined ? { retained: named } : exit(policy, 'y0');
  return { retained: caller };
};

const observe = (root: Root): Expected => {
  const live = root.find('/object/y');
  const retained = root.inactiveValues.find(({ path }) => path === '/object/y');
  return {
    ...(live ? { live: String(live.value) } : {}),
    ...(retained ? { retained: String(retained.value) } : {}),
  };
};

it('places each declarative value where the routing model says for 3000 seeds', () => {
  for (let seed = 1; seed <= 3000; seed++) {
    let state = seed;
    const random = (limit: number) => {
      state = (Math.imul(state, 1664525) + 1013904223) >>> 0;
      return (state >>> 8) % limit;
    };
    const dimension = DIMENSIONS[random(DIMENSIONS.length)];
    const policy = POLICIES[random(POLICIES.length)];
    const isMerge = dimension !== 'resetDetached' && random(2) === 1;
    const named = random(3) === 0 ? undefined : `v${seed}`;
    const caller = `c${seed}`;
    const source = named !== undefined ? `y:${named}` : `x:${seed}`;
    const on = dimension !== 'callerThenRule';
    const root = nodeFromJSONSchema({
      jsonSchema: createSchema(policy),
      defaultValue: { object: { on, x: 'x0', y: 'y0' } },
      validationMode: ValidationMode.None,
    });
    const merges: Record<
      Exclude<Dimension, 'resetDetached'>,
      Record<string, unknown>
    > = {
      gateRule: { src: source, close: 'c' },
      callerThenRule: { object: { y: caller }, src: source },
      exitCancelled: { object: { on: false }, src: source, reopen: 'r' },
      layered: { low: 'l', src: source },
    };
    if (dimension === 'resetDetached') {
      root.batch(() => {
        const y = root.find('/object/y')!;
        y.setValue(caller);
        root.find('/object/on')!.setValue(false);
        y.resetSubtree();
      });
    } else if (isMerge) root.setValue(merges[dimension], WriteOption.Merge);
    else
      root.batch(() => {
        for (const [key, value] of Object.entries(merges[dimension]))
          root.setValue({ [key]: value }, WriteOption.Merge);
      });
    expect(
      observe(root),
      `seed=${seed} ${dimension} ${policy} merge=${isMerge} named=${named}`,
    ).toEqual(model(dimension, policy, named, caller));
  }
}, 120_000);
