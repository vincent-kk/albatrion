import { expect, it } from 'vitest';

import { nodeFromJSONSchema } from '@/schema-form/__tests__/fixtures/nodeFromJSONSchema';

import { isArrayNode } from '../../surface';
import type { AuthoredSchema } from '../types/jsonSchema';
import { ValidationMode } from '../types/state';
import { WriteOption } from '../types/value';

/*
 * Differential generator for settle DETAIL WRITE-079: random batches of caller and declarative
 * writes run once in sequence and once inside one batch, and must leave the same value and retained
 * sources. It is a bounded oracle: both runs share the product code, so the pinned cases in
 * batchTwoLayerContract.test.ts carry explicit expected values.
 *
 * Filters (a drawn call is rejected, never reordered), each the condition under which no rule
 * observes an intermediate state of a mark segment:
 * - a caller write, or a gate write that changes the gate, overlapping a target triggered earlier in the segment;
 * - a second trigger of the same rule in the segment, or an overlapping rule triggered against its rank;
 * - an updater or same-tuple write after an overlapping mark of its segment (EVENT-061);
 * - a reset once any segment changed the list twice, or after a list mark its scope discards (WRITE-095);
 * - under an unsetOnInactive or inactiveValue exit policy, a second change of /yOn in the segment, whose
 *   intermediate exit the sequence applies the policy to and the batch never makes.
 * Array structure verbs and resets end a segment (EVENT-013) and are never filtered otherwise.
 * Merge calls count their actual leaf addresses.
 *
 * The exit policy of object.y and box is drawn per seed, and sourceL names leaving nodes by their own
 * paths: a leaving leaf under a live parent, a leaf under the leaving box and the latent box.pair group.
 *
 * Not reached here, covered elsewhere or by table tests: array item update, root and form reset,
 * rule chains, a repeated source and its per-segment firing, kind-rank competition on one target,
 * derive budget rollback, nested and single-call batches, a caller write to an inactive or latent
 * group, and state, validation and event observation.
 */

type Root = ReturnType<typeof nodeFromJSONSchema>;

/** One public call, replayed on the sequential root and inside one batch on the batched root. */
type Call = {
  readonly label: string;
  readonly run: (root: Root) => void;
  /** Storage addresses a caller write replaces, merges into or reloads. */
  readonly writes: readonly string[];
  /** Storage addresses the declarative rule this call triggers writes. */
  readonly triggers: readonly string[];
  /** The written path, or the source name, that identifies the rule a trigger fires. */
  readonly rule: string;
  /** A gate write and its value, which changes the gated shape only when it differs from the current gate. */
  readonly gate?: readonly [path: string, value: boolean];
};

/** Calls that end a mark segment (write DETAIL EVENT-013): array structure verbs and subtree resets. */
const BARRIER_RULES: readonly string[] = ['push', 'remove', 'insert', 'clear', 'pop', 'reset'];

/** Leaf addresses a Merge writes: declared branch keys recurse, arrays and terminals are replaced whole. */
const mergeLeaves = (base: string, value: unknown): string[] => {
  if (value === null || typeof value !== 'object' || Array.isArray(value)) return [base];
  const names = Object.keys(value);
  if (names.length === 0) return [base];
  return names.flatMap((name) =>
    name === 'nested' ? mergeLeaves(`${base}/${name}`, Reflect.get(value, name)) : [`${base}/${name}`],
  );
};

/** A source string carries one declarative value: the call prefix keeps every write a change. */
const encode = (label: string, value: unknown) =>
  `${label}|${JSON.stringify(value, (_, slot: unknown) => (slot === undefined ? null : slot))}`;

const decode = (target: string, value: unknown) => {
  if (typeof value !== 'string') return {};
  const decoded: unknown = JSON.parse(value.slice(value.indexOf('|') + 1));
  return {
    [target]: Array.isArray(decoded)
      ? decoded.map((slot: unknown) => slot ?? undefined)
      : decoded,
  };
};

/** sourceL names its targets by relative path: tuple slots carry null for undefined through JSON. */
const decodeEntries = (value: unknown) => {
  if (typeof value !== 'string') return {};
  const decoded: unknown = JSON.parse(value.slice(value.indexOf('|') + 1));
  if (decoded === null || typeof decoded !== 'object') return {};
  return Object.fromEntries(
    Object.entries(decoded).map(([target, slot]: [string, unknown]) => [
      target,
      Array.isArray(slot)
        ? slot.map((item: unknown) => item ?? undefined)
        : slot,
    ]),
  );
};

