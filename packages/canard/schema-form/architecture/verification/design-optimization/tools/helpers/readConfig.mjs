import { execFileSync } from 'node:child_process';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

/** Validate CLI options and derive the external run directory; never accept repository-local raw output. */
export function readConfig(argv, toolsURL) {
  const allowed = [
    'samples',
    'warmups',
    'runs',
    'label',
    'only',
    'run-dir',
    'worker',
    'repeat',
    'probes',
    'quiet-since',
    'branch-switch',
    'prepared',
  ];
  const values = {};
  for (const arg of argv) {
    const match = /^--([a-z-]+)=(.+)$/.exec(arg);
    if (!match || !allowed.includes(match[1]) || match[1] in values)
      throw new Error(`Invalid/duplicate argument: ${arg}`);
    values[match[1]] = match[2];
  }
  const config = {
    samples: Number(values.samples ?? 100),
    warmups: Number(values.warmups ?? 20),
    runs: Number(values.runs ?? 3),
  };
  for (const [key, value] of Object.entries(config))
    if (!Number.isInteger(value) || value < (key === 'warmups' ? 0 : 1))
      throw new Error(`Invalid ${key}`);
  if (values.probes && !['true', 'false'].includes(values.probes))
    throw new Error('Invalid probes boolean');
  if (
    values.repeat &&
    (!Number.isInteger(Number(values.repeat)) || Number(values.repeat) < 0)
  )
    throw new Error('Invalid repeat');
  const packageDir = fileURLToPath(new URL('../../../../', toolsURL));
  const repoDir = path.resolve(packageDir, '../../..');
  const commit = execFileSync('git', ['rev-parse', 'HEAD'], {
    cwd: repoDir,
    encoding: 'utf8',
  }).trim();
  const label = values.label ?? 'core';
  if (!/^[a-zA-Z0-9-]+$/.test(label)) throw new Error('Invalid label');
  const runId = `${new Date().toISOString().slice(0, 16).replace(/[-:]/g, '')}-${commit.slice(0, 7)}-${label}`;
  const runDir = path.resolve(
    values['run-dir'] ?? `{scratch}/perf-runs/${runId}`,
  );
  if (
    !/^{scratch}\/perf-runs\/\d{8}T\d{4}-[a-f0-9]{7}-[a-zA-Z0-9-]+(?:\/(?:pair|stages))?$/.test(
      runDir.replace(/\.noindex(?=\/(?:pair|stages)$|$)/, ''),
    )
  )
    throw new Error(
      'Use {scratch}/perf-runs/<YYYYMMDD>T<HHMM>-<commit7>-<label>',
    );
  const quietSince = values['quiet-since'] ?? null;
  if (
    quietSince &&
    (!Number.isFinite(Date.parse(quietSince)) ||
      Date.parse(quietSince) > Date.now())
  )
    throw new Error('Invalid quiet-since');
  if (config.samples >= 100 && !quietSince && !values.worker)
    throw new Error('Formal runs require --quiet-since=<past ISO timestamp>');
  return {
    ...config,
    packageDir,
    repoDir,
    commit,
    runDir,
    runId: path.basename(runDir),
    only: values.only?.split(','),
    probes: values.probes === 'true',
    branchSwitch: values['branch-switch'] === 'true',
    prepared: values.prepared === 'true',
    worker: values.worker,
    repeat: Number(values.repeat ?? 0),
    quietSince,
  };
}
