// Invoked by Node CLI; compares a saved workspace bundle (--before=...) with current dist.
// Default leaf rows retain one unrelated latent entry. Defaults: 20 warmups, 100 samples, 3 processes.
// --only=latent-count-1,latent-count-100,latent-count-1000,latent-count-4000 selects fixed leaf250 with A/B/A-prime calibration.
import assert from 'node:assert/strict';
import { spawnSync } from 'node:child_process';
import { createHash } from 'node:crypto';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { performance } from 'node:perf_hooks';
import { setTimeout } from 'node:timers/promises';
import { fileURLToPath, pathToFileURL } from 'node:url';

import { buildFixture } from './fixtures.mjs';
import { materialize } from './helpers/materialize.mjs';
import { readConfig } from './helpers/readConfig.mjs';

assert.equal(process.env.NODE_ENV, 'production');
assert.equal(Number(process.versions.node.split('.')[0]), 26);
const argv = process.argv.slice(2);
const beforeFlags = argv.filter((arg) => arg.startsWith('--before='));
assert.ok(beforeFlags.length <= 1, 'Duplicate --before');
const config = readConfig(
  argv.filter((arg) => !arg.startsWith('--before=')),
  new URL('./', import.meta.url),
);
const leafRows = [250, 1000, 4000, 8000].map((n) => ({
  id: `latent-leaf-${n}`,
  n,
  m: 1,
  axis: 'leaf-count',
}));
const countRows = [1, 100, 1000, 4000].map((m) => ({
  id: `latent-count-${m}`,
  n: 250,
  m,
  axis: 'latent-count',
}));
const rows = [...leafRows, ...countRows];
assert.ok(
  !config.only ||
    config.only.every(
      (id, i) =>
        rows.some((row) => row.id === id) && config.only.indexOf(id) === i,
    ),
);
const chosen = config.only
  ? rows.filter((row) => config.only.includes(row.id))
  : leafRows;
const calibrated = chosen.some((row) => row.axis === 'latent-count');
const hash = (bytes) => createHash('sha256').update(bytes).digest('hex');

