// Loaded through NODE_OPTIONS --import for B8 Node children; it finishes before benchmark modules or timers start.
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';

import { waitForQuietProcess } from './helpers/waitForQuietProcess.mjs';

const root = process.env.B8_QUIET_ROOT;
assert.ok(root && path.isAbsolute(root), 'B8 external CPU evidence directory');
const quiet = await waitForQuietProcess({
  agentPid: Number(process.env.B8_QUIET_AGENT_PID),
});
fs.mkdirSync(root, { recursive: true });
fs.writeFileSync(
  path.join(root, process.pid + '.json'),
  JSON.stringify(
    {
      pid: process.pid,
      worker: process.argv.find((arg) => arg.startsWith('--worker=')),
      ...quiet,
    },
    null,
    2,
  ) + '\n',
);
assert.equal(
  quiet.approved,
  true,
  'External CPU stayed above 30% for the start-delay allowance (ordinary 120 seconds; Spotlight 600 seconds)',
);
