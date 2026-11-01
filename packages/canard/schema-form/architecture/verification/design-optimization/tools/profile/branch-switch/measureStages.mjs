import path from 'node:path';
import { performance } from 'node:perf_hooks';
import { pathToFileURL } from 'node:url';

import { collectProfiles } from './collectProfiles.mjs';
import { createRecorder } from './createRecorder.mjs';
import { setupWrite } from './setupWrite.mjs';

/** Alternate wrapped/unwrapped single writes; profile passes remain outside the retained timing samples. */
export async function measureStages(row, config) {
  const recorder = createRecorder();
  globalThis.__b0 = recorder;
  const operations = {};
  for (const mode of ['unwrapped', 'wrapped'])
    operations[mode] = await setupWrite(
      row,
      await import(
        pathToFileURL(path.join(config.runDir, 'scratch', `${mode}.mjs`))
      ),
    );
  const samples = { wrapped: [], unwrapped: [] };
  const stages = [];
  const phaseStages = [];
  for (let i = -config.warmups; i < config.samples; i++) {
    const order =
      (i + config.warmups + config.repeat) % 2
        ? ['wrapped', 'unwrapped']
        : ['unwrapped', 'wrapped'];
    for (const mode of order) {
      recorder.reset();
      recorder.enabled = mode === 'wrapped';
      const start = performance.now();
      operations[mode].write();
      const totalUs = (performance.now() - start) * 1000;
      recorder.enabled = false;
      operations[mode].checkWrite();
      if (i >= 0) {
        samples[mode].push(totalUs);
        if (mode === 'wrapped') {
          const self = Object.values(recorder.metrics).reduce(
            (sum, m) => sum + m.selfUs,
            0,
          );
          stages.push({
            ...structuredClone(recorder.metrics),
            everythingElse: {
              selfUs: totalUs - self,
              inclusiveUs: totalUs - self,
              calls: 1,
            },
          });
          phaseStages.push({
            ...structuredClone(recorder.phaseMetrics),
            'everythingElse/unwrappedEntry': {
              selfUs: totalUs - self,
              inclusiveUs: totalUs - self,
              calls: 1,
            },
          });
        }
      }
    }
  }
  const profiles = await collectProfiles(
    operations.wrapped,
    config,
    row,
    recorder,
  );
  return {
    row: row.id,
    repeat: config.repeat,
    pid: process.pid,
    samples,
    stages,
    phaseStages,
    ...profiles,
  };
}
