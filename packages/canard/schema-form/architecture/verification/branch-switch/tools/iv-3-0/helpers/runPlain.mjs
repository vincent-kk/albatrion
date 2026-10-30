import { spawnSync } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';

import { waitForQuietProcess } from '../../window/waitForQuietProcess.mjs';

/**
 * Persist a collector-free control in a separate worker after the shared quiet gate.
 * @param {string} root Canonical prepared diagnostic root.
 * @param {string} row Canonical fixture row to execute for 2,000 warmups and 20,000 observations.
 * @param {number} agentPid Agent excluded by the quiet policy.
 * @param {string} workerFile Absolute worker entry point to execute with this Node runtime.
 * @returns Null on success, otherwise an explicit failure requiring coordinator intervention.
 */
export async function runPlain(root, row, agentPid, workerFile) {
  const directory = path.join(root, 'raw.noindex', row + '-plain');
  fs.mkdirSync(directory);
  const quiet = await waitForQuietProcess({ agentPid });
  fs.writeFileSync(
    path.join(directory, 'quiet.json'),
    JSON.stringify(quiet, null, 2) + '\n',
  );
  if (!quiet.approved)
    return { kind: 'environment-refusal', row, interval: 0, mode: 'plain' };
  const result = spawnSync(
    process.execPath,
    [workerFile, root, row, '0', 'plain'],
    { env: { ...process.env, NODE_ENV: 'production' }, encoding: 'utf8' },
  );
  fs.writeFileSync(path.join(directory, 'worker.stderr'), result.stderr ?? '');
  return result.status === 0
    ? null
    : {
        kind: 'worker-failure',
        row,
        interval: 0,
        mode: 'plain',
        status: result.status,
      };
}
