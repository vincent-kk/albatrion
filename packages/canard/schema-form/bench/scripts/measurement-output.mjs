// Measurement writers share a bounded timing-only artifact and an aggregate trace summary.
import fs from 'node:fs';

export const metric = values => {
  const sorted = values.toSorted((a, b) => a - b);
  return { median: sorted[Math.ceil(sorted.length * .5) - 1] ?? 0,
    p99: sorted[Math.ceil(sorted.length * .99) - 1] ?? 0 };
};

export function summarizeMeasurement(data, sourceCommit = data.environment?.head) {
  return { environment: data.environment, sourceCommit, hooks: data.hooks,
    rows: data.rows.map(row => {
      const { samples, ...summary } = row;
      const phases = new Set(Object.keys(row.phases ?? {})), sites = new Set();
      for (const sample of samples) {
        for (const key of Object.keys(sample.phases ?? {})) phases.add(key);
        for (const key of Object.keys(sample.details ?? {})) sites.add(key);
      }
      return { ...summary, sampleCount: samples.length,
        phases: Object.fromEntries([...phases].map(key => [key, metric(samples.map(s => s.phases[key] ?? 0))])),
        phaseCalls: Object.fromEntries([...phases].map(key => [key, metric(samples.map(s => s.calls?.[key] ?? 0))])),
        sites: Object.fromEntries([...sites].map(key => [key, {
          ms: metric(samples.map(s => s.details?.[key]?.ms ?? 0)),
          calls: metric(samples.map(s => s.details?.[key]?.calls ?? 0)),
        }])),
        firstLoad: metric(samples.map(s => (s.phases?.settlement ?? 0) + (s.phases?.delivery ?? 0))),
        ajv: metric(samples.map(s => Object.entries(s.details ?? {}).reduce((sum, [key, value]) => sum + (key.startsWith('AJV:') ? value.ms : 0), 0))),
        creationSettlement: metric(samples.map(s => (s.phases?.creation ?? 0) + (s.phases?.settlement ?? 0))),
        functionCalls: Object.fromEntries(['computeNode', 'updateOutput', 'selectChildren'].map(name => [name,
          metric(samples.map(s => Object.entries(s.details ?? {}).reduce((sum, [key, value]) => sum + (key.endsWith(`:${name}`) ? value.calls : 0), 0)))])),
        nonAjvPhases: Object.fromEntries([...phases].map(phase => [phase, metric(samples.map(s =>
          (s.phases[phase] ?? 0) - Object.entries(s.details ?? {}).reduce((sum, [site, value]) => sum + (
            (phase === 'validation-registration' ? site.startsWith('AJV:compile') :
              phase === 'validation-run' && (site === 'AJV:validate' || site === 'AJV:guard')) ? value.ms : 0), 0)))])),
      };
    }) };
}

export function writeBoundedJson(destination, data) {
  const text = JSON.stringify(data) + '\n';
  if (Buffer.byteLength(text) > 5_000_000) throw new Error(`Measurement exceeds 5 MB: ${destination}`);
  fs.writeFileSync(destination, text);
}

export function writeMeasurement(destination, data) {
  const summary = summarizeMeasurement(data);
  const timings = { environment: data.environment, rows: data.rows.map(row => ({
    fixture: row.fixture, validation: row.validation, version: row.version, mode: row.mode,
    samples: row.samples.map(s => ({ elapsed: s.elapsed, active: s.active,
      synchronous: s.synchronous, profiler: s.profiler })),
  })) };
  writeBoundedJson(destination.replace(/\.json$/, '-summary.json'), summary);
  writeBoundedJson(destination, timings);
}
