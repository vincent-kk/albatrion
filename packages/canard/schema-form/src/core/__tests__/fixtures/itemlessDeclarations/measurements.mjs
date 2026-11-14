// Loaded by the standalone mount runner; fixtures and endpoint checks are shared by untimed preflight and timed samples.
import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
import { performance } from 'node:perf_hooks';

const specs = [
  ['root-itemless-N1000', 'root', 'itemless', 1000, 'primary'],
  ['root-itemless-N8000', 'root', 'itemless', 8000, 'primary'],
  ['nested-itemless-N1000', 'nested', 'itemless', 1000, 'primary'],
  ['nested-itemless-N8000', 'nested', 'itemless', 8000, 'primary'],
  ['root-BN-N1000', 'root', 'BN', 1000, 'primary'],
  ['root-BN-N8000', 'root', 'BN', 8000, 'primary'],
  ['root-terminal-N1000', 'root', 'terminal', 1000, 'primary'],
  ['root-terminal-N8000', 'root', 'terminal', 8000, 'primary'],
  ['object-B0-N1000', 'root', 'object', 1000, 'primary'],
  ['reference-BN-N1000', 'reference', 'BN', 1000, 'reference'],
  ['reference-BN-N8000', 'reference', 'BN', 8000, 'reference'],
  ['reference-terminal-N1000', 'reference', 'terminal', 1000, 'reference'],
  ['reference-terminal-N8000', 'reference', 'terminal', 8000, 'reference'],
  ['reference-object-B0-N1000', 'reference', 'object', 1000, 'reference'],
];
const digest = (value) =>
  createHash('sha256')
    .update(JSON.stringify(value) ?? 'undefined')
    .digest('hex');
const drain = () =>
  new Promise((resolve) => setTimeout(() => setTimeout(resolve, 0), 0));
const flags = (node) =>
  node.__strategy__
    ? {
        expired: node.__strategy__.__expired__,
        locked: node.__strategy__.__locked__,
        composedValid: node.__strategy__.__composedValid__,
      }
    : null;
const needsWork = (value) =>
  value?.expired === true &&
  value.locked !== true &&
  value.composedValid === false;

/** Build independently owned but semantically identical inputs for the three production engines. */
function fixture(spec, legacy) {
  const [id, host, kind, n, lane] = spec;
  const schema =
    kind === 'object'
      ? { type: 'object' }
      : {
          type: 'array',
          ...(kind === 'BN' || kind === 'terminal'
            ? { items: { type: 'number' } }
            : {}),
          ...(kind === 'terminal'
            ? legacy
              ? { terminal: true }
              : { options: { terminal: true } }
            : {}),
        };
  const numbers = Array.from({ length: n }, (_, i) => i);
  const value =
    kind === 'object'
      ? Object.fromEntries(numbers.map((i) => ['k' + i, i]))
      : numbers;
  const key = host === 'reference' ? 'h' : 'list';
  return {
    id,
    host,
    kind,
    n,
    lane,
    hostPath: host === 'root' ? '' : '/' + key,
    schema:
      host === 'root'
        ? schema
        : { type: 'object', properties: { [key]: schema } },
    expected: host === 'root' ? value : { [key]: value },
    hostExpected: value,
  };
}

/** Construct through the same factory/mount calls before canonical materialization. */
function construct(engine, name, props) {
  const tree =
    name === 'legacy'
      ? engine.nodeFromJSONSchema(props)
      : engine.buildFieldNodeTree(props);
  if (name !== 'legacy') engine.mountFieldNode(tree);
  return tree;
}

/** Create a minimal callback recorder; no assertions, hashing or polling run in the timed callback. */
function argumentsFor(data) {
  const recorder = { calls: 0, value: undefined };
  const input = structuredClone(data.expected);
  return {
    input,
    recorder,
    props: {
      jsonSchema: data.schema,
      defaultValue: input,
      validationMode: 0,
      onChange: (value) => {
        recorder.calls++;
        recorder.value = value;
      },
    },
  };
}

