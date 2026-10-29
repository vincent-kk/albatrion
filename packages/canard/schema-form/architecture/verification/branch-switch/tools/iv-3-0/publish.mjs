// Publishes preserved evidence only; profiling and quiet checks never run here.
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { gzipSync } from 'node:zlib';

import { renderReport } from './helpers/renderReport.mjs';

const root = fs.realpathSync(path.resolve(process.argv[2]));
const here = path.dirname(fileURLToPath(import.meta.url));
const destination = path.resolve(here, '../../raw/iv-3-0');
assert.ok(!fs.existsSync(destination), 'Preserve published evidence');
const inputs = JSON.parse(
  fs.readFileSync(path.join(root, 'inputs.json'), 'utf8'),
);
const outcome = JSON.parse(
  fs.readFileSync(path.join(root, 'outcome.json'), 'utf8'),
);
fs.mkdirSync(destination, { recursive: true });
for (const file of [
  'inputs.json',
  'outcome.json',
  'started.json',
  'smoke.json',
  'rehearsal.json',
])
  fs.copyFileSync(path.join(root, file), path.join(destination, file));
const tables = [];
for (const name of fs.readdirSync(path.join(root, 'raw.noindex')).sort()) {
  const source = path.join(root, 'raw.noindex', name);
  const target = path.join(destination, name);
  fs.mkdirSync(target);
  for (const file of ['wall.json', 'tables.json']) {
    if (fs.existsSync(path.join(source, file)))
      fs.copyFileSync(path.join(source, file), path.join(target, file));
  }
  const quiet = JSON.parse(
    fs.readFileSync(path.join(source, 'quiet.json'), 'utf8'),
  );
  const portableQuiet = {
    approved: quiet.approved,
    policy: quiet.policy,
    waitCount: quiet.waitCount,
    waitedMs: quiet.waitedMs,
    ordinaryWaitedMs: quiet.ordinaryWaitedMs,
    attempts: quiet.attempts.map((attempt) => ({
      startedAt: attempt.startedAt,
      durationSeconds: attempt.durationSeconds,
      top10: attempt.rows.slice(0, 10).map((row) => ({
        name: path.basename(row.name),
        cpuPercent: row.cpuPercent,
      })),
    })),
  };
  fs.writeFileSync(
    path.join(target, 'quiet.json'),
    JSON.stringify(portableQuiet, null, 2) + '\n',
  );
  if (fs.existsSync(path.join(source, 'tables.json')))
    tables.push(
      JSON.parse(fs.readFileSync(path.join(source, 'tables.json'), 'utf8')),
    );
  if (fs.existsSync(path.join(source, 'cpu.cpuprofile'))) {
    const profile = fs.readFileSync(path.join(source, 'cpu.cpuprofile'));
    assert.doesNotMatch(
      profile.toString(),
      /\/Users\/|\/private\/tmp\/|file:\/\/\//,
    );
    fs.writeFileSync(path.join(target, 'cpu.cpuprofile.gz'), gzipSync(profile));
  }
}
tables.sort(
  (a, b) =>
    outcome.results.findIndex(
      (entry) => entry.row === a.row && entry.interval === a.intervalUs,
    ) -
    outcome.results.findIndex(
      (entry) => entry.row === b.row && entry.interval === b.intervalUs,
    ),
);
fs.writeFileSync(
  path.resolve(here, '../../iv-3-0-results.md'),
  renderReport(inputs, outcome, tables),
);
console.log('IV_3_0_PUBLISHED');
