// Reproduce existing public assertions using immutable baseline and candidate bundles.
import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
import fs from 'node:fs';
import { pathToFileURL } from 'node:url';

process.env.NODE_ENV = 'production';
const results = [];
for (const [lane, file, mode] of [
  ['B4-1-off', process.argv[3], 'off'],
  ['B4-1-on', process.argv[3], 'on'],
  ['B4-2', process.argv[4], undefined],
]) {
  const M = await import(pathToFileURL(file));
  const make = (schema) =>
    M.fieldNodeFactory(M.blueprint(schema), {
      diagnostics: { status: 'stable' },
      loadSnapshot: undefined,
      ...(mode ? { slots: mode } : {}),
    });
  const root = make({
    type: 'object',
    properties: {
      flag: { type: 'boolean' },
      mode: { type: 'string' },
      g: {
        type: 'object',
        default: { value: 'D' },
        controls: { active: '../flag' },
        allOf: [
          {
            properties: {
              value: {
                type: 'string',
                controls: { active: '../../mode === "string"' },
              },
            },
          },
          {
            properties: {
              value: {
                type: 'number',
                default: 7,
                controls: { active: '../../mode === "number"' },
              },
            },
          },
        ],
      },
    },
  });
  M.mountFieldNode(root, { flag: true, mode: 'string', g: { value: 'old' } });
  root.find('/flag').setValue(false);
  root.find('/mode').setValue('number');
  root.find('/flag').setValue(true);
  const actual = root.find('/g/value').raw;
  results.push({
    lane,
    case: 'OPEN-4 other-kind source suppresses host default',
    expected: 7,
    actual,
    passed: actual === 7,
  });
  for (const reversed of [false, true]) {
    const fragments = [
      { controls: { active: '../a' }, prefixItems: [{ type: 'number' }] },
      { controls: { active: '../b' }, prefixItems: [{ type: 'string' }] },
    ];
    if (reversed) fragments.reverse();
    const r = make({
      type: 'object',
      properties: {
        open: { type: 'boolean' },
        a: { type: 'boolean' },
        b: { type: 'boolean' },
        list: {
          type: 'array',
          controls: { active: '../open' },
          allOf: fragments,
        },
      },
    });
    M.mountFieldNode(r, { open: false, a: false, b: false, list: [] });
    r.setValue({
      open: false,
      a: false,
      b: false,
      list: [7, 'tail', { extra: true }],
    });
    r.find(reversed ? '/a' : '/b').setValue(true);
    r.find('/open').setValue(true);
    const first = r.find('/list').outputValue,
      expectedFirst = [null, 'tail', { extra: true }];
    r.find(reversed ? '/a' : '/b').setValue(false);
    r.find(reversed ? '/b' : '/a').setValue(true);
    const second = r.find('/list').outputValue,
      expectedSecond = [reversed ? '7' : 7, 'tail', { extra: true }];
    results.push({
      lane,
      case: 'inactive prefixItems preserves undeclared tail',
      reversed,
      expectedFirst,
      first,
      expectedSecond,
      second,
      passed:
        JSON.stringify(first) === JSON.stringify(expectedFirst) &&
        JSON.stringify(second) === JSON.stringify(expectedSecond),
    });
  }
}
assert.equal(
  results.filter((r) => r.lane === 'B4-1-off').every((r) => r.passed),
  true,
);
assert.equal(
  results.filter((r) => r.lane === 'B4-1-on').every((r) => !r.passed),
  true,
);
assert.equal(
  results.filter((r) => r.lane === 'B4-2').every((r) => r.passed),
  true,
);
const hash = (file) =>
  createHash('sha256').update(fs.readFileSync(file)).digest('hex');
fs.writeFileSync(
  process.argv[2],
  JSON.stringify(
    {
      timedSamples: 0,
      baseline: '4c1016a021ef6fe92d5afe235f39c4a71722d4ee',
      candidateSource: 'c632ab5f5',
      baselineBundleSha256: hash(process.argv[3]),
      candidateBundleSha256: hash(process.argv[4]),
      results,
    },
    null,
    2,
  ) + '\n',
);
console.log(JSON.stringify(results, null, 2));