/** Verify all public positions and input ownership after the clock, before any drain can hide work. */
function endpoint(tree, data, legacy, input) {
  const host = data.hostPath ? tree.find(data.hostPath) : tree;
  assert.ok(host);
  const children = Array.from(
    host.children ?? [],
    (child) => child?.node ?? child,
  );
  const states = [tree, host, ...children].map(flags);
  assert.ok(
    states.every((state) => !needsWork(state)),
    'Lazy work remains after canonical materialization',
  );
  assert.deepEqual(tree.value, data.expected);
  assert.deepEqual(host.value, data.hostExpected);
  assert.deepEqual(input, data.expected);
  assert.deepEqual(Object.keys(tree.value), Object.keys(data.expected));
  assert.deepEqual(Object.keys(host.value), Object.keys(data.hostExpected));
  assert.equal(host.path, data.hostPath);
  assert.equal(
    legacy ? host.group : host.strategy,
    data.kind === 'terminal' ? 'terminal' : 'branch',
  );
  assert.equal(children.length, data.kind === 'BN' ? data.n : 0);
  for (let i = 0; i < children.length; i++) {
    assert.equal(children[i].name, String(i));
    assert.equal(children[i].path, data.hostPath + '/' + i);
    assert.equal(children[i].value, data.hostExpected[i]);
  }
  return {
    rootValue: tree.value,
    hostValue: host.value,
    children: host.children,
    rootFlags: flags(tree),
    hostFlags: flags(host),
    valueHash: digest(tree.value),
    hostHash: digest(host.value),
    callerHash: digest(input),
    keysHash: digest(Object.keys(host.value)),
    callerIsSnapshot: tree.runtime?.loadSnapshot === input,
    valueIsCaller: tree.value === input,
    hostValueIsCaller: host.value === input,
  };
}

/** Classify actual completion behavior without collecting elapsed times or weakening a timed-row assertion. */
export async function runMountPreflight(engines, materialize) {
  const rows = [];
  for (const spec of specs)
    for (const name of ['base', 'candidate', 'legacy']) {
      const data = fixture(spec, name === 'legacy');
      const args = argumentsFor(data);
      let tree;
      try {
        tree = construct(engines[name], name, args.props);
      } catch (error) {
        assert.ok(
          name === 'legacy' &&
            data.kind === 'itemless' &&
            error.message.includes(
              "Array must have 'items' or 'prefixItems' defined.",
            ),
        );
        rows.push({
          id: data.id,
          lane: data.lane,
          engine: name,
          status: 'CONSTRUCTOR_UNSUPPORTED',
          reason: error.message,
        });
        continue;
      }
      const factoryReturn = {
        callbacks: args.recorder.calls,
        rootFlags: flags(tree),
        hostFlags: flags(data.hostPath ? tree.find(data.hostPath) : tree),
        publicValuesRead: false,
      };
      materialize(tree);
      const atEnd = endpoint(tree, data, name === 'legacy', args.input);
      const callbacksAtEnd = args.recorder.calls;
      await drain();
      const after = endpoint(tree, data, name === 'legacy', args.input);
      if (args.recorder.calls)
        assert.deepEqual(args.recorder.value, data.expected);
      const references = {
        rootValueSame: tree.value === atEnd.rootValue,
        hostValueSame:
          (data.hostPath ? tree.find(data.hostPath) : tree).value ===
          atEnd.hostValue,
        childrenSame:
          (data.hostPath ? tree.find(data.hostPath) : tree).children ===
          atEnd.children,
      };
      let status = 'SYNCHRONOUS_STABLE';
      if (args.recorder.calls !== callbacksAtEnd) {
        assert.ok(
          name === 'legacy' &&
            data.lane === 'primary' &&
            data.host === 'root' &&
            ['BN', 'terminal'].includes(data.kind),
        );
        assert.equal(callbacksAtEnd, 0);
        assert.equal(args.recorder.calls, 1);
        status = 'UNVERIFIED_ASYNC_ROOT';
      } else {
        assert.equal(callbacksAtEnd, name === 'legacy' ? 0 : 1);
        assert.equal(args.recorder.calls, callbacksAtEnd);
      }
      const { rootValue, hostValue, children, ...valuesAtEnd } = atEnd;
      const {
        rootValue: afterRoot,
        hostValue: afterHost,
        children: afterChildren,
        ...valuesAfterDrain
      } = after;
      rows.push({
        id: data.id,
        lane: data.lane,
        engine: name,
        status,
        factoryReturn,
        callbacksAtEnd,
        callbacksAfterDrain: args.recorder.calls,
        valuesAtEnd,
        valuesAfterDrain,
        references,
        expectedHash: digest(data.expected),
        actualSchema: data.schema,
        expectedStrategy: data.kind === 'terminal' ? 'terminal' : 'branch',
      });
    }
  const statusCounts = rows.reduce(
    (counts, row) => (
      (counts[row.status] = (counts[row.status] ?? 0) + 1),
      counts
    ),
    {},
  );
  return {
    kind: 'untimed complete fixture/engine preflight',
    rows,
    statusCounts,
    primarySceneIds: specs
      .filter((spec) => spec[4] === 'primary')
      .map((spec) => spec[0]),
    referenceSceneIds: specs
      .filter((spec) => spec[4] === 'reference')
      .map((spec) => spec[0]),
    warmups: 20,
    samples: 100,
    timedRowsPerExecution: rows.filter(
      (row) => row.status === 'SYNCHRONOUS_STABLE',
    ).length,
  };
}

