import assert from 'node:assert/strict';
import path from 'node:path';
import { performance } from 'node:perf_hooks';
import { pathToFileURL } from 'node:url';

import { setupOperation } from '../../../../design-optimization/tools/helpers/setupOperation.mjs';
import { createMountRecorder } from './createMountRecorder.mjs';

/** A process owns one head, mode order rotates, and fixture checks remain untimed. */
export async function runMountWorker(root, lane, config, smoke = false) {
  const row = {
    id: 'mount-oneOf-80',
    operation: 'mount',
    shape: 'oneOf',
    n: 80,
  };
  const recorder = createMountRecorder(
    smoke ? null : () => performance.now(),
    smoke,
  );
  globalThis.__b8mount = recorder;
  const operations = {};
  for (const mode of ['unwrapped', 'wrapped', 'detailed']) {
    recorder.enabled = false;
    const module = await import(
      pathToFileURL(path.join(root, lane, mode + '.mjs')).href
    );
    operations[mode] = await setupOperation(row, 'current', module);
    operations[mode].run();
    operations[mode].check();
  }
  if (smoke) {
    recorder.reset();
    recorder.enabled = true;
    const token = recorder.enter('mountOperation', 'materializationAndBinding');
    operations.detailed.run();
    recorder.exit(token);
    operations.detailed.check();
    const counts = recorder.snapshot();
    assert.equal(counts.metrics.blueprint.calls, 1);
    assert.equal(counts.metrics.dispatchMount.calls, 1);
    assert.ok(counts.metrics.buildNodes.calls > 80);
    return { lane, pid: process.pid, timed: false, counts };
  }
  const samples = { wrapped: [], unwrapped: [], detailed: [] },
    ledgers = { wrapped: [], detailed: [] };
  for (
    let iteration = -config.warmups;
    iteration < config.samples;
    iteration++
  ) {
    const modes = ['unwrapped', 'wrapped', 'detailed'];
    const offset = Math.abs(iteration) % modes.length;
    const order = [...modes.slice(offset), ...modes.slice(0, offset)];
    for (const mode of order) {
      recorder.reset();
      recorder.enabled = mode !== 'unwrapped';
      const start = performance.now();
      const token =
        mode !== 'unwrapped'
          ? recorder.enter('mountOperation', 'materializationAndBinding')
          : undefined;
      operations[mode].run();
      recorder.exit(token);
      const elapsed = (performance.now() - start) * 1000;
      operations[mode].check();
      if (iteration < 0) continue;
      samples[mode].push(elapsed);
      if (mode !== 'unwrapped') {
        const ledger = recorder.snapshot();
        assert.ok(
          Math.abs(
            ledger.totalUs -
              Object.values(ledger.phases).reduce(
                (sum, value) => sum + value.selfUs,
                0,
              ),
          ) < 0.001,
        );
        assert.ok(ledger.totalUs <= elapsed + 0.001);
        ledgers[mode].push(ledger);
      }
    }
  }
  return { lane, pid: process.pid, config, samples, ledgers };
}
