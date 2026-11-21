import { isDeepStrictEqual } from 'node:util';
import { expect, it } from 'vitest';

import { nodeFromJSONSchema } from '@/schema-form/__tests__/fixtures/nodeFromJSONSchema';

import { ValidationMode } from '../types/state';
import { WriteOption } from '../types/value';
import { hasSameOrderedKeys } from './fixtures/hasSameOrderedKeys';
import { reviewCallerSchema } from './fixtures/reviewCallerSchema';
import { reviewCallerWrites } from './fixtures/reviewCallerWrites';

const ACTIVITIES = ['live', 'inactive1', 'inactive2', 'retained'] as const;
const ANCESTORS = [
  ['object', { a: 'a0', b: 'b0', inner: { n: 'n0' } }],
  ['null', null],
  ['scalar', 17],
  ['absent', undefined],
] as const;
const ARITIES = [1, 2] as const;
const LENGTHS = [2, 3, 4] as const;
const OTHER = ['/other', true] as const;
const IS_PR = process.env.SCHEMA_FORM_TEST_PROFILE === 'pr';

type Write = ReturnType<typeof reviewCallerWrites>[number];

it('matches sequential caller histories across write pairs, activity and ancestor states', () => {
  const reachedLengths = new Set<number>();
  const reachedTargets = new Set<string>();
  const reachedActivities = new Set<string>();
  const reachedAncestors = new Set<string>();
  const reachedOrders = new Set<string>();
  const reachedOperations = new Set<number>();
  let histories = 0;
  for (const activity of ACTIVITIES)
    for (const [ancestorName, ancestor] of ANCESTORS)
      for (const arity of ARITIES) {
        const schema = reviewCallerSchema(activity, arity);
        const operations = reviewCallerWrites(arity);
        for (let first = 0; first < operations.length; first++)
          for (let second = 0; second < operations.length; second++) {
            // Keep both orders of each selected pair in PR and every history locally.
            if (
              IS_PR &&
              ![0, 8, 18, 19].includes(first) &&
              ![0, 8, 18, 19].includes(second) &&
              !(
                (first === 15 && second === 16) ||
                (first === 16 && second === 15)
              )
            )
              continue;
            for (const length of LENGTHS) {
              const sequence: Write[] = [operations[first], operations[second]];
              const position = (first + second) % 3;
              if (length >= 3) sequence.splice(position, 0, OTHER);
              if (length === 4)
                sequence.push(
                  operations[(first * 7 + second * 3) % operations.length],
                );
              const run = (batched: boolean) => {
                const root = nodeFromJSONSchema({
                  jsonSchema: schema,
                  defaultValue: {
                    open: activity === 'live' || activity === 'retained',
                    other: false,
                    x: 'x0',
                    arr: ['i'],
                    ...(ancestorName !== 'absent' && { o: ancestor }),
                  },
                  validationMode: ValidationMode.None,
                  disableAutomaticWrites: true,
                });
                if (activity === 'retained')
                  root
                    .find('/open')!
                    .setValue(false, WriteOption.EnableAutomaticWrites);
                if (first === 0 && second === 0 && length === 2) {
                  const host = root.find('/o');
                  expect(Boolean(host)).toBe(
                    activity === 'live' || activity === 'inactive2',
                  );
                  if (activity === 'inactive2')
                    expect(root.find('/o/inner')).toBeNull();
                  expect(root.find('/g')?.value).toHaveLength(arity);
                  if (
                    host &&
                    (ancestorName === 'null' || ancestorName === 'scalar')
                  )
                    expect(host.outputValue).toBe(ancestor);
                }
                if (activity === 'retained' && ancestorName === 'object')
                  expect(root.inactiveValues.length).toBeGreaterThan(0);
                const calls = () => {
                  for (const [
                    path,
                    value,
                    option = WriteOption.Overwrite,
                  ] of sequence) {
                    const target = path ? root.find(path) : root;
                    if (!target) continue;
                    target.setValue(
                      value,
                      option | WriteOption.DisableAutomaticWrites,
                    );
                    reachedTargets.add(path);
                  }
                };
                if (batched) root.batch(calls);
                else calls();
                return {
                  value: root.value,
                  retained: root.inactiveValues
                    .slice()
                    .sort((a, b) => a.path.localeCompare(b.path)),
                };
              };
              const expected = run(false);
              const actual = run(true);
              if (!isDeepStrictEqual(actual, expected))
                expect(
                  actual,
                  `${activity}/${ancestorName}/${arity}: operations ${first}, ${second}, length ${length}`,
                ).toEqual(expected);
              if (!hasSameOrderedKeys(actual, expected))
                expect(
                  hasSameOrderedKeys(actual, expected),
                  `key order: ${activity}/${ancestorName}/${arity}: ${first},${second},${length}`,
                ).toBe(true);
              reachedActivities.add(activity);
              reachedAncestors.add(ancestorName);
              reachedLengths.add(sequence.length);
              reachedOperations.add(first);
              reachedOperations.add(second);
              reachedOrders.add(`${first}:${second}`);
              histories++;
            }
          }
      }
  expect(reachedTargets).toEqual(
    new Set([
      '',
      '/x',
      '/other',
      '/o',
      '/o/a',
      '/o/inner/n',
      '/arr',
      '/arr/0',
      '/g',
    ]),
  );
  expect(reachedActivities).toEqual(
    new Set(['live', 'inactive1', 'inactive2', 'retained']),
  );
  expect(reachedAncestors).toEqual(
    new Set(['object', 'null', 'scalar', 'absent']),
  );
  expect(reachedLengths).toEqual(new Set([2, 3, 4]));
  expect(reachedOperations.size).toBe(20);
  expect(reachedOrders.size).toBe(IS_PR ? 146 : 400);
  expect(histories).toBe(IS_PR ? 14_016 : 38_400);
}, 300_000);

