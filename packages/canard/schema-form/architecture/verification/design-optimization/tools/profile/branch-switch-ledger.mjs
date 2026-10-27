// Invoked by Node CLI; only scratch bundles are instrumented and NODE_ENV is fixed before dynamic imports.
process.env.NODE_ENV = 'production';
const { spawnSync } = await import('node:child_process');
const fs = await import('node:fs');
const path = await import('node:path');
const os = await import('node:os');
const { fileURLToPath } = await import('node:url');
const { readConfig } = await import('../helpers/readConfig.mjs');
const { buildBranchRows } = await import('../helpers/buildBranchRows.mjs');
const { buildBundle } = await import('./branch-switch/buildBundle.mjs');
const { measureStages } = await import('./branch-switch/measureStages.mjs');
if (Number(process.versions.node.split('.')[0]) !== 26)
  throw new Error('Node 26 required');
const config = readConfig(
  process.argv.slice(2),
  new URL('../', import.meta.url),
);
const allRows = buildBranchRows().filter((row) =>
  [
    'switch-siblings-0',
    'switch-oneOf-80',
    'switch-if-80',
    'switch-discriminator-80',
    'switch-nested-oneOf-20',
    'switch-payload-12',
  ].includes(row.id),
);
if (config.worker) {
  const row = allRows.find((r) => r.id === config.worker);
  if (!row) throw new Error('Unknown stage worker');
  console.log(JSON.stringify(await measureStages(row, config)));
} else {
  if (!config.prepared) {
    fs.mkdirSync(config.runDir, { recursive: false });
    await buildBundle(config.packageDir, config.runDir);
  } else if (
    !fs.existsSync(path.join(config.runDir, 'scratch/instrumentation.json'))
  )
    throw new Error('Prepared bundle manifest missing');
  const environment = {
    config,
    node: process.version,
    machine: os.cpus()[0].model,
    startedAt: new Date().toISOString(),
    NODE_ENV: process.env.NODE_ENV,
  };
  fs.writeFileSync(
    path.join(config.runDir, 'environment.json'),
    JSON.stringify(environment, null, 2),
  );
  const results = [];
  for (const row of allRows.filter(
    (r) => !config.only || config.only.includes(r.id),
  )) {
    for (let repeat = 0; repeat < config.runs; repeat++) {
      const args = [
        fileURLToPath(import.meta.url),
        `--worker=${row.id}`,
        `--run-dir=${config.runDir}`,
        `--repeat=${repeat}`,
        `--samples=${config.samples}`,
        `--warmups=${config.warmups}`,
      ];
      const startedAt = new Date().toISOString();
      const child = spawnSync(process.execPath, args, {
        encoding: 'utf8',
        env: { ...process.env, NODE_ENV: 'production' },
        maxBuffer: 32 * 1024 * 1024,
      });
      const prefix = path.join(config.runDir, `${row.id}-${repeat}`);
      fs.writeFileSync(`${prefix}.stdout`, child.stdout ?? '');
      fs.writeFileSync(`${prefix}.stderr`, child.stderr ?? '');
      fs.writeFileSync(
        `${prefix}.command.json`,
        JSON.stringify(
          {
            args,
            startedAt,
            endedAt: new Date().toISOString(),
            status: child.status,
          },
          null,
          2,
        ),
      );
      if (child.status !== 0) throw new Error(`${row.id}: ${child.stderr}`);
      results.push(JSON.parse(child.stdout));
    }
  }
  fs.writeFileSync(
    path.join(config.runDir, 'results.json'),
    JSON.stringify(
      { ...environment, endedAt: new Date().toISOString(), results },
      null,
      2,
    ),
  );
  console.log(`STAGE_LEDGER_OK processes=${results.length} ${config.runDir}`);
}
