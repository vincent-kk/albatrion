import fs from 'node:fs';
import { Session } from 'node:inspector/promises';
import path from 'node:path';

import { stageNames } from './buildBundle.mjs';

/** Collect precise function counts and sampled allocated bytes in separate untimed passes; retain raw inspector data. */
export async function collectProfiles(operation, config, row, recorder) {
  recorder.enabled = false;
  const session = new Session();
  session.connect();
  await session.post('Profiler.enable');
  await session.post('Profiler.startPreciseCoverage', {
    callCount: true,
    detailed: false,
  });
  await session.post('Profiler.takePreciseCoverage');
  for (let i = 0; i < config.samples; i++) operation.write();
  const coverage = await session.post('Profiler.takePreciseCoverage');
  await session.post('Profiler.stopPreciseCoverage');
  const calls = {};
  for (const script of coverage.result.filter((s) =>
    s.url.endsWith('/scratch/wrapped.mjs'),
  ))
    for (const fn of script.functions)
      if (stageNames.includes(fn.functionName))
        calls[fn.functionName] =
          (calls[fn.functionName] ?? 0) + fn.ranges[0].count / config.samples;
  await session.post('HeapProfiler.enable');
  await session.post('HeapProfiler.startSampling', {
    samplingInterval: 512,
    includeObjectsCollectedByMajorGC: true,
    includeObjectsCollectedByMinorGC: true,
  });
  for (let i = 0; i < config.samples; i++) operation.write();
  const allocation = await session.post('HeapProfiler.stopSampling');
  session.disconnect();
  const bytes = {};
  const stageByNode = new Map();
  const walk = (node, inherited = 'everythingElse', insideEngine = false) => {
    const active =
      insideEngine || node.callFrame.url.endsWith('/scratch/wrapped.mjs');
    const stage = stageNames.includes(node.callFrame.functionName)
      ? node.callFrame.functionName
      : inherited;
    if (active) {
      bytes[stage] = (bytes[stage] ?? 0) + node.selfSize / config.samples;
      stageByNode.set(node.id, stage);
    }
    for (const child of node.children) walk(child, stage, active);
  };
  walk(allocation.profile.head);
  const allocationSampleCounts = {};
  for (const sample of allocation.profile.samples) {
    const stage = stageByNode.get(sample.nodeId);
    if (stage)
      allocationSampleCounts[stage] = (allocationSampleCounts[stage] ?? 0) + 1;
  }
  const prefix = path.join(config.runDir, `${row.id}-${config.repeat}`);
  fs.writeFileSync(`${prefix}.coverage.json`, JSON.stringify(coverage));
  fs.writeFileSync(`${prefix}.heapprofile`, JSON.stringify(allocation));
  recorder.reset();
  recorder.diagnostic = true;
  operation.write();
  operation.checkWrite();
  recorder.diagnostic = false;
  const events = recorder.events;
  fs.writeFileSync(
    `${prefix}.gate-inputs.json`,
    JSON.stringify(events, null, 2),
  );
  return {
    calls,
    allocationBytes: bytes,
    allocationSampleCounts,
    allocationSampleCount: allocation.profile.samples.length,
    gateMismatches: events.length,
  };
}
