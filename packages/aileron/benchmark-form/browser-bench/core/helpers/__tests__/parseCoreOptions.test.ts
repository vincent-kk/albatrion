import { expect, it } from 'vitest';

import { parseCoreOptions } from '../parseCoreOptions';

it('defaults to ten core cases, twenty runs and three warmups', () => {
  const options = parseCoreOptions([]);
  expect(options.cases).toHaveLength(10);
  expect(options.runs).toBe(20);
  expect(options.warmup).toBe(3);
});

it('accepts spaced and equals arguments including zero warmups', () => {
  expect(
    parseCoreOptions([
      '--cases',
      'rebuild-flat-500',
      '--runs=3',
      '--warmup',
      '0',
      '--baseline',
      'master',
    ]),
  ).toMatchObject({
    cases: ['rebuild-flat-500'],
    runs: 3,
    warmup: 0,
    baseline: 'master',
  });
});

it.each([
  ['--runs', '0'],
  ['--warmup', '-1'],
  ['--runs', '1.5'],
  ['--cases', 'mount-does-not-exist'],
  ['--cases', 'rebuild-flat-500,rebuild-flat-500'],
  ['--baseline', 'master', '--baseline-dir', '.'],
  ['--runs'],
  ['--unexpected', 'value'],
])('rejects invalid CLI arguments %j', (...args) => {
  expect(() => parseCoreOptions(args)).toThrow();
});
