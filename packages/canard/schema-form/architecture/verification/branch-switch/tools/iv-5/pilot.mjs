// Coordinator authorization covers this short window; it is separate from formal evidence.
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

import { json, read } from '../b9-0/files.mjs';
import { median } from '../b9-1/helpers/median.mjs';
import { runWindowProcess } from '../b9-1/helpers/runWindowProcess.mjs';
import { verifyInputs } from '../iv-0/verifyInputs.mjs';
import { observeMeasurementCpu } from '../iv-4/helpers/observeMeasurement.mjs';
import { waitForQuietProcess } from '../window/waitForQuietProcess.mjs';

const root = path.resolve(process.argv[2]);
assert.equal(process.argv[3], '--authorized');
const agentPid = Number(process.argv[4]);
assert.ok(Number.isInteger(agentPid) && agentPid > 0);
verifyInputs(root);
const here = path.dirname(fileURLToPath(import.meta.url));
const repository = path.resolve(here, '../../../../../../../..');
const context = {
  root,
  agentPid,
  here,
  repository,
  continuousCpu: true,
  observeCpu: observeMeasurementCpu,
  quietPreload: path.join(here, '../iv-4/quietWorkerPreload.mjs'),
};
for (let attempt = 1; ; attempt++) {
  const quiet = await waitForQuietProcess({
    agentPid,
    averageMs: 30000,
    spotlightMaxWaitMs: 30000,
  });
  const directory = path.join(root, 'pilot-start-attempts');
  fs.mkdirSync(directory, { recursive: true });
  json(path.join(directory, attempt + '.json'), { ...quiet, formalSamples: 0 });
  if (quiet.approved) break;
}
const summaries = {};
for (const role of ['A', 'B']) {
  const pilotRoot = path.join(root, 'pilot-' + role + '.noindex');
  await runWindowProcess(context, 'pilot-prepare-' + role, process.execPath, [
    path.join(here, '../b9-1/pilot.mjs'),
    pilotRoot,
    '--prepare',
    path.join(root, 'bundles', role, 'index.node.mjs'),
  ]);
  await runWindowProcess(context, 'pilot-' + role, process.execPath, [
    path.join(here, '../b9-1/pilot.mjs'),
    pilotRoot,
  ]);
  const pilot = read(path.join(pilotRoot, 'pilot.json'));
  assert.equal(pilot.processes, 22);
  const ratios = Object.fromEntries(
    ['current', 'legacy'].map((lane) => [
      lane,
      median(
        pilot.rows.flatMap((row) =>
          row.lanes[lane] ? [row.lanes[lane].ratio] : [],
        ),
      ),
    ]),
  );
  summaries[role] = {
    formal: false,
    processes: 22,
    ratios,
    expectedRange: [1.2, 1.4],
    currentInExpectedRange: ratios.current >= 1.2 && ratios.current <= 1.4,
  };
}
verifyInputs(root);
json(path.join(root, 'pilot-summary.json'), summaries);
console.log('IV_5_PILOT_OK ' + JSON.stringify(summaries));
