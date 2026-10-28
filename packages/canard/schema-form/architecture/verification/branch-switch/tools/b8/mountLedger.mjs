// CLI entry; only --smoke is untimed. Formal execution requires explicit authorization.
import assert from 'node:assert/strict';
import { spawnSync } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

import { sampleWindow } from '../../../design-optimization/tools/profile/branch-switch/sampleWindow.mjs';
import { runMountWorker } from './helpers/runMountWorker.mjs';
import { verifyMountInputs } from './helpers/verifyMountInputs.mjs';

const options = {};
for (const arg of process.argv.slice(2)) {
  if (arg === '--smoke' || arg === '--authorized') options[arg.slice(2)] = true;
  else {
    const match = /^--(root|worker|agent-pid)=(.+)$/.exec(arg);
    assert.ok(match, 'Unknown argument');
    assert.equal(options[match[1]], undefined);
    options[match[1]] = match[2];
  }
}
assert.equal(Number(process.versions.node.split('.')[0]), 26);
assert.ok(options.root);
const root = path.resolve(options.root);
const { inputs, sha256 } = verifyMountInputs(root);
if (options.worker) {
  assert.ok(inputs.lanes[options.worker]);
  if (!options.smoke)
    assert.ok(
      options.authorized && fs.existsSync(path.join(root, 'formal-start.json')),
    );
  console.log(
    JSON.stringify(
      await runMountWorker(root, options.worker, inputs.config, options.smoke),
    ),
  );
} else {
  assert.ok(
    !fs.existsSync(path.join(root, 'formal-start.json')),
    'Never repeat or smoke a started formal window',
  );
  const here = fileURLToPath(import.meta.url);
  if (options.smoke) {
    const results = [];
    for (const lane of Object.keys(inputs.lanes)) {
      const child = spawnSync(
        process.execPath,
        [here, '--root=' + root, '--worker=' + lane, '--smoke'],
        { encoding: 'utf8', env: { ...process.env, NODE_ENV: 'production' } },
      );
      fs.writeFileSync(
        path.join(root, 'smoke-' + lane + '.stderr.log'),
        child.stderr ?? '',
      );
      assert.equal(child.status, 0, child.stderr);
      const result = JSON.parse(child.stdout);
      assert.equal(result.timed, false);
      results.push(result);
    }
    fs.writeFileSync(
      path.join(root, 'mount-smoke.json'),
      JSON.stringify({ inputsSha256: sha256, results }, null, 2) + '\n',
    );
    console.log('B8_MOUNT_SMOKE_OK');
  } else {
    assert.equal(
      options.authorized,
      true,
      'Coordinator authorizes the final quiet window',
    );
    assert.match(
      options['agent-pid'] ?? '',
      /^[1-9]\d*$/,
      'Explicit runner-agent PID for CPU exclusion',
    );
    const smoke = JSON.parse(
      fs.readFileSync(path.join(root, 'mount-smoke.json')),
    );
    assert.equal(
      smoke.inputsSha256,
      sha256,
      'Smoke the exact immutable inputs first',
    );
    assert.deepEqual(
      smoke.results.map((result) => result.lane),
      Object.keys(inputs.lanes),
    );
    const records = [];
    try {
      for (let repeat = 0; repeat < inputs.config.runs; repeat++) {
        const lanes = Object.keys(inputs.lanes);
        const order = [
          ...lanes.slice(repeat % lanes.length),
          ...lanes.slice(0, repeat % lanes.length),
        ];
        for (const lane of order) {
          const quiet = await sampleWindow();
          quiet.excludedAgentPid = Number(options['agent-pid']);
          quiet.heavy = quiet.rows.filter(
            (row) => row.pid !== quiet.excludedAgentPid && row.cpuPercent > 30,
          );
          fs.writeFileSync(
            path.join(root, `quiet-${repeat}-${lane}.json`),
            JSON.stringify(quiet, null, 2) + '\n',
          );
          assert.equal(
            quiet.heavy.length,
            0,
            'Per-process CPU exceeds 30%; preserve window without retry',
          );
          if (repeat === 0 && records.length === 0)
            fs.writeFileSync(
              path.join(root, 'formal-start.json'),
              JSON.stringify({
                startedAt: new Date().toISOString(),
                inputsSha256: sha256,
                agentPid: quiet.excludedAgentPid,
              }) + '\n',
              { flag: 'wx' },
            );
          const child = spawnSync(
            process.execPath,
            [here, '--root=' + root, '--worker=' + lane, '--authorized'],
            {
              encoding: 'utf8',
              maxBuffer: 64 * 1024 * 1024,
              env: { ...process.env, NODE_ENV: 'production' },
            },
          );
          fs.writeFileSync(
            path.join(root, `mount-${repeat}-${lane}.stdout.json`),
            child.stdout ?? '',
          );
          fs.writeFileSync(
            path.join(root, `mount-${repeat}-${lane}.stderr.log`),
            child.stderr ?? '',
          );
          assert.equal(
            child.status,
            0,
            'Worker failed; preserve window without retry: ' + child.stderr,
          );
          const result = JSON.parse(child.stdout);
          result.repeat = repeat;
          records.push(result);
          console.log('B8_MOUNT_PROCESS_OK ' + repeat + ' ' + lane);
        }
      }
      fs.writeFileSync(
        path.join(root, 'mount-results.json'),
        JSON.stringify({ inputsSha256: sha256, completed: true, records }) +
          '\n',
        { flag: 'wx' },
      );
      console.log('B8_MOUNT_WINDOW_OK');
    } catch (error) {
      fs.writeFileSync(
        path.join(root, 'mount-failure.json'),
        JSON.stringify(
          {
            message: error.message,
            completedProcesses: records.length,
            formalStarted: fs.existsSync(path.join(root, 'formal-start.json')),
          },
          null,
          2,
        ) + '\n',
      );
      throw error;
    }
  }
}
