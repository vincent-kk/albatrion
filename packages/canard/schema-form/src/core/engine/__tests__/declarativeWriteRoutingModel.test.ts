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
 * root Merge write are drawn per seed. The rank and reset-overlap dimensions observe /outer. The
 * two repeated-exit dimensions observe a named write through a parent object and require either
 * its retained value after the second exit or its live value after a second revival. A separate
 * dimension writes the live composite and closes its gate in one rule, then observes the exit policy.
 *
 * Locally and in pre-release, seeds 1 to 3000 retain the earlier dimensions and seeds 3001 to 3360
 * cover the live whole exit. The pr tier runs 1440 stratified seeds: the
 * first 20 of each of 72 classes, dimension times exit policy times batch or Merge (each reset
 * dimension contributes 3 classes without Merge; each composite-target dimension contributes 12,
 * parent and virtual targets for each form and policy; the other dimensions contribute 6 each).
 */

type Root = ReturnType<typeof nodeFromJSONSchema>;
type Policy = 'default' | 'unsetOnInactive' | 'inactiveValue';
type Dimension =
  | 'gateRule'
  | 'callerThenRule'
  | 'exitCancelled'
  | 'exitRepeated'
  | 'exitRepeatedAndCancelled'
  | 'liveWholeExit'
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
  'exitRepeated',
  'exitRepeatedAndCancelled',
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

/** Both repeated exits test placement through a composite declarative target. */
const REPEATED_EXIT_DIMENSIONS: readonly Dimension[] = [
  'exitRepeated',
  'exitRepeatedAndCancelled',
];

/** Both composite addresses route to the same stored value. */
const COMPOSITE_DIMENSIONS: readonly Dimension[] = [
  ...REPEATED_EXIT_DIMENSIONS,
  'liveWholeExit',
];

const SEED_CLASSES = [...DIMENSIONS, 'liveWholeExit' as const].flatMap(
  (dimension) =>
    POLICIES.flatMap((policy) =>
      (RESET_DIMENSIONS.includes(dimension) ? [false] : [false, true]).flatMap(
        (isMerge) =>
          (COMPOSITE_DIMENSIONS.includes(dimension)
            ? [false, true]
            : [false]
          ).map(
            (isVirtual) => `${dimension}:${policy}:${isMerge}:${isVirtual}`,
          ),
      ),
    ),
);

