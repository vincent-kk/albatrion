// Invoked by Node CLI; --worker selects one fresh process containing both engine versions.
import { spawnSync } from 'node:child_process';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

import { buildRows } from './helpers/buildRows.mjs';
import { measurePair } from './helpers/measurePair.mjs';
import { prepareEngines } from './helpers/prepareEngines.mjs';
import { readConfig } from './helpers/readConfig.mjs';
import { summarize } from './helpers/summarize.mjs';

if (process.env.NODE_ENV !== 'production')
  throw new Error('Launch with NODE_ENV=production');
if (Number(process.versions.node.split('.')[0]) !== 26)
  throw new Error('Node 26 is required');
const config = readConfig(
  process.argv.slice(2),
  new URL('./', import.meta.url),
);
const allRows = buildRows(config.probes, config.branchSwitch);
if (
  config.only?.some(
    (id, i) =>
      !allRows.some((r) => r.id === id) || config.only.indexOf(id) !== i,
  )
)
  throw new Error('Unknown/duplicate --only row');
const rows = allRows.filter((r) => !config.only || config.only.includes(r.id));
if (config.worker) {
  const row = allRows.find((r) => r.id === config.worker);
  if (!row) throw new Error('Unknown worker row');
  const record = JSON.parse(
    fs.readFileSync(path.join(config.runDir, 'engines.json'), 'utf8'),
  );
  console.log(
    JSON.stringify(
      await measurePair(row, config, record.engines, config.repeat),
    ),
  );
} else {
  fs.mkdirSync(path.dirname(config.runDir), { recursive: true });
  fs.mkdirSync(config.runDir, { recursive: false });
  const sources = prepareEngines(config.packageDir, config.runDir);
  const environment = {
    runId: config.runId,
    startedAt: new Date().toISOString(),
    config,
    node: {
      version: process.version,
      executable: process.execPath,
      execArgv: process.execArgv,
    },
    machine: {
      cpu: os.cpus()[0]?.model,
      cores: os.cpus().length,
      platform: os.platform(),
      release: os.release(),
      arch: os.arch(),
      memoryBytes: os.totalmem(),
    },
    sources,
    command: process.argv,
    NODE_ENV: process.env.NODE_ENV,
    processesBefore: spawnSync('ps', ['-axo', 'pid,ppid,comm'], {
      encoding: 'utf8',
    }).stdout,
  };
  fs.writeFileSync(
    path.join(config.runDir, 'environment.json'),
    JSON.stringify(environment, null, 2),
  );
  const results = [];
  for (const row of rows)
    for (let repeat = 0; repeat < config.runs; repeat++) {
      const args = [
        '--import',
        fileURLToPath(new URL('./profile/register.mjs', import.meta.url)),
        fileURLToPath(import.meta.url),
        `--worker=${row.id}`,
        `--samples=${config.samples}`,
        `--warmups=${config.warmups}`,
        `--run-dir=${config.runDir}`,
        `--repeat=${repeat}`,
        `--probes=${config.probes}`,
        `--branch-switch=${config.branchSwitch}`,
      ];
      const start = new Date().toISOString();
      const child = spawnSync(process.execPath, args, {
        encoding: 'utf8',
        env: { ...process.env, NODE_ENV: 'production' },
        maxBuffer: 16 * 1024 * 1024,
      });
      fs.writeFileSync(
        path.join(config.runDir, `${row.id}-${repeat}.stdout`),
        child.stdout ?? '',
      );
      fs.writeFileSync(
        path.join(config.runDir, `${row.id}-${repeat}.stderr`),
        child.stderr ?? '',
      );
      fs.writeFileSync(
        path.join(config.runDir, `${row.id}-${repeat}.command.json`),
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
      if (child.error || child.status !== 0)
        throw new Error(
          `${row.id} failed: ${child.error?.message ?? child.stderr}`,
        );
      results.push(JSON.parse(child.stdout));
    }
  const summary = summarize(rows, results);
  fs.writeFileSync(
    path.join(config.runDir, 'results.json'),
    JSON.stringify(
      {
        ...environment,
        endedAt: new Date().toISOString(),
        results,
        rows: summary.rows,
      },
      null,
      2,
    ),
  );
  fs.writeFileSync(path.join(config.runDir, 'rows.md'), summary.markdown);
  console.log(summary.markdown);
  console.log(config.runDir);
}