if (config.worker) {
  const row = rows.find((value) => value.id === config.worker);
  assert.ok(row, 'Unknown worker row');
  const engines = JSON.parse(
    fs.readFileSync(path.join(config.runDir, 'engines.json'), 'utf8'),
  ).engines;
  const actors = {};
  const actorNames =
    row.axis === 'latent-count'
      ? ['legacy', 'current', 'prime']
      : ['legacy', 'current'];
  const latentKey = JSON.stringify(['/dormant/leaf', 'number']);
  const latentEntries = Array.from({ length: row.m }, (_, index) => [
    index === 0
      ? latentKey
      : JSON.stringify([`/dormant/leaf_${index}`, 'number']),
    31 + index,
  ]);
  for (const actor of actorNames) {
    const module = await import(pathToFileURL(engines[actor].destination));
    const schema = buildFixture({
      shape: 'siblings',
      siblings: row.n,
      gated: false,
    });
    const root = module.buildFieldNodeTree({ jsonSchema: schema });
    module.mountFieldNode(root, undefined, undefined, {
      deferValidation: false,
    });
    materialize(root);
    assert.equal(root.children.length, row.n + 1);
    assert.equal(root.runtime.blueprint.capabilities.branchless, true);
    const leaf = root.find('/pad_7');
    assert.ok(leaf);
    // The persistent path index is updated by the store's declared mutation surface.
    for (const [key, value] of latentEntries)
      root.runtime.latentRaw.set(key, value);
    actors[actor] = {
      root,
      leaf,
      iteration: 100,
      original: JSON.stringify(schema),
      schema,
    };
  }
  const samples = Object.fromEntries(actorNames.map((actor) => [actor, []]));
  // Every adjacent pair is reversed; both A/B and A-prime/B are balanced per process.
  const completeOrders = [
    ['legacy', 'current', 'prime'],
    ['prime', 'current', 'legacy'],
    ['current', 'prime', 'legacy'],
    ['legacy', 'prime', 'current'],
    ['prime', 'legacy', 'current'],
    ['current', 'legacy', 'prime'],
  ];
  const orders = [];
  for (let i = -config.warmups; i < config.samples; i++) {
    const order =
      row.axis === 'latent-count'
        ? completeOrders[
            (i + config.warmups + config.repeat * 2) % completeOrders.length
          ]
        : (i + config.warmups + config.repeat) % 2
          ? ['current', 'legacy']
          : ['legacy', 'current'];
    if (i >= 0) orders.push(order.join(','));
    for (const actor of order) {
      const prepared = actors[actor];
      const value = ++prepared.iteration;
      await setTimeout(0);
      const start = performance.now();
      prepared.leaf.setValue(value);
      const ms = performance.now() - start;
      assert.equal(prepared.leaf.value, value);
      assert.equal(prepared.root.value.pad_7, value);
      assert.equal(prepared.root.runtime.latentRaw.size, row.m);
      assert.equal(prepared.root.runtime.latentRaw.get(latentKey), 31);
      const last = latentEntries.at(-1);
      assert.equal(prepared.root.runtime.latentRaw.get(last[0]), last[1]);
      if (i >= 0) samples[actor].push(ms);
    }
  }
  for (const actor of Object.values(actors)) {
    assert.equal(JSON.stringify(actor.schema), actor.original);
    assert.deepEqual([...actor.root.runtime.latentRaw], latentEntries);
  }
  console.log(
    JSON.stringify({
      row: row.id,
      n: row.n,
      m: row.m,
      axis: row.axis,
      repeat: config.repeat,
      pid: process.pid,
      orders,
      samples,
      minima: Object.fromEntries(
        actorNames.map((actor) => [actor, Math.min(...samples[actor])]),
      ),
    }),
  );
} else {
  assert.equal(
    beforeFlags.length,
    1,
    'Provide --before=/private/tmp/claude-501/perf-runs/.../index.node.mjs',
  );
  const before = path.resolve(beforeFlags[0].slice('--before='.length));
  assert.ok(
    before.startsWith('/private/tmp/claude-501/perf-runs/'),
    'Before bundle must be an external saved artifact',
  );
  fs.mkdirSync(config.runDir, { recursive: false });
  fs.mkdirSync(path.join(config.runDir, 'engines'));
  const engines = {};
  const bundleJobs = [
    ['legacy', before],
    ['current', path.join(config.packageDir, 'dist/index.node.mjs')],
    ...(calibrated ? [['prime', before]] : []),
  ];
  for (const [actor, source] of bundleJobs) {
    const bytes = fs.readFileSync(source);
    const text = bytes.toString('utf8');
    for (const name of ['buildFieldNodeTree', 'mountFieldNode'])
      assert.ok(
        new RegExp(`^(?:const|let|var|function) ${name}\\b`, 'm').test(text),
        `Missing ${name}`,
      );
    const destination =
      actor === 'prime'
        ? path.join(config.runDir, 'prime/engines/legacy.mjs')
        : path.join(config.runDir, 'engines', `${actor}.mjs`);
    fs.mkdirSync(path.dirname(destination), { recursive: true });
    fs.writeFileSync(
      destination,
      text + '\nexport { buildFieldNodeTree, mountFieldNode };\n',
    );
    // Resolve imports from the current package; dependency builds are shared by both saved workspace versions.
    engines[actor] = {
      source: path.join(config.packageDir, 'dist/index.node.mjs'),
      artifact: source,
      sha256: hash(bytes),
      destination,
    };
  }
  fs.writeFileSync(
    path.join(config.runDir, 'engines.json'),
    JSON.stringify({ engines }, null, 2),
  );
  if (calibrated) {
    assert.equal(engines.legacy.sha256, engines.prime.sha256);
    fs.writeFileSync(
      path.join(config.runDir, 'prime/engines.json'),
      JSON.stringify({ engines: { legacy: engines.prime } }, null, 2),
    );
  }
  const environment = {
    config,
    startedAt: new Date().toISOString(),
    node: process.version,
    cpu: os.cpus()[0]?.model,
    platform: os.platform(),
    release: os.release(),
    arch: os.arch(),
    engineRoles: {
      legacy: 'baseline-A',
      current: 'candidate-B',
      ...(calibrated ? { prime: 'baseline-A-prime' } : {}),
    },
    engines,
  };
  fs.writeFileSync(
    path.join(config.runDir, 'environment.json'),
    JSON.stringify(environment, null, 2),
  );
  const results = [];
  const repeats = Array.from({ length: config.runs }, (_, repeat) => repeat);
  const measurementJobs = chosen.every((row) => row.axis === 'latent-count')
    ? repeats.flatMap((repeat) => chosen.map((row) => ({ row, repeat })))
    : chosen.flatMap((row) => repeats.map((repeat) => ({ row, repeat })));
  for (const { row, repeat } of measurementJobs) {
    const args = [
      '--import',
      fileURLToPath(new URL('./profile/register.mjs', import.meta.url)),
      fileURLToPath(import.meta.url),
      `--worker=${row.id}`,
      `--samples=${config.samples}`,
      `--warmups=${config.warmups}`,
      `--run-dir=${config.runDir}`,
      `--repeat=${repeat}`,
    ];
    const start = new Date().toISOString();
    const child = spawnSync(process.execPath, args, {
      encoding: 'utf8',
      env: { ...process.env, NODE_ENV: 'production' },
      maxBuffer: 16 * 1024 * 1024,
    });
    const stem = path.join(config.runDir, `${row.id}-${repeat}`);
    fs.writeFileSync(stem + '.stdout', child.stdout ?? '');
    fs.writeFileSync(stem + '.stderr', child.stderr ?? '');
    fs.writeFileSync(
      stem + '.command.json',
      JSON.stringify(
        {
          executable: process.execPath,
          args,
          start,
          end: new Date().toISOString(),
          status: child.status,
        },
        null,
        2,
      ),
    );
    assert.equal(child.status, 0, child.stderr);
    results.push(JSON.parse(child.stdout));
  }
  const summary = chosen.map((row) => {
    const output = { ...row };
    for (const [actor, label] of [
      ['legacy', 'before'],
      ['current', 'current'],
      ...(row.axis === 'latent-count' ? [['prime', 'beforePrime']] : []),
    ]) {
      const minima = results
        .filter((result) => result.row === row.id)
        .map((result) => result.minima[actor])
        .sort((a, b) => a - b);
      const middle = (minima.length - 1) / 2;
      output[label] = {
        ms: (minima[Math.floor(middle)] + minima[Math.ceil(middle)]) / 2,
        widthMs: minima.at(-1) - minima[0],
        minimaMs: minima,
      };
    }
    output.deltaPercent = 100 * (output.current.ms / output.before.ms - 1);
    if (output.beforePrime) {
      const baselineMinima = [
        ...output.before.minimaMs,
        ...output.beforePrime.minimaMs,
      ];
      output.widthC = Math.max(
        Math.abs(output.before.ms - output.beforePrime.ms),
        Math.max(...baselineMinima) - Math.min(...baselineMinima),
      );
      output.deltaPrimePercent =
        100 * (output.current.ms / output.beforePrime.ms - 1);
    }
    return output;
  });
  const markdown = calibrated
    ? [
        '| row | M | A ms | A width | A-prime ms | A-prime width | B ms | B width | width(c) | B/A delta % | B/A-prime delta % |',
        '| --- | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: |',
        ...summary.map(
          (row) =>
            `| ${row.id} | ${row.m} | ${row.before.ms.toFixed(6)} | ${row.before.widthMs.toFixed(6)} | ${row.beforePrime?.ms.toFixed(6) ?? '—'} | ${row.beforePrime?.widthMs.toFixed(6) ?? '—'} | ${row.current.ms.toFixed(6)} | ${row.current.widthMs.toFixed(6)} | ${row.widthC?.toFixed(6) ?? '—'} | ${row.deltaPercent.toFixed(2)} | ${row.deltaPrimePercent?.toFixed(2) ?? '—'} |`,
        ),
      ].join('\n')
    : [
        '| row | before ms | width ms | current ms | width ms | delta % |',
        '| --- | ---: | ---: | ---: | ---: | ---: |',
        ...summary.map(
          (row) =>
            `| ${row.id} | ${row.before.ms.toFixed(6)} | ${row.before.widthMs.toFixed(6)} | ${row.current.ms.toFixed(6)} | ${row.current.widthMs.toFixed(6)} | ${row.deltaPercent.toFixed(2)} |`,
        ),
      ].join('\n');
  fs.writeFileSync(
    path.join(config.runDir, 'results.json'),
    JSON.stringify(
      {
        ...environment,
        endedAt: new Date().toISOString(),
        results,
        rows: summary,
      },
      null,
      2,
    ),
  );
  fs.writeFileSync(path.join(config.runDir, 'rows.md'), markdown + '\n');
  console.log(markdown);
  console.log(config.runDir);
}
