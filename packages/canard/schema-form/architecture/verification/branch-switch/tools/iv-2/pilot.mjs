// Coordinator authorization covers this short window; it is separate from formal evidence.
import assert from 'node:assert/strict';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

import { json, read } from '../b9-0/files.mjs';
import { median } from '../b9-1/helpers/median.mjs';
import { runWindowProcess } from '../b9-1/helpers/runWindowProcess.mjs';
import { observeMeasurementCpu } from '../iv-4/helpers/observeMeasurement.mjs';
import { waitForQuietProcess } from '../window/waitForQuietProcess.mjs';
import { verifyInputs } from './verifyInputs.mjs';

const root = path.resolve(process.argv[2]);
assert.equal(process.argv[3], '--authorized');
const agentPid = Number(process.argv[4]);
assert.ok(Number.isInteger(agentPid) && agentPid > 0);
verifyInputs(root);
const here = path.dirname(fileURLToPath(import.meta.url));
const repository = path.resolve(here, '../../../../../../../..');
const iv4OwnerStart = process.argv.includes('--iv4-owner-start');
const context = {
  root,
  agentPid,
  here,
  repository,
  continuousCpu: iv4OwnerStart,
  observeCpu: iv4OwnerStart ? observeMeasurementCpu : undefined,
  quietPreload: iv4OwnerStart
    ? path.join(here, '../iv-4/quietWorkerPreload.mjs')
    : undefined,
};
if (iv4OwnerStart) {
  const quiet = await waitForQuietProcess({
    agentPid,
    averageMs: 30000,
    spotlightMaxWaitMs: 30000,
  });
  json(path.join(root, 'quiet-pilot.json'), quiet);
  assert.equal(quiet.approved, true, 'IV-4 pilot start observation');
}
const pilotRoot = path.join(root, 'pilot.noindex');
await runWindowProcess(context, 'pilot-prepare', process.execPath, [
  path.join(here, '../b9-1/pilot.mjs'),
  pilotRoot,
  '--prepare',
  path.join(root, 'bundles/B/index.node.mjs'),
]);
await runWindowProcess(context, 'pilot', process.execPath, [
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
json(path.join(root, 'pilot-summary.json'), {
  formal: false,
  processes: 22,
  ratios,
  expectedRange: [1.2, 1.4],
  currentInExpectedRange: ratios.current >= 1.2 && ratios.current <= 1.4,
});
verifyInputs(root);
console.log('IV_2_PILOT_OK ' + JSON.stringify(ratios));