const PRIMARY_SEED_COUNT = 3000;
const sampler = createSeedSampler(PRIMARY_SEED_COUNT + 360, SEED_CLASSES, 20);

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
const createSchema = (policy: Policy, isVirtual: boolean): AuthoredSchema => ({
  type: 'object',
  ...(isVirtual
    ? { options: { virtual: { roundTripGroup: { fields: ['roundTrip'] } } } }
    : {}),
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
    roundTripOn: { type: 'boolean' },
    writeRoundTrip: isVirtual
      ? rule('../roundTripGroup', (source) => [{ y: source }])
      : rule('../roundTrip', (source) => ({ y: source })),
    roundTrip: {
      type: 'object',
      controls: { active: '/roundTripOn === true' },
      properties: { y: { type: 'string', controls: policyControls(policy) } },
    },
    reopenRoundTrip: rule('../roundTripOn', () => true),
    closeRoundTripAgain: {
      type: 'string',
      controls: {
        derived:
          '/roundTrip/y === /writeRoundTrip && /roundTrip/y != null ? "closed" : /closeRoundTripAgain',
        injectTo: (value: unknown) =>
          value === 'closed' ? { '../roundTripOn': false } : {},
      },
    },
    reopenRoundTripAgain: {
      type: 'string',
      controls: {
        derived:
          '/reopenTwice === true && /closeRoundTripAgain === "closed" && /roundTripOn === false ? "open" : /reopenRoundTripAgain',
        injectTo: (value: unknown) =>
          value === 'open' ? { '../roundTripOn': true } : {},
      },
    },
    reopenTwice: { type: 'boolean' },
    writeAndCloseRoundTrip: {
      type: 'string',
      controls: {
        injectTo: (source: unknown) =>
          typeof source === 'string' && source
            ? {
                '../roundTripOn': false,
                ...(isVirtual
                  ? { '../roundTripGroup': [{ y: source }] }
                  : { '../roundTrip': { y: source } }),
              }
            : {},
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
  readonly closedAgain?: string;
  readonly reopenedAgain?: string;
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
  // The first exit is cancelled. The recorded name wins over the second exit's policy,
  // or remains live if that exit is cancelled too.
  if (dimension === 'exitRepeated')
    return { retained: caller, closedAgain: 'closed', reopenedAgain: '' };
  if (dimension === 'exitRepeatedAndCancelled')
    return { live: caller, closedAgain: 'closed', reopenedAgain: 'open' };
  // The lower winner omits the live y it makes leave; that exit keeps y's committed value, as the
  // lower winner's own single call does, so the policy applies to y0.
  if (dimension === 'liveWholeExit') return exit(policy, caller);
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

const observe = (root: Root, dimension: Dimension): Expected => {
  const address = COMPOSITE_DIMENSIONS.includes(dimension)
    ? '/roundTrip/y'
    : '/object/y';
  const live = root.find(address);
  const retained = root.inactiveValues.find(({ path }) => path === address);
  const outer = root.inactiveValues
    .filter(({ path }) => path.startsWith('/outer/'))
    .map(({ path, value }) => [path, String(value)]);
  return {
    ...(live ? { live: String(live.value) } : {}),
    ...(retained ? { retained: String(retained.value) } : {}),
    ...(outer.length ? { outer: Object.fromEntries(outer) } : {}),
    ...(REPEATED_EXIT_DIMENSIONS.includes(dimension)
      ? {
          closedAgain: String(root.find('/closeRoundTripAgain')?.value ?? ''),
          reopenedAgain: String(
            root.find('/reopenRoundTripAgain')?.value ?? '',
          ),
        }
      : {}),
  };
};

it(`places each declarative value where the routing model says for ${sampler.label}`, () => {
  for (let seed = 1; sampler.has(seed); seed++) {
    let state = seed;
    const random = (limit: number) => {
      state = (Math.imul(state, 1664525) + 1013904223) >>> 0;
      return (state >>> 8) % limit;
    };
    const dimension =
      seed <= PRIMARY_SEED_COUNT
        ? DIMENSIONS[random(DIMENSIONS.length)]
        : 'liveWholeExit';
    const policy = POLICIES[random(POLICIES.length)];
    const isMerge = !RESET_DIMENSIONS.includes(dimension) && random(2) === 1;
    const isVirtual =
      COMPOSITE_DIMENSIONS.includes(dimension) && random(2) === 1;
    if (!sampler.accept(`${dimension}:${policy}:${isMerge}:${isVirtual}`))
      continue;
    const named = random(3) === 0 ? undefined : `v${seed}`;
    const caller = `c${seed}`;
    const source = named !== undefined ? `y:${named}` : `x:${seed}`;
    const on = dimension !== 'callerThenRule';
    const root = nodeFromJSONSchema({
      jsonSchema: createSchema(policy, isVirtual),
      defaultValue: {
        object: { on, x: 'x0', y: 'y0' },
        outerOn: true,
        outer: { y: 'oy', z: 'oz' },
        roundTripOn: true,
        roundTrip: { y: 'initial' },
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
      exitRepeated: {
        roundTripOn: false,
        writeRoundTrip: caller,
        reopenRoundTrip: 'r',
      },
      exitRepeatedAndCancelled: {
        roundTripOn: false,
        writeRoundTrip: caller,
        reopenRoundTrip: 'r',
        reopenTwice: true,
      },
      liveWholeExit: { writeAndCloseRoundTrip: caller },
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
      observe(root, dimension),
      `seed=${seed} ${dimension} ${policy} merge=${isMerge} virtual=${isVirtual} named=${named}`,
    ).toEqual(model(dimension, policy, named, caller));
  }
  expect(sampler.shortfall()).toEqual([]);
}, 120_000);
