import { expect, it } from 'vitest';

import { nodeFromJSONSchema } from '@/schema-form/__tests__/fixtures/nodeFromJSONSchema';

import { isArrayNode } from '../../surface';
import type { AuthoredSchema } from '../types/jsonSchema';
import { ValidationMode } from '../types/state';
import { WriteOption } from '../types/value';

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

/**
 * Application order of each rule inside one settlement (derive-rank): every rule here is an injectTo
 * except the derived mirror, which overlaps none of them, so the source's document position decides.
 */
const RULE_ORDER: Readonly<Record<string, number>> = {
  sourceA: 0,
  sourceB: 1,
  sourceG: 2,
  '/template': 3,
};

/** Rules of calls whose argument is computed from a read of the target at call time. */
const READING_RULES: readonly string[] = ['updater', 'identity', 'changing', 'same'];

const overlaps = (left: string, right: string) =>
  left === right ||
  left.startsWith(`${right}/`) ||
  right.startsWith(`${left}/`);

const createSchema = (grouped: boolean): AuthoredSchema => ({
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
        y: { type: 'string', controls: { active: '/yOn === true' } },
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
  },
  ...(grouped
    ? { options: { virtual: { group: { fields: ['object', 'w'] } } } }
    : {}),
});

const readRetained = (root: Root) =>
  Object.fromEntries(root.inactiveValues.map(({ path, value }) => [path, value]));

it('a batch of declarative and caller writes leaves the state of the same calls in sequence for 2000 seeds', () => {
  for (let seed = 1; seed <= 2000; seed++) {
    let randomState = seed;
    const random = (limit: number) => {
      randomState = (Math.imul(randomState, 1664525) + 1013904223) >>> 0;
      return (randomState >>> 8) % limit;
    };
    const grouped = random(2) === 1;
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
      const operation = random(grouped ? 27 : 21);
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
          ['/object'],
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
        // A gate write changes the shape at the addresses it gates, so it counts as a write there.
        return call(
          `set ${path} ${value}`,
          (root) => root.find(path)!.setValue(value),
          operation === 8 ? ['/object/y', '/mirror/y'] : ['/object/nested/q'],
        );
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
          ['/object', '/other'],
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
          ['/object', '/w'],
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
      template: { x: 't0', y: 't0' },
    };
    const create = () =>
      nodeFromJSONSchema({
        jsonSchema: createSchema(grouped),
        defaultValue,
        validationMode: ValidationMode.None,
      });
    const sequential = create(),
      batched = create();
    const history: string[] = [];
    let listChanged = false;
    for (let step = 0; step < 10; step++) {
      const calls: Call[] = [];
      const length = 2 + random(3);
      while (calls.length < length) {
        const call = draw(`s${step}c${calls.length}`);
        // The three conditions of settle DETAIL WRITE-079 on the compared sequence: each rule fires once,
        // a caller write precedes the trigger of a declarative target it overlaps, and overlapping rules
        // fire in their application order.
        const triggered = calls.flatMap((earlier) => earlier.triggers);
        if (
          call.writes.some((path) =>
            triggered.some((target) => overlaps(path, target)),
          ) ||
          (call.triggers.length > 0 &&
            calls.some(
              (earlier) =>
                earlier.rule === call.rule ||
                (RULE_ORDER[earlier.rule] > RULE_ORDER[call.rule] &&
                  earlier.triggers.some((target) =>
                    call.triggers.some((path) => overlaps(path, target)),
                  )),
            )) ||
          // An updater and a same-tuple write read the batch's unprojected view (write DETAIL EVENT-061),
          // so the sequence they equal has no earlier overlapping mark in the batch.
          (READING_RULES.includes(call.rule) &&
            calls.some((earlier) =>
              earlier.writes.some((path) =>
                call.writes.some((target) => overlaps(path, target)),
              ),
            )) ||
          // The reset source of an array follows every intermediate length (arrangeFieldNodeItems
          // DETAIL WRITE-095), which a batch skips, so a reset is compared only while the list is unchanged.
          (call.rule === 'reset' &&
            (listChanged ||
              calls.some((earlier) =>
                earlier.writes.some((path) => overlaps(path, '/object/list')),
              )))
        )
          continue;
        calls.push(call);
      }
      history.push(calls.map((call) => call.label).join(' ; '));
      listChanged ||= calls.some((call) =>
        [...call.writes, ...call.triggers].some((path) =>
          overlaps(path, "/object/list"),
        ),
      );
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
