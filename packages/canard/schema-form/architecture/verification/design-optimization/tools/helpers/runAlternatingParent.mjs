import assert from 'node:assert/strict';
import { spawnSync } from 'node:child_process';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

import { executeAlternatingRows } from './executeAlternatingRows.mjs';
import { prepareEngines } from './prepareEngines.mjs';
import { summarizeAlternating } from './summarizeAlternating.mjs';

/** Copy immutable local A/B bundles and record the exact execution environment. */
function prepare(config) {
  fs.mkdirSync(config.runDir, { recursive: false });
  const engines = {};
  for (const [lane, source] of [
    ['A', config['baseline-bundle']],
    ['B', config['candidate-bundle']],
  ]) {
    const target = path.join(config.runDir, lane);
    fs.mkdirSync(target);
    engines[lane] = prepareEngines(config.packageDir, target, '0.16.1', source);
  }
  assert.equal(
    engines.A.engines.legacy.sha256,
    engines.B.engines.legacy.sha256,
    'Quality needs identical legacy bytes',
  );
  const environment = {
    startedAt: new Date().toISOString(),
    config,
    engines,
    node: { version: process.version, executable: process.execPath },
    machine: {
      cpu: os.cpus()[0].model,
      arch: os.arch(),
      release: os.release(),
    },
    NODE_ENV: process.env.NODE_ENV,
    command: process.argv,
    processOrder: 'A0 B0 A1 B1 ...',
    baselineHalves: 'A=first half, Aprime=last half, B=all',
    test073: 'all adjacent pairs primary; first and last halves also reported',
  };
  fs.writeFileSync(
    path.join(config.runDir, 'environment.json'),
    JSON.stringify(environment, null, 2),
  );
  return environment;
}

/** Execute one existing paired measurement in a fresh role-bound process. */
function measure(config, row, lane, repeat) {
  const args = [
    '--import',
    fileURLToPath(new URL('../profile/register.mjs', import.meta.url)),
    fileURLToPath(new URL('../alternate.mjs', import.meta.url)),
    `--worker=${row.id}`,
    `--lane=${lane}`,
    `--samples=${config.samples}`,
    `--warmups=${config.warmups}`,
    `--runs=${config.runs}`,
    `--quality=${config.quality ?? 'branchless'}`,
    `--repeat=${repeat}`,
    `--run-dir=${config.runDir}`,
    ...(config.shortWindow ? ['--short-window=true'] : []),
  ];
  const start = new Date().toISOString();
  const child = spawnSync(process.execPath, args, {
    encoding: 'utf8',
    env: { ...process.env, NODE_ENV: 'production' },
    maxBuffer: 16 * 1024 * 1024,
  });
  const prefix = path.join(config.runDir, `${row.id}-${lane}-${repeat}`);
  fs.writeFileSync(`${prefix}.stdout`, child.stdout ?? '');
  fs.writeFileSync(`${prefix}.stderr`, child.stderr ?? '');
  fs.writeFileSync(
    `${prefix}.command.json`,
    JSON.stringify(
      {
        executable: process.execPath,
        args,
        start,
        end: new Date().toISOString(),
        status: child.status,
        signal: child.signal,
      },
      null,
      2,
    ),
  );
  assert.equal(child.status, 0, `${row.id}/${lane}: ${child.stderr}`);
  const result = JSON.parse(child.stdout);
  assert.equal(result.row, row.id);
  assert.equal(result.repeat, repeat);
  assert.equal(result.samples.current.length, config.samples);
  assert.ok(result.samples.current.every((v) => Number.isFinite(v) && v > 0));
  assert.equal(result.minima.current, Math.min(...result.samples.current));
  if (!row.currentOnly) {
    assert.equal(result.samples.legacy.length, config.samples);
    assert.ok(result.samples.legacy.every((v) => Number.isFinite(v) && v > 0));
    assert.equal(result.minima.legacy, Math.min(...result.samples.legacy));
  }
  return result;
}

/** Preserve completed rows, including an invalid control window, without dropping raw data. */
function save(config, environment, results, rows, completed) {
  const summary = summarizeAlternating(rows, results, config.quality);
  if (config.quality === 'legacy' && !completed) {
    summary.quality.pending = true;
    summary.quality.passed = null;
  }
  const validWindow = !config.formal || summary.quality?.passed === true;
  const report = {
    ...environment,
    endedAt: new Date().toISOString(),
    results,
    ...summary,
    completed,
    validWindow,
  };
  if (summary.quality?.pending) report.validWindow = null;
  fs.writeFileSync(
    path.join(config.runDir, 'results.json'),
    JSON.stringify(report, null, 2),
  );
  fs.writeFileSync(
    path.join(config.runDir, 'quality.json'),
    JSON.stringify(summary.quality, null, 2),
  );
  return report;
}

/** Interleave by row and apply the selected quality boundary. */
export function runAlternatingParent(config, rows) {
  if (config.formal && config.quality !== 'legacy')
    assert.equal(
      rows[0].id,
      'single-flat-1000',
      'Formal window needs the control first',
    );
  if (config.formal && config.quality === 'legacy')
    assert.ok(
      rows.some((row) => !row.currentOnly),
      'Legacy quality needs a paired row',
    );
  const environment = prepare(config);
  const code = executeAlternatingRows(
    config,
    rows,
    (row, lane, repeat) => measure(config, row, lane, repeat),
    (results, completed, finished) => {
      const report = save(config, environment, results, completed, finished);
      console.log(
        `ALTERNATING_ROW_OK ${completed.at(-1).id} processes=${config.runs * 2}`,
      );
      if (config.formal && report.quality?.passed === false)
        console.log(`ALTERNATING_WINDOW_INVALID ratio=${report.quality.ratio}`);
      return report;
    },
  );
  if (code) return code;
  console.log(`ALTERNATING_DEVICE_OK ${config.runDir}`);
  return 0;
}
