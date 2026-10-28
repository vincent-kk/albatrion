import assert from 'node:assert/strict';

import {
  allNodes,
  drain,
  encode,
} from '../../../perf-optimization/first-batch/c-d/c-common.mjs';

/**
 * Observe new B12 contracts which the stage head cannot author yet.
 * @param {object} M Candidate bundle with the delivery runner's test-only exports.
 * @returns {Promise<object[]>} Six asserted scenes with exit and re-entry deliveries.
 */
export async function runInactiveValueScenes(M) {
  const rows = [];
  for (const kind of [
    'literal',
    'function',
    'listener',
    'both',
    'ancestor-descendant',
    'clear-warning',
  ]) {
    const diagnostics = [],
      events = [],
      calls = [];
    const resolve = (value, context) => {
      assert.equal(value, 'before');
      assert.equal(context.rootValue.open, true);
      calls.push(kind);
      return 'resolved';
    };
    const nested = kind === 'ancestor-descendant';
    const controls = {
      active: '../open',
      ...(kind === 'literal' ? { inactiveValue: 'literal ../open' } : {}),
      ...(['function', 'both'].includes(kind)
        ? { inactiveValue: resolve }
        : {}),
      ...(kind === 'clear-warning'
        ? { inactiveValue: 'ignored', unsetOnInactive: true }
        : {}),
      ...(nested ? { inactiveValue: { value: 'ancestor', extra: 1 } } : {}),
    };
    const schema = {
      type: 'object',
      properties: {
        open: { type: 'boolean' },
        value: nested
          ? {
              type: 'object',
              controls,
              properties: {
                value: {
                  type: 'string',
                  controls: { inactiveValue: 'descendant' },
                },
              },
            }
          : { type: 'string', controls },
      },
    };
    const root = M.fieldNodeFactory(
      M.blueprint(schema, { collect: (record) => diagnostics.push(record) }),
      {
        diagnostics: { status: 'stable' },
        misfitPaths: new M.PathKeyedSet(),
      },
    );
    M.mountFieldNode(
      root,
      { open: true, value: nested ? { value: 'before' } : 'before' },
      M.SetValueOption.Overwrite,
    );
    for (const node of allNodes(root))
      node.subscribe((event) =>
        events.push({ path: node.path, event: encode(event) }),
      );
    if (kind === 'listener' || kind === 'both')
      root.find('/value').onInactive(resolve);
    const phases = [];
    const observe = (phase) =>
      phases.push({
        phase,
        value: encode(root.value),
        inactiveValues: encode(root.inactiveValues),
        events: structuredClone(events),
      });
    observe('before');
    root.find('/open').setValue(false);
    await drain();
    observe('exit-after-drain');
    if (kind === 'clear-warning') {
      assert.deepEqual(root.inactiveValues, []);
      assert.equal(
        diagnostics.filter(
          (record) =>
            record.code === M.FormWarningCode.InactiveValueWithUnsetOnInactive,
        ).length,
        1,
      );
    } else if (!nested) {
      assert.deepEqual(root.inactiveValues, [
        {
          path: '/value',
          value: kind === 'literal' ? 'literal ../open' : 'resolved',
        },
      ]);
    }
    root.find('/open').setValue(true);
    await drain();
    observe('reentry-after-drain');
    assert.deepEqual(
      root.find('/value').value,
      nested
        ? { value: 'descendant', extra: 1 }
        : kind === 'clear-warning'
          ? undefined
          : kind === 'literal'
            ? 'literal ../open'
            : 'resolved',
    );
    if (['function', 'listener', 'both'].includes(kind))
      assert.equal(calls.length, 1);
    rows.push({
      id: 'b12-' + kind,
      stageHeadSupportsContract: false,
      phases,
      diagnostics: encode(diagnostics),
    });
  }
  return rows;
}
