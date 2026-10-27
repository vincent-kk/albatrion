// Invoked by Node 26 CLI; prepared scratch bundles keep source construction outside the quiet window.
process.env.NODE_ENV = 'production';

const assert = (await import('node:assert/strict')).default;
const { spawnSync } = await import('node:child_process');
const fs = await import('node:fs');
const path = await import('node:path');
const { performance } = await import('node:perf_hooks');
const { fileURLToPath, pathToFileURL } = await import('node:url');
const { buildBranchRows } = await import(
  '../../../design-optimization/tools/helpers/buildBranchRows.mjs'
);
const { readConfig } = await import(
  '../../../design-optimization/tools/helpers/readConfig.mjs'
);
const { collectProfiles } = await import(
  '../../../design-optimization/tools/profile/branch-switch/collectProfiles.mjs'
);
const { setupWrite } = await import(
  '../../../design-optimization/tools/profile/branch-switch/setupWrite.mjs'
);
const { stageNames, ledgerNames } = await import('./buildStages.mjs');
const { createSlotRecorder } = await import('./recorder.mjs');

assert.equal(
  Number(process.versions.node.split('.')[0]),
  26,
  'Node 26 stage runtime',
);
const passArguments = process.argv
  .slice(2)
  .filter((arg) => arg.startsWith('--pass='));
assert.ok(passArguments.length <= 1, 'One measurement pass');
const pass = passArguments[0]?.slice('--pass='.length) ?? 'ledger';
assert.ok(['ledger', 'supplemental'].includes(pass), 'Known measurement pass');
const config = readConfig(
  process.argv.slice(2).filter((arg) => !arg.startsWith('--pass=')),
  new URL('../../../design-optimization/tools/', import.meta.url),
);
const rows = buildBranchRows().filter((row) =>
  ['switch-oneOf-80', 'switch-payload-12', 'switch-siblings-0'].includes(
    row.id,
  ),
);
assert.ok(
  config.prepared,
  'Prepare immutable bundles before running the device',
);
assert.ok(
  fs.existsSync(path.join(config.runDir, 'scratch/instrumentation.json')),
  'Prepared stage manifest',
);

if (config.worker) {
  const row = rows.find((row) => row.id === config.worker);
  assert.ok(row, 'Known B4-1 stage row');
  const recorder = createSlotRecorder();
  globalThis.__b0 = recorder;
  const operations = {};
  for (const mode of ['wrapped', 'unwrapped'])
    operations[mode] = await setupWrite(
      row,
      await import(
        pathToFileURL(
          path.join(
            config.runDir,
            'scratch',
            mode === 'wrapped' && pass === 'supplemental'
              ? 'supplemental.mjs'
              : mode + '.mjs',
          ),
        )
      ),
    );
  const samples = { wrapped: [], unwrapped: [] };
  const stages = [],
    phaseStages = [],
    groups = [];
  for (let index = -config.warmups; index < config.samples; index++) {
    const order =
      (index + config.warmups + config.repeat) % 2
        ? ['wrapped', 'unwrapped']
        : ['unwrapped', 'wrapped'];
    for (const mode of order) {
      recorder.reset();
      recorder.enabled = mode === 'wrapped';
      const start = performance.now();
      operations[mode].write();
      const elapsed = (performance.now() - start) * 1000;
      recorder.enabled = false;
      operations[mode].checkWrite();
      if (index < 0) continue;
      samples[mode].push(elapsed);
      if (mode !== 'wrapped') continue;
      const self = Object.values(recorder.metrics).reduce(
        (sum, metric) => sum + metric.selfUs,
        0,
      );
      const remainder = {
        selfUs: elapsed - self,
        inclusiveUs: elapsed - self,
        calls: 1,
      };
      stages.push({
        ...structuredClone(recorder.metrics),
        everythingElse: remainder,
      });
      phaseStages.push({
        ...structuredClone(recorder.phaseMetrics),
        'everythingElse/unwrappedEntry': remainder,
      });
      groups.push(structuredClone(recorder.groups));
    }
  }
  const profile = await collectProfiles(
    operations.wrapped,
    { ...config, profileLabel: pass },
    row,
    recorder,
    pass === 'ledger' ? ledgerNames : stageNames,
    pass === 'ledger' ? 'wrapped.mjs' : 'supplemental.mjs',
  );
  console.log(
    JSON.stringify({
      row: row.id,
      pass,
      warmups: config.warmups,
      sampleCount: config.samples,
      repeat: config.repeat,
      pid: process.pid,
      node: process.version,
      samples,
      stages,
      phaseStages,
      groups,
      ...profile,
    }),
  );
} else {
  const results = [];
  const startedAt = new Date().toISOString();
  for (const row of rows.filter(
    (row) => !config.only || config.only.includes(row.id),
  ))
    for (let repeat = 0; repeat < config.runs; repeat++) {
      const args = [
        fileURLToPath(import.meta.url),
        '--pass=' + pass,
        `--worker=${row.id}`,
        '--prepared=true',
        `--run-dir=${config.runDir}`,
        `--repeat=${repeat}`,
        `--warmups=${config.warmups}`,
        `--samples=${config.samples}`,
      ];
      const child = spawnSync(process.execPath, args, {
        encoding: 'utf8',
        env: process.env,
        maxBuffer: 64 * 1024 * 1024,
      });
      const prefix = path.join(config.runDir, `${row.id}-${repeat}`);
      fs.writeFileSync(prefix + '.stdout', child.stdout ?? '');
      fs.writeFileSync(prefix + '.stderr', child.stderr ?? '');
      fs.writeFileSync(
        prefix + '.command.json',
        JSON.stringify({ args, status: child.status }, null, 2),
      );
      assert.equal(child.status, 0, `${row.id}: ${child.stderr}`);
      results.push(JSON.parse(child.stdout));
    }
  fs.writeFileSync(
    path.join(config.runDir, 'results.json'),
    JSON.stringify(
      {
        config,
        startedAt,
        endedAt: new Date().toISOString(),
        NODE_ENV: process.env.NODE_ENV,
        results,
      },
      null,
      2,
    ) + '\n',
  );
  console.log(`B4_STAGE_LEDGER_OK processes=${results.length}`);
}