/** Exit policies of object.y and box, drawn per seed; inactiveValue resolves a fixed value. */
const POLICIES = ['default', 'unsetOnInactive', 'inactiveValue'] as const;
type Policy = (typeof POLICIES)[number];

const exitPolicy = (policy: Policy, resolved: string | object) =>
  policy === 'unsetOnInactive'
    ? { unsetOnInactive: true }
    : policy === 'inactiveValue'
      ? { inactiveValue: resolved }
      : {};

/**
 * Application order of each rule inside one settlement (derive-rank): every rule here is an injectTo
 * except the derived mirror, which overlaps none of them, so the source's document position decides.
 */
const RULE_ORDER: Readonly<Record<string, number>> = {
  sourceA: 0,
  sourceB: 1,
  sourceG: 2,
  sourceL: 3,
  '/template': 4,
};

/** Rules of calls whose argument is computed from a read of the target at call time. */
const READING_RULES: readonly string[] = ['updater', 'identity', 'changing', 'same'];

const overlaps = (left: string, right: string) =>
  left === right ||
  left.startsWith(`${right}/`) ||
  right.startsWith(`${left}/`);

const createSchema = (grouped: boolean, policy: Policy): AuthoredSchema => ({
  type: 'object',
  properties: {
    yOn: { type: 'boolean' },
    zOn: { type: 'boolean' },
    other: { type: 'boolean' },
    w: { type: 'string' },
    object: {
      type: 'object',
      properties: {
        x: { type: 'string' },
        y: {
          type: 'string',
          controls: {
            active: '/yOn === true',
            ...exitPolicy(policy, 'resolved'),
          },
        },
        nested: {
          type: 'object',
          properties: {
            p: { type: 'string' },
            q: { type: 'string', controls: { active: '/zOn === true' } },
          },
        },
        list: { type: 'array', items: { type: 'string' } },
      },
    },
    box: {
      type: 'object',
      controls: {
        active: '/yOn === true',
        ...exitPolicy(policy, { k: 'resolved', m: 'resolved' }),
      },
      properties: { k: { type: 'string' }, m: { type: 'string' } },
      options: { virtual: { pair: { fields: ['k', 'm'] } } },
    },
    template: { type: 'object', options: { terminal: true } },
    mirror: {
      type: 'object',
      properties: {
        x: { type: 'string' },
        y: { type: 'string', controls: { active: '/yOn === true' } },
      },
      controls: { derived: '../template' },
    },
    sourceA: {
      type: 'string',
      controls: { injectTo: (value: unknown) => decode('../object', value) },
    },
    sourceB: {
      type: 'string',
      controls: {
        injectTo: (value: unknown) => decode('../object/nested', value),
      },
    },
    sourceG: {
      type: 'string',
      controls: {
        injectTo: (value: unknown) =>
          grouped ? decode('../group', value) : {},
      },
    },
    sourceL: {
      type: 'string',
      controls: { injectTo: decodeEntries },
    },
  },
  ...(grouped
    ? { options: { virtual: { group: { fields: ['object', 'w'] } } } }
    : {}),
});

const readRetained = (root: Root) =>
  Object.fromEntries(root.inactiveValues.map(({ path, value }) => [path, value]));

/**
 * Seeds per run: the complete range locally and in the pre-release tier; the pr tier's `test:pr`
 * script sets SCHEMA_FORM_TEST_TIER=pr and runs a bounded prefix to stay inside its job time.
 */
const SEEDS = process.env.SCHEMA_FORM_TEST_TIER === 'pr' ? 7000 : 10000;