it('compares updater and undefined writes after retaining or publishing a descendant', () => {
  const kinds = [
    'identity',
    'emptyUpdater',
    'undefinedUpdater',
    'explicitUndefined',
  ] as const;
  const targets = ['', '/o', '/o/a', '/arr', '/arr/0', '/g'] as const;
  let histories = 0;
  for (const active of [false, true])
    for (const target of targets)
      for (const kind of kinds)
        for (const length of LENGTHS)
          for (const position of [0, 1, 2]) {
            const identity = kind === 'identity';
            const empty =
              target === '/g'
                ? [undefined, undefined]
                : target === '/arr'
                  ? []
                  : target === '' || target === '/o'
                    ? {}
                    : '';
            const run = (mode: 'sequential' | 'batch' | 'nested') => {
              const seen: unknown[] = [];
              const writes: Write[] = [
                [
                  '',
                  { o: { held: 'retained', a: 'prior' } },
                  WriteOption.Merge,
                ],
                [
                  target,
                  kind === 'explicitUndefined'
                    ? undefined
                    : (value: unknown) => {
                        seen.push(value);
                        return identity
                          ? value
                          : kind === 'emptyUpdater'
                            ? empty
                            : undefined;
                      },
                ],
              ];
              if (length >= 3) writes.splice(position, 0, OTHER);
              if (length === 4)
                writes.push(['', { o: { a: 'last' } }, WriteOption.Merge]);
              const root = nodeFromJSONSchema({
                jsonSchema: {
                  type: 'object',
                  properties: {
                    x: { type: 'string' },
                    other: { type: 'boolean' },
                    o: {
                      type: 'object',
                      properties: {
                        a: { type: 'string' },
                        held: { type: 'string', controls: { active } },
                      },
                    },
                    arr: { type: 'array', items: { type: 'string' } },
                  },
                  options: { virtual: { g: { fields: ['x', 'o'] } } },
                },
                defaultValue: {
                  x: 'x',
                  other: false,
                  o: { a: 'a' },
                  arr: ['v'],
                },
                validationMode: ValidationMode.None,
                disableAutomaticWrites: true,
              });
              const calls = () => {
                for (const [
                  index,
                  [path, input, option = WriteOption.Overwrite],
                ] of writes.entries()) {
                  const node = path ? root.find(path) : root;
                  const write = () =>
                    node!.setValue(
                      input,
                      option | WriteOption.DisableAutomaticWrites,
                    );
                  if (mode === 'nested' && index === 1) root.batch(write);
                  else write();
                }
              };
              if (mode === 'sequential') calls();
              else root.batch(calls);
              return { seen, value: root.value, retained: root.inactiveValues };
            };
            const expected = run('sequential');
            for (const mode of ['batch', 'nested'] as const) {
              const actual = run(mode);
              if (!isDeepStrictEqual(actual, expected))
                expect(
                  actual,
                  `${active}/${target}/${kind}/${length}/${position}/${mode}`,
                ).toEqual(expected);
              if (!hasSameOrderedKeys(actual, expected))
                expect(
                  hasSameOrderedKeys(actual, expected),
                  `key order: ${active}/${target}/${kind}/${length}/${position}/${mode}`,
                ).toBe(true);
            }
            histories++;
          }
  expect(histories).toBe(432);
});

it('compares both write orders and replacement boundaries for branch, terminal, array and extra values', () => {
  const inputs = [
    {
      branch: { a: 'first', b: 'keep' },
      opaque: { a: 'first', b: 'discard' },
      array: ['first', 'discard'],
      extra: { a: 'first', b: 'discard' },
    },
    {
      branch: { a: undefined },
      opaque: { a: 'second' },
      array: ['second'],
      extra: { a: 'second' },
    },
  ] as const;
  for (const reverse of [false, true])
    for (const option of [WriteOption.Merge, WriteOption.Overwrite] as const) {
      const run = (batched: boolean) => {
        const root = nodeFromJSONSchema({
          jsonSchema: {
            type: 'object',
            properties: {
              o: {
                type: 'object',
                properties: {
                  branch: {
                    type: 'object',
                    properties: {
                      a: { type: 'string' },
                      b: { type: 'string' },
                    },
                  },
                  opaque: { type: 'object', options: { terminal: true } },
                  array: { type: 'array', items: { type: 'string' } },
                },
              },
            },
          },
          validationMode: ValidationMode.None,
          disableAutomaticWrites: true,
        });
        let seen: unknown;
        const calls = () => {
          const target = root.find('/o')!;
          const direct = () => target.setValue(inputs[0], option);
          const containing = () =>
            root.setValue({ o: inputs[1] }, WriteOption.Merge);
          if (reverse) {
            containing();
            direct();
          } else {
            direct();
            containing();
          }
          target.setValue((value: unknown) => {
            seen = value;
            return value;
          });
        };
        if (batched) root.batch(calls);
        else calls();
        return { seen, value: root.value, retained: root.inactiveValues };
      };
      expect(run(true)).toEqual(run(false));
    }
});
