// Invoked by Node CLI; compares a saved workspace bundle (--before=...) with current dist.
// Plain leaf fixtures retain one unrelated latent entry. Defaults: 20 warmups, 100 samples, 3 processes.
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
const rows = [250, 1000, 4000, 8000].map((n) => ({
  id: `latent-leaf-${n}`,
  n,
}));
assert.ok(
  !config.only ||
    config.only.every(
      (id, i) =>
        rows.some((row) => row.id === id) && config.only.indexOf(id) === i,
    ),
);
const chosen = rows.filter(
  (row) => !config.only || config.only.includes(row.id),
);
const hash = (bytes) => createHash('sha256').update(bytes).digest('hex');

if (config.worker) {
  const row = rows.find((value) => value.id === config.worker);
  assert.ok(row, 'Unknown worker row');
  const engines = JSON.parse(
    fs.readFileSync(path.join(config.runDir, 'engines.json'), 'utf8'),
  ).engines;
  const actors = {};
  const latentKey = JSON.stringify(['/dormant/leaf', 'number']);
  for (const actor of ['legacy', 'current']) {
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
    root.runtime.latentRaw.set(latentKey, 31);
    actors[actor] = {
      root,
      leaf,
      iteration: 100,
      original: JSON.stringify(schema),
      schema,
    };
  }
  const samples = { legacy: [], current: [] };
  const orders = [];
  for (let i = -config.warmups; i < config.samples; i++) {
    const order =
      (i + config.warmups + config.repeat) % 2
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
      assert.equal(prepared.root.runtime.latentRaw.size, 1);
      assert.equal(prepared.root.runtime.latentRaw.get(latentKey), 31);
      if (i >= 0) samples[actor].push(ms);
    }
  }
  for (const actor of Object.values(actors))
    assert.equal(JSON.stringify(actor.schema), actor.original);
  console.log(
    JSON.stringify({
      row: row.id,
      n: row.n,
      repeat: config.repeat,
      pid: process.pid,
      orders,
      samples,
      minima: {
        legacy: Math.min(...samples.legacy),
        current: Math.min(...samples.current),
      },
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
  for (const [actor, source] of [
    ['legacy', before],
    ['current', path.join(config.packageDir, 'dist/index.node.mjs')],
  ]) {
    const bytes = fs.readFileSync(source);
    const text = bytes.toString('utf8');
    for (const name of ['buildFieldNodeTree', 'mountFieldNode'])
      assert.ok(
        new RegExp(`^(?:const|let|var|function) ${name}\\b`, 'm').test(text),
        `Missing ${name}`,
      );
    const destination = path.join(config.runDir, 'engines', `${actor}.mjs`);
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
  const environment = {
    config,
    startedAt: new Date().toISOString(),
    node: process.version,
    cpu: os.cpus()[0]?.model,
    platform: os.platform(),
    release: os.release(),
    arch: os.arch(),
    engineRoles: { legacy: 'before-workspace', current: 'after-workspace' },
    engines,
  };
  fs.writeFileSync(
    path.join(config.runDir, 'environment.json'),
    JSON.stringify(environment, null, 2),
  );
  const results = [];
  for (const row of chosen)
    for (let repeat = 0; repeat < config.runs; repeat++) {
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
    return output;
  });
  const markdown = [
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