it(`a batch of declarative and caller writes leaves the state of the same calls in sequence for ${SEEDS} seeds`, () => {
  for (let seed = 1; seed <= SEEDS; seed++) {
    let randomState = seed;
    const random = (limit: number) => {
      randomState = (Math.imul(randomState, 1664525) + 1013904223) >>> 0;
      return (randomState >>> 8) % limit;
    };
    const grouped = random(2) === 1;
    const policy = POLICIES[random(POLICIES.length)];
    const randomNested = (label: string) => {
      const nested: Record<string, string> = {};
      if (random(2)) nested.p = `${label}p`;
      if (random(2)) nested.q = `${label}q`;
      return nested;
    };
    const randomObject = (label: string, deep: boolean) => {
      const object: Record<string, unknown> = {};
      if (random(3)) object.x = `${label}x`;
      if (random(2)) object.y = `${label}y`;
      if (deep && random(2)) object.nested = randomNested(label);
      if (deep && random(3) === 0)
        object.list = Array.from(
          { length: random(3) },
          (_, item) => `${label}l${item}`,
        );
      return object;
    };
    const draw = (label: string): Call => {
      const operation = random(grouped ? 29 : 23);
      const call = (
        description: string,
        run: (root: Root) => void,
        writes: readonly string[] = [],
        triggers: readonly string[] = [],
      ): Call => ({
        label: description,
        run,
        writes,
        triggers,
        rule: description.split(' ')[description.startsWith('set ') ? 1 : 0],
      });
      if (operation >= (grouped ? 27 : 21)) {
        const value: Record<string, unknown> = {};
        const triggers: string[] = [];
        const box = random(3);
        // At least one target, so a second trigger in a segment is filtered like the other sources.
        if (box === 0 || random(2)) {
          value['../object/y'] = `${label}y`;
          triggers.push('/object/y');
        }
        if (random(2)) {
          value['../object/nested/q'] = `${label}q`;
          triggers.push('/object/nested/q');
        }
        if (box === 1) {
          value['../box/k'] = `${label}k`;
          triggers.push('/box/k');
        } else if (box === 2) {
          value['../box/pair'] = [random(3) ? `${label}k` : undefined, `${label}m`];
          triggers.push('/box/k', '/box/m');
        }
        return call(
          `sourceL ${JSON.stringify(value)}`,
          (root) => root.find('/sourceL')!.setValue(encode(label, value)),
          [],
          triggers,
        );
      }
      if (operation === 0) {
        const value = random(2) === 1;
        return call(`set /other ${value}`, (root) =>
          root.find('/other')!.setValue(value),
        );
      }
      if (operation === 1 || operation === 2) {
        const value = randomObject(label, true);
        const merge = operation === 2;
        return call(
          `${merge ? 'merge' : 'set'} /object ${JSON.stringify(value)}`,
          (root) =>
            root
              .find('/object')!
              .setValue(value, merge ? WriteOption.Merge : WriteOption.Overwrite),
          merge ? mergeLeaves('/object', value) : ['/object'],
        );
      }
      if (operation === 3)
        return call(
          `updater /object x=${label}u`,
          (root) =>
            root.find('/object')!.setValue((previous: unknown) => ({
              ...(previous !== null && typeof previous === 'object'
                ? previous
                : {}),
              x: `${label}u`,
            })),
          ['/object'],
        );
      if (operation === 4)
        return call(
          `set /object/x ${label}x`,
          (root) => root.find('/object/x')!.setValue(`${label}x`),
          ['/object/x'],
        );
      if (operation === 5) {
        const value = randomNested(label);
        return call(
          `set /object/nested ${JSON.stringify(value)}`,
          (root) => root.find('/object/nested')!.setValue(value),
          ['/object/nested'],
        );
      }
      if (operation === 6) {
        const push = random(2) === 1;
        return call(
          push ? 'push /object/list' : 'remove /object/list 0',
          (root) => {
            const list = root.find('/object/list');
            if (!isArrayNode(list)) return;
            if (push) list.push(`${label}pushed`);
            else list.remove(0);
          },
          ['/object/list'],
        );
      }
      if (operation === 7)
        return call(
          'reset /object',
          (root) => root.find('/object')!.resetSubtree(),
          ['/object'],
        );
      if (operation === 8 || operation === 9) {
        const path = operation === 8 ? '/yOn' : '/zOn';
        const value = random(2) === 1;
        // A gate write that changes the gate changes the shape at the addresses it gates, so it
        // counts as a write there; writing the current gate value changes nothing.
        return {
          ...call(
            `set ${path} ${value}`,
            (root) => root.find(path)!.setValue(value),
            gates[path] === value
              ? []
              : operation === 8
                ? ['/object/y', '/mirror/y', '/box']
                : ['/object/nested/q'],
          ),
          gate: [path, value],
        };
      }
      if (operation === 10 || operation === 11) {
        const value = randomObject(label, true);
        return call(
          `sourceA ${JSON.stringify(value)}`,
          (root) => root.find('/sourceA')!.setValue(encode(label, value)),
          [],
          ['/object'],
        );
      }
      if (operation === 12) {
        const value = randomNested(label);
        return call(
          `sourceB ${JSON.stringify(value)}`,
          (root) => root.find('/sourceB')!.setValue(encode(label, value)),
          [],
          ['/object/nested'],
        );
      }
      if (operation === 13) {
        const value = randomObject(label, false);
        return call(
          `set /template ${JSON.stringify(value)}`,
          (root) => root.find('/template')!.setValue(value),
          ['/template'],
          ['/mirror'],
        );
      }
      if (operation === 14)
        return call(
          'set /object undefined',
          (root) => root.find('/object')!.setValue(undefined),
          ['/object'],
        );
      if (operation === 15) {
        const value = { x: `${label}m` };
        return call(
          `set /mirror ${JSON.stringify(value)}`,
          (root) => root.find('/mirror')!.setValue(value),
          ['/mirror'],
        );
      }
      if (operation === 16)
        return call(
          `set /w ${label}w`,
          (root) => root.find('/w')!.setValue(`${label}w`),
          ['/w'],
        );
      if (operation === 17 || operation === 18 || operation === 19) {
        const verb = operation === 17 ? 'insert' : operation === 18 ? 'clear' : 'pop';
        return call(
          `${verb} /object/list`,
          (root) => {
            const list = root.find('/object/list');
            if (!isArrayNode(list)) return;
            if (verb === 'insert') list.insert(0, `${label}inserted`);
            else if (verb === 'clear') list.clear();
            else list.pop();
          },
          ['/object/list'],
        );
      }
      if (operation === 20) {
        const value = { object: randomObject(label, true), other: true };
        return call(
          `merge / ${JSON.stringify(value)}`,
          (root) => root.setValue(value, WriteOption.Merge),
          [...mergeLeaves('/object', value.object), '/other'],
        );
      }
      if (operation === 21) {
        const value = [
          random(4) ? randomObject(label, true) : undefined,
          `${label}g`,
        ];
        return call(
          `set /group ${JSON.stringify(value)}`,
          (root) => root.find('/group')!.setValue(value),
          ['/object', '/w'],
        );
      }
      if (operation === 22) {
        const same = random(2) === 1;
        return call(
          same ? 'same tuple /group' : 'identity updater /group',
          (root) => {
            const group = root.find('/group')!;
            if (same) group.setValue(group.value);
            else group.setValue((previous: unknown) => previous);
          },
          ['/object', '/w'],
        );
      }
      if (operation === 23) {
        const value = [randomObject(label, true), `${label}m`];
        return call(
          `merge /group ${JSON.stringify(value)}`,
          (root) => root.find('/group')!.setValue(value, WriteOption.Merge),
          [...mergeLeaves('/object', value[0]), '/w'],
        );
      }
      if (operation === 24)
        return call(
          'reset /group',
          (root) => root.find('/group')!.resetSubtree(),
          ['/object', '/w'],
        );
      if (operation === 25)
        return call(
          `changing updater /group x=${label}u`,
          (root) =>
            root.find('/group')!.setValue((previous: unknown) => {
              const [object, w] = Array.isArray(previous) ? previous : [];
              return [
                {
                  ...(object !== null && typeof object === 'object'
                    ? object
                    : {}),
                  x: `${label}u`,
                },
                w,
              ];
            }),
          ['/object', '/w'],
        );
      const value = [randomObject(label, true), `${label}i`];
      return call(
        `sourceG ${JSON.stringify(value)}`,
        (root) => root.find('/sourceG')!.setValue(encode(label, value)),
        [],
        ['/object', '/w'],
      );
    };
    const defaultValue = {
      yOn: random(2) === 1,
      zOn: random(2) === 1,
      w: 'w0',
      object: {
        x: 'x0',
        y: 'y0',
        nested: { p: 'p0', q: 'q0' },
        list: ['l0'],
      },
      box: { k: 'k0', m: 'm0' },
      template: { x: 't0', y: 't0' },
    };
    const create = () =>
      nodeFromJSONSchema({
        jsonSchema: createSchema(grouped, policy),
        defaultValue,
        validationMode: ValidationMode.None,
      });
    const sequential = create(),
      batched = create();
    const history: string[] = [];
    let listChanged = false;
    const gates: Record<string, unknown> = {};
    for (let step = 0; step < 10; step++) {
      gates['/yOn'] = sequential.find('/yOn')!.value;
      gates['/zOn'] = sequential.find('/zOn')!.value;
      const calls: Call[] = [];
      let segment: Call[] = [];
      let listTouches = 0;
      const length = 2 + random(3);
      while (calls.length < length) {
        const call = draw(`s${step}c${calls.length}`);
        const isBarrier = BARRIER_RULES.includes(call.rule);
        const triggered = segment.flatMap((earlier) => earlier.triggers);
        if (
          // A barrier settles the segment before it runs, as the same call in sequence does. A reset
          // reloads the array's load source, which follows every intermediate length a sequence passes
          // through (arrangeFieldNodeItems DETAIL WRITE-095); a reset discards the marks inside its
          // scope, which hold the whole list here, so it is compared only while no segment has changed
          // the list twice and its own segment has not touched it.
          (isBarrier && call.rule === 'reset' && (listChanged || listTouches > 0)) ||
          // A changed gate that changes again returns to its segment value: the sequence exits and
          // re-enters through the exit policy, while the batch never leaves (settle DETAIL WRITE-079).
          (policy !== 'default' &&
            call.gate?.[0] === '/yOn' &&
            call.writes.length > 0 &&
            segment.some(
              (earlier) =>
                earlier.gate?.[0] === '/yOn' && earlier.writes.length > 0,
            )) ||
          // A caller write and the exit policy of an address it overlaps stay in separate segments: the
          // sequence runs the policy between them and the batch once after them, and a caller value of
          // the settlement takes precedence over the resolver (settle DETAIL WRITE-031, VALUE-043). The
          // generator covers declarative writes to leaving nodes, not this caller interplay.
          (policy !== 'default' &&
            segment.some((earlier) => {
              const [gate, other] = call.gate ? [call, earlier] : [earlier, call];
              return (
                gate.gate?.[0] === '/yOn' &&
                gate.writes.length > 0 &&
                !other.gate &&
                other.writes.some((path) =>
                  gate.writes.some((target) => overlaps(path, target)),
                )
              );
            })) ||
          (!isBarrier &&
            // The order conditions of settle DETAIL WRITE-079 within one segment: a caller write
            // precedes the trigger of a declarative target it overlaps, each source is written once,
            // and overlapping rules fire in their application order.
            (call.writes.some((path) =>
              triggered.some((target) => overlaps(path, target)),
            ) ||
              (call.triggers.length > 0 &&
                segment.some(
                  (earlier) =>
                    earlier.rule === call.rule ||
                    (RULE_ORDER[earlier.rule] > RULE_ORDER[call.rule] &&
                      earlier.triggers.some((target) =>
                        call.triggers.some((path) => overlaps(path, target)),
                      )),
                )) ||
              // An updater and a same-tuple write read the earlier calls' marks without the reactions
              // a sequence settles between them (write DETAIL EVENT-061), so they follow no
              // overlapping mark of their segment.
              (READING_RULES.includes(call.rule) &&
                segment.some((earlier) =>
                  earlier.writes.some((path) =>
                    call.writes.some((target) => overlaps(path, target)),
                  ),
                ))))
        )
          continue;
        calls.push(call);
        if (call.gate) gates[call.gate[0]] = call.gate[1];
        if (isBarrier) {
          if (listTouches > 1) listChanged = true;
          segment = [];
          listTouches = 0;
          continue;
        }
        segment.push(call);
        if (
          [...call.writes, ...call.triggers].some((path) =>
            overlaps(path, '/object/list'),
          )
        )
          listTouches++;
      }
      if (listTouches > 1) listChanged = true;
      history.push(calls.map((call) => call.label).join(' ; '));
      for (const call of calls) call.run(sequential);
      batched.batch(() => {
        for (const call of calls) call.run(batched);
      });
      const message = `seed=${seed} grouped=${grouped}\n${history.join('\n')}`;
      expect(batched.value, message).toEqual(sequential.value);
      expect(readRetained(batched), message).toEqual(readRetained(sequential));
    }
  }
}, 300_000);
