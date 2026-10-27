import assert from 'node:assert/strict';

import { buildFixture } from '../fixtures.mjs';
import { mapLeaves } from './mapLeaves.mjs';
import { materialize } from './materialize.mjs';
import { setupBranchOperation } from './setupBranchOperation.mjs';

/** Prepare a version-specific operation and an untimed value check; all fixture work stays outside timing. */
export async function setupOperation(row, engine, mod) {
  if (row.shape === 'branch-switch')
    return setupBranchOperation(row, engine, mod);
  const schema = buildFixture(row, engine === 'legacy');
  const create =
    engine === 'legacy'
      ? async () => {
          const root = mod.legacyNodeFromJSONSchema({
            jsonSchema: schema,
            onChange() {},
          });
          for (let k = 0; k < 8; k++) await Promise.resolve();
          return materialize(root);
        }
      : () => {
          const root = mod.buildFieldNodeTree({
            jsonSchema: schema,
            onChange() {},
          });
          mod.mountFieldNode(root, undefined, undefined, {
            deferValidation: false,
          });
          return materialize(root);
        };
  let root = await create();
  const expected = structuredClone(root.value);
  if (row.shape === 'flat') assert.equal(Object.keys(expected).length, row.n);
  if (row.shape === 'nested') {
    let leafCount = 0;
    mapLeaves(expected, () => {
      leafCount++;
    });
    assert.equal(leafCount, row.n);
  }
  if (row.shape === 'oneOf')
    assert.deepEqual(Object.keys(expected).sort(), [
      'common',
      'kind',
      'payload_0_a',
      'payload_0_b',
      'payload_0_c',
    ]);
  if (row.operation === 'mount')
    return {
      run:
        engine === 'legacy'
          ? async () => {
              root = await create();
            }
          : () => {
              root = create();
            },
      check() {
        assert.deepEqual(root.value, expected);
      },
    };
  const paths =
    row.shape === 'nested'
      ? Array.from(
          { length: 10 },
          (_, i) => `${'/n0'.repeat(4)}/n${Math.floor(i / 4)}/n${i % 4}`,
        )
      : Array.from(
          { length: 10 },
          (_, i) => `/field_${String(i).padStart(3, '0')}`,
        );
  const leafPaths =
    row.operation === 'switch'
      ? [row.shape === 'oneOf' ? '/kind' : '/type']
      : row.operation === 'leaf'
        ? ['/pad_7']
        : paths;
  const leaves =
    row.operation === 'bulk'
      ? []
      : leafPaths.map((p) => {
          const leaf = root.find(p);
          assert.ok(leaf, `Missing ${p}`);
          return leaf;
        });
  const payloads = [
    mapLeaves(root.value, () => 'bulk-a'),
    mapLeaves(root.value, () => 'bulk-b'),
  ];
  let iteration = 0;
  let lastValue;
  const write = (index) => {
    if (row.operation === 'bulk') {
      lastValue = payloads[iteration % 2];
      root.setValue(lastValue);
    } else if (row.operation === 'switch') {
      lastValue =
        row.shape === 'oneOf'
          ? index === 0
            ? `kind_${row.n - 1}`
            : 'kind_0'
          : iteration % 2
            ? 'b'
            : 'a';
      leaves[0].setValue(lastValue);
    } else {
      lastValue =
        row.operation === 'leaf'
          ? iteration + 100
          : `changed-${iteration}-${index}`;
      leaves[index].setValue(lastValue);
    }
  };
  const count =
    row.operation === 'single'
      ? 10
      : row.operation === 'switch' && row.shape === 'oneOf'
        ? 2
        : 1;
  const run =
    engine === 'legacy'
      ? async () => {
          iteration++;
          for (let i = 0; i < count; i++) {
            write(i);
            if (row.operation === 'switch')
              for (let k = 0; k < 8; k++) await Promise.resolve();
          }
          for (let k = 0; k < 8; k++) await Promise.resolve();
        }
      : () => {
          iteration++;
          for (let i = 0; i < count; i++) write(i);
        };
  const check = () => {
    if (row.operation === 'bulk') assert.deepEqual(root.value, lastValue);
    else if (row.operation === 'switch') {
      if (row.shape === 'siblings') {
        assert.equal(root.value.type, lastValue);
        return;
      }
      assert.equal(root.value.kind, 'kind_0');
      assert.ok('payload_0_a' in root.value);
      assert.ok(
        !(`payload_${row.shape === 'oneOf' ? row.n - 1 : 1}_a` in root.value),
      );
    } else {
      assert.equal(leaves.at(-1).value, lastValue);
      if (row.operation === 'leaf') assert.equal(root.value.pad_7, lastValue);
    }
  };
  const preflight = async () => {
    if (row.operation !== 'switch' || row.shape !== 'oneOf') return;
    leaves[0].setValue(`kind_${row.n - 1}`);
    for (let k = 0; k < 8; k++) await Promise.resolve();
    assert.equal(root.value.kind, `kind_${row.n - 1}`);
    assert.ok(`payload_${row.n - 1}_a` in root.value);
    assert.ok(!('payload_0_a' in root.value));
    leaves[0].setValue('kind_0');
    for (let k = 0; k < 8; k++) await Promise.resolve();
  };
  return { run, check, preflight };
}
