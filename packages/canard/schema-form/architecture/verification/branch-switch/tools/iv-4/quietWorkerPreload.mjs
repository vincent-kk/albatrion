// Inherited by IV-4 window descendants only after the parent passes its one start gate.
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';

import { observeMeasurementCpu } from './helpers/observeMeasurement.mjs';

const root = process.env.B8_QUIET_ROOT;
const agentPid = Number(process.env.B8_QUIET_AGENT_PID);
assert.ok(root && path.isAbsolute(root));
assert.ok(Number.isSafeInteger(agentPid) && agentPid > 0);
fs.mkdirSync(root, { recursive: true });
fs.writeFileSync(
  path.join(root, process.pid + '.json'),
  JSON.stringify({
    pid: process.pid,
    worker: process.argv.find((arg) => arg.startsWith('--worker=')),
    ...observeMeasurementCpu(agentPid),
  }) + '\n',
);
