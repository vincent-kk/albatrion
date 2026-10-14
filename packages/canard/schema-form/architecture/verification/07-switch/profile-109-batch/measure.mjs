// Sequential CLI adapter; profile-104-owned owns the production verdict clock.
import assert from 'node:assert/strict';
import { spawnSync } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const script = fileURLToPath(import.meta.url);
const directory = path.dirname(script);
const repo = path.resolve(directory, '../../../../../../..');
const HEAD = '35af3faecd473598d439638806db9d3f39e88a29';
const [command, phase, ...args] = process.argv.slice(2);
const phases = ['AA', '1-c1-empty-memo', '2-f1-scalar-entry', '3-s1-empty-scratch',
  '4-r1-single-path', '5-q1-stable-compute'];
assert(phases.includes(phase));
const started = Date.now();

/** Emit bounded artifacts for the host's native file writer; this process writes no files. */
function artifact(file, text) {
  assert(Buffer.byteLength(text) <= 5_000_000, file);
  console.log('NATIVE_ARTIFACT ' + JSON.stringify({ file, text }));
}

if (command === 'row') {
  const [name, mode] = args;
  for (let run = 1; run <= 9; run++) {
    assert(Date.now() - started < 360000, 'Split rows below eight minutes');
    const begin = Date.now();
    const worker = spawnSync(process.execPath,
      ['--expose-gc', script, 'pair', phase, name, mode, String(run)], {
        cwd: repo, encoding: 'utf8', maxBuffer: 5_000_000,
        env: { ...process.env, NODE_ENV: 'production', GIT_OPTIONAL_LOCKS: '0' },
      });
    assert.equal(worker.signal, null);
    assert.equal(worker.status, 0, worker.stderr || worker.stdout);
    assert(Date.now() - begin < 480000);
    console.log(worker.stdout.trim());
    console.log(`PROGRESS ${phase} ${name}/${mode} ${run}/9 natural`);
  }
  artifact(path.join(directory, `${phase}-driver-${name}-${mode}.json`),
    JSON.stringify({ phase, name, mode, status: 0, signal: null, natural: true,
      started, ended: Date.now(), elapsedMs: Date.now() - started }, null, 2) + '\n');
} else if (command === 'snapshot') {
  const files = {};
  for (const argument of args) {
    const created = argument.startsWith('--new=');
    const file = created ? argument.slice(6) : argument;
    assert(file.startsWith('packages/canard/schema-form/'));
    files[file] = created ? null : fs.readFileSync(path.join(repo, file), 'utf8');
  }
  artifact(path.join(directory, phase + '-base.json'), JSON.stringify({ phase, HEAD, files }, null, 2) + '\n');
} else {
  assert(['build', 'pair'].includes(command));
  let source = fs.readFileSync(path.resolve(directory, '../profile-104-owned/measure.mjs'), 'utf8');
  source = source.slice(0, source.indexOf("else if (command === 'count')"));
  const replacements = [
    ["const HEAD = 'baf4cacb647ad3de7dbff7c232efddf55b0bc546';", `const HEAD = '${HEAD}';`],
    ['owned104-', `batch109-${phase}-`],
    ['fileURLToPath(import.meta.url)', JSON.stringify(script)],
    ["const [command, ...args] = process.argv.slice(2);",
      `const command = ${JSON.stringify(command)}; const args = ${JSON.stringify(command === 'pair'
        ? ['forced', ...args, phase === 'AA' ? 'control' : 'working'] : args)};`],
    ["const content = version === 'head' || version === 'control' ? git(['show', `${HEAD}:${relative}`]) : fs.readFileSync(file, 'utf8');",
      phase === 'AA' ? "const content = git(['show', `${HEAD}:${relative}`]);"
        : "const content = fs.readFileSync(file, 'utf8');"],
    ["fs.writeFileSync(path.join(directory, name + '.json'), text);",
      `console.log('NATIVE_ARTIFACT ' + JSON.stringify({ file: path.join(directory, ${JSON.stringify(phase + '-')} + name + '.json'), text }));`],
    ['for (const output of result.outputFiles) fs.writeFileSync(output.path, output.contents);',
      "for (const output of result.outputFiles) console.log('NATIVE_ARTIFACT ' + JSON.stringify({ file: output.path, text: output.text }));"],
    ['bundleSha256: hash(fs.readFileSync(bundle(version, development)))',
      'bundleSha256: hash(result.outputFiles.find(output => output.path === bundle(version, development)).contents)'],
    ['bytes: fs.statSync(bundle(version, development)).size',
      'bytes: result.outputFiles.find(output => output.path === bundle(version, development)).contents.length'],
  ];
  for (const [before, after] of replacements) {
    assert(source.includes(before), before);
    source = source.split(before).join(after);
  }
  await import('data:text/javascript;base64,' + Buffer.from(source).toString('base64'));
}
assert(Date.now() - started < 480000);