/** Measure only preflight-proved synchronous rows; async root legacy completion remains explicitly unmeasured. */
export async function runMountMeasurements(engines, materialize, round) {
  const preflight = await runMountPreflight(engines, materialize);
  const ordered = round === 2 ? [...specs].reverse() : specs;
  const names =
    round === 2
      ? ['legacy', 'candidate', 'base']
      : ['base', 'candidate', 'legacy'];
  const rows = [],
    referenceRows = [],
    unmeasured = [];
  for (const spec of ordered)
    for (const name of names) {
      const eligibility = preflight.rows.find(
        (row) => row.id === spec[0] && row.engine === name,
      );
      assert.ok(eligibility);
      if (eligibility.status !== 'SYNCHRONOUS_STABLE') {
        unmeasured.push(eligibility);
        continue;
      }
      const data = fixture(spec, name === 'legacy');
      const samplesMs = [],
        observations = [];
      for (
        let sample = -preflight.warmups;
        sample < preflight.samples;
        sample++
      ) {
        const args = argumentsFor(data);
        const start = performance.now();
        const tree = construct(engines[name], name, args.props);
        materialize(tree);
        const end = performance.now();
        const atEnd = endpoint(tree, data, name === 'legacy', args.input);
        const callbacksAtEnd = args.recorder.calls;
        assert.equal(callbacksAtEnd, name === 'legacy' ? 0 : 1);
        if (args.recorder.calls)
          assert.deepEqual(args.recorder.value, data.expected);
        await drain();
        const after = endpoint(tree, data, name === 'legacy', args.input);
        assert.equal(
          args.recorder.calls,
          callbacksAtEnd,
          'Callback arrived after timed completion',
        );
        assert.equal(after.valueHash, atEnd.valueHash);
        assert.equal(after.hostHash, atEnd.hostHash);
        assert.equal(after.callerHash, atEnd.callerHash);
        assert.deepEqual(after.rootFlags, atEnd.rootFlags);
        assert.deepEqual(after.hostFlags, atEnd.hostFlags);
        if (sample >= 0) {
          samplesMs.push(end - start);
          observations.push({
            immediate: true,
            full: true,
            stable: true,
            caller: true,
            order: true,
            noLazyWorkAfterClock: true,
            callbacksAtEnd,
            callbacksAfterDrain: args.recorder.calls,
            asynchronous: false,
          });
        }
      }
      const sorted = [...samplesMs].sort((a, b) => a - b);
      const row = {
        id: data.id,
        lane: data.lane,
        runtime: process.versions.bun ? 'bun' : 'node',
        engine: name,
        round,
        warmups: preflight.warmups,
        samplesMs,
        observations,
        medianMs: (sorted[49] + sorted[50]) / 2,
        correctnessFailures: 0,
        asyncAfterEndpoint: 0,
        callbackCount: name === 'legacy' ? 0 : 1,
        drainStable: true,
      };
      (data.lane === 'primary' ? rows : referenceRows).push(row);
    }
  assert.equal(
    rows.length + referenceRows.length,
    preflight.timedRowsPerExecution,
  );
  return {
    rows,
    referenceRows,
    unmeasured,
    preflight,
    round,
    reverse: round === 2,
  };
}
