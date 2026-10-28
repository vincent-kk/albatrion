import assert from 'node:assert/strict';
import { spawn } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';
import { pathToFileURL } from 'node:url';

import { waitForQuietProcess } from '../../window/waitForQuietProcess.mjs';

/** Run one immutable window child at the CLI I/O edge and preserve its receipt before interpreting failure. */
export async function runWindowProcess(
  context,
  label,
  executable,
  args,
  cwd = context.repository,
  invalidAllowed = false,
) {
  const { root, agentPid, here } = context;
  if (executable !== process.execPath) {
    const beforeChild = await waitForQuietProcess({ agentPid });
    fs.writeFileSync(
      path.join(root, 'quiet-' + label + '.json'),
      JSON.stringify(beforeChild, null, 2) + '\n',
    );
    assert.equal(
      beforeChild.approved,
      true,
      'External CPU quiet before child start',
    );
  }
  const startedAt = new Date().toISOString();
  const logfile = fs.openSync(path.join(root, label + '.log'), 'w');
  const errors = fs.openSync(path.join(root, label + '.stderr.log'), 'w');
  const child = spawn(executable, args, {
    cwd,
    env: {
      ...process.env,
      NODE_ENV: 'production',
      B8_QUIET_ROOT: path.join(root, 'cpu-prechecks'),
      B8_QUIET_AGENT_PID: String(agentPid),
      NODE_OPTIONS:
        executable === process.execPath
          ? (
              (process.env.NODE_OPTIONS ?? '') +
              ' --import=' +
              pathToFileURL(path.join(here, '../b8/quietWorkerPreload.mjs'))
                .href
            ).trim()
          : process.env.NODE_OPTIONS,
    },
    stdio: ['ignore', logfile, errors],
  });
  const code = await new Promise((resolve, reject) => {
    child.on('error', reject);
    child.on('exit', resolve);
  });
  fs.closeSync(logfile);
  fs.closeSync(errors);
  fs.writeFileSync(
    path.join(root, label + '.command.json'),
    JSON.stringify(
      {
        executable,
        args,
        cwd,
        startedAt,
        endedAt: new Date().toISOString(),
        code,
      },
      null,
      2,
    ) + '\n',
  );
  console.log(label + ' EXIT ' + code);
  assert.ok(
    code === 0 || (invalidAllowed && code === 2),
    label + ' failed; preserve raw data without retry',
  );
  return code;
}
