import { expect, it } from 'vitest';

import { nodeFromJSONSchema } from '@/schema-form/__tests__/fixtures/nodeFromJSONSchema';

import type { AuthoredSchema } from '../types/jsonSchema';
import { ValidationMode } from '../types/state';
import { WriteOption } from '../types/value';
import { createSeedSampler } from './fixtures/createSeedSampler';

/*
 * Reference model for where a declarative value lands (settle DETAIL WRITE-079) and for a reset the
 * barrier settlement detaches (write DETAIL EVENT-013). The expected retained source and live value
 * of /object/y come from closed-form rules written from those contracts, never from a second run of
 * the product. Dimensions: a rule that writes the gate in the same round, a caller value for an
 * inactive address followed by a rule naming it, an exit a later rule of the settlement cancels, a
 * higher winner whose live target leaves after a lower overlapping winner's compute, a reset its
 * own barrier detaches, a lower winner naming a descendant and a higher winner naming the whole of
 * a leaving container (records apply in rank order), and a refused reset whose earlier whole mark a
 * later Merge covers in part (only the named key is replaced). Exit policies and one batch or one
 * root Merge write are drawn per seed. The last two dimensions observe /outer instead of /object/y.
 *
 * Seeds: 1 to 3000 locally and in the pre-release tier. The pr tier runs 720 stratified seeds: the
 * first 20 of each of 36 classes, dimension times exit policy times batch or Merge (the two reset
 * dimensions have no Merge form, so each contributes 3 classes and the others 6 each).
 */

type Root = ReturnType<typeof nodeFromJSONSchema>;
type Policy = 'default' | 'unsetOnInactive' | 'inactiveValue';
type Dimension =
  | 'gateRule'
  | 'callerThenRule'
  | 'exitCancelled'
  | 'layered'
  | 'resetDetached'
  | 'reverseRank'
  | 'resetOverlap';

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
  'reverseRank',
  'resetOverlap',
];

/** Dimensions driven by calls with a subtree reset, which has no single Merge form. */
const RESET_DIMENSIONS: readonly Dimension[] = [
  'resetDetached',
  'resetOverlap',
];

const SEED_CLASSES = DIMENSIONS.flatMap((dimension) =>
  POLICIES.flatMap((policy) =>
    (RESET_DIMENSIONS.includes(dimension) ? [false] : [false, true]).map(
      (isMerge) => `${dimension}:${policy}:${isMerge}`,
    ),
  ),
);

const sampler = createSeedSampler(3000, SEED_CLASSES, 20);

const rule = (target: string, value: (source: string) => unknown) => ({
  type: 'string' as const,
  controls: {
    injectTo: (source: unknown) =>
      typeof source === 'string' && source ? { [target]: value(source) } : {},
  },
});

/** Exit policy controls drawn for the gated leaf, without its gate. */
const policyControls = (policy: Policy) =>
  policy === 'unsetOnInactive'
    ? { unsetOnInactive: true }
    : policy === 'inactiveValue'
      ? { inactiveValue: 'resolved' }
      : {};

/**
 * src carries `y:<value>` or `x:<value>`: the rule names y, or only its live sibling x. highOuter
 * carries `v:<value>` to name /outer/y in its whole value, or `none` to omit it; lowOuterY is
 * declared before it, so it is the lower winner.
 */
const createSchema = (policy: Policy): AuthoredSchema => ({
  type: 'object',
  properties: {
    outerOn: { type: 'boolean' },
    lowOuterY: rule('../outer/y', () => 'low'),
    outer: {
      type: 'object',
      controls: { active: '/outerOn === true' },
      properties: {
        y: { type: 'string', controls: policyControls(policy) },
        z: { type: 'string' },
      },
    },
    highOuter: rule('../outer', (source) =>
      source.startsWith('v:') ? { y: source.slice(2), z: 'hz' } : { z: 'hz' },
    ),
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
            ...policyControls(policy),
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

/**
 * The model's view after the scenario: /object/y live or retained, and the retained sources under
 * /outer when there are any.
 */
type Expected = {
  readonly live?: string;
  readonly retained?: string;
  readonly outer?: Readonly<Record<string, string>>;
};

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
  if (dimension === 'resetDetached') return { retained: caller };
  // The exit policy of /outer/y runs first; the lower record then names y and the higher record
  // replaces the whole /outer after it, so its value decides y and z under every policy.
  if (dimension === 'reverseRank')
    return {
      live: 'y0',
      outer:
        named !== undefined
          ? { '/outer/y': named, '/outer/z': 'hz' }
          : { '/outer/z': 'hz' },
    };
  // The refused reset keeps the whole mark minus the key the later Merge names, written after the
  // barrier's exit policy, so y keeps the caller value under every policy and z the later value.
  return { live: 'y0', outer: { '/outer/y': caller, '/outer/z': 'lateZ' } };
};

const observe = (root: Root): Expected => {
  const live = root.find('/object/y');
  const retained = root.inactiveValues.find(({ path }) => path === '/object/y');
  const outer = root.inactiveValues
    .filter(({ path }) => path.startsWith('/outer/'))
    .map(({ path, value }) => [path, String(value)]);
  return {
    ...(live ? { live: String(live.value) } : {}),
    ...(retained ? { retained: String(retained.value) } : {}),
    ...(outer.length ? { outer: Object.fromEntries(outer) } : {}),
  };
};

it(`places each declarative value where the routing model says for ${sampler.label}`, () => {
  for (let seed = 1; sampler.has(seed); seed++) {
    let state = seed;
    const random = (limit: number) => {
      state = (Math.imul(state, 1664525) + 1013904223) >>> 0;
      return (state >>> 8) % limit;
    };
    const dimension = DIMENSIONS[random(DIMENSIONS.length)];
    const policy = POLICIES[random(POLICIES.length)];
    const isMerge = !RESET_DIMENSIONS.includes(dimension) && random(2) === 1;
    if (!sampler.accept(`${dimension}:${policy}:${isMerge}`)) continue;
    const named = random(3) === 0 ? undefined : `v${seed}`;
    const caller = `c${seed}`;
    const source = named !== undefined ? `y:${named}` : `x:${seed}`;
    const on = dimension !== 'callerThenRule';
    const root = nodeFromJSONSchema({
      jsonSchema: createSchema(policy),
      defaultValue: {
        object: { on, x: 'x0', y: 'y0' },
        outerOn: true,
        outer: { y: 'oy', z: 'oz' },
      },
      validationMode: ValidationMode.None,
    });
    const merges: Record<
      Exclude<Dimension, 'resetDetached' | 'resetOverlap'>,
      Record<string, unknown>
    > = {
      gateRule: { src: source, close: 'c' },
      callerThenRule: { object: { y: caller }, src: source },
      exitCancelled: { object: { on: false }, src: source, reopen: 'r' },
      layered: { low: 'l', src: source },
      reverseRank: {
        outerOn: false,
        lowOuterY: 'l',
        highOuter: named !== undefined ? `v:${named}` : 'none',
      },
    };
    if (dimension === 'resetDetached') {
      root.batch(() => {
        const y = root.find('/object/y')!;
        y.setValue(caller);
        root.find('/object/on')!.setValue(false);
        y.resetSubtree();
      });
    } else if (dimension === 'resetOverlap') {
      root.batch(() => {
        const outer = root.find('/outer')!;
        outer.setValue({ y: caller, z: 'earlyZ' });
        root.setValue(
          { outerOn: false, outer: { z: 'lateZ' } },
          WriteOption.Merge,
        );
        outer.resetSubtree();
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
  expect(sampler.shortfall()).toEqual([]);
}, 120_000);
