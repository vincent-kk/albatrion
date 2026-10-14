// CLI adapter: the committed 104 verdict clock, fixtures and natural build-service exit are canonical.
import assert from 'node:assert/strict';
import { spawnSync } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const script = fileURLToPath(import.meta.url);
const directory = path.dirname(script);
const [command, ...args] = process.argv.slice(2);
const started = Date.now();
const HEAD = 'fb99a2d09012de744c3ab3e58e571d1fd8d87e4b';
const prefix = 'declaration106-';

if (command === 'row') {
  const [phase, name, mode] = args;
  assert(['AA', 'sink'].includes(phase));
  for (let run = 1; run <= 9; run++) {
    assert(Date.now() - started < 360000, 'Split before eight minutes');
    const worker = spawnSync(process.execPath,
      ['--expose-gc', script, 'pair', phase, name, mode, String(run)],
      { env: { ...process.env, NODE_ENV: 'production' }, encoding: 'utf8', maxBuffer: 5_000_000 });
    assert.equal(worker.signal, null);
    assert.equal(worker.status, 0, worker.stderr);
    console.log(worker.stdout.trim());
  }
  const evidence = { phase, name, mode, status: 0, signal: null, started,
    ended: Date.now(), elapsedMs: Date.now() - started };
  fs.writeFileSync(path.join(directory, `${prefix}driver-${phase}-${name}-${mode}.json`), JSON.stringify(evidence, null, 2) + '\n');
  console.log(JSON.stringify(evidence));
} else {
  assert(['build', 'pair', 'count-build', 'count-check'].includes(command));
  const counting = command.startsWith('count-');
  let source = fs.readFileSync(path.resolve(directory, '../profile-104-owned/measure.mjs'), 'utf8');
  const arguments_ = command === 'pair'
    ? ['forced', ...args.slice(1), args[0] === 'AA' ? 'control' : 'working']
    : command === 'count-check' ? [args[0], args[1]] : args;
  const canonicalCommand = command === 'count-build' ? 'build' : command === 'count-check' ? 'count' : command;
  const replacements = [
    ["const HEAD = 'baf4cacb647ad3de7dbff7c232efddf55b0bc546';", `const HEAD = '${HEAD}';`],
    ['owned104-', counting ? prefix + 'count-' : prefix],
    ['fileURLToPath(import.meta.url)', JSON.stringify(script)],
    ["const [command, ...args] = process.argv.slice(2);", `const command = ${JSON.stringify(canonicalCommand)}; const args = ${JSON.stringify(arguments_)};`],
    ['save(`build-${version}', `save(\`${prefix}${counting ? 'count-' : ''}build-\${version}`],
    ['save(`process-${[command, ...args].join', `save(\`${prefix}${counting ? 'count-' : ''}process-\${[command, ...args].join`],
  ];
  if (command === 'pair') replacements.push(
    ['save(`${regime}-${name}-${mode}-r${run}`', `save(\`${prefix}${args[0]}-\${regime}-\${name}-\${mode}-r\${run}\``]);
  for (const [before, after] of replacements) {
    assert(source.includes(before), before);
    source = source.split(before).join(after);
  }
  if (command === 'count-build') {
    const before = "return { contents: content, loader: file.endsWith('.tsx') ? 'tsx' : 'ts' };";
    assert(source.includes(before));
    source = source.replace(before, `return { contents: instrument(content, relative), loader: file.endsWith('.tsx') ? 'tsx' : 'ts' };`);
  }
  if (command === 'count-check') {
    source = source.replace("const engine = require(bundle(version, development));",
      "globalThis.__declarationCounts = { visits: 0, rootCalls: 0, arrays: 0, flattenPasses: 0 }; const engine = require(bundle(version, development));");
    const before = 'save(`count-${version}-${name}${development ?';
    assert(source.includes(before));
    source = source.replace(before, `evidence.declarationCounts = { ...globalThis.__declarationCounts };
      assert.equal(evidence.declarationCounts.rootCalls, nodes);
      assert.equal(evidence.declarationCounts.visits, root.runtime.blueprint.nodes.reduce((total, node) => total + node.declarations.length, 0));
      assert.equal(evidence.declarationCounts.arrays, version === 'head' ? evidence.declarationCounts.visits : 0);
      assert.equal(evidence.declarationCounts.flattenPasses, version === 'head' ? evidence.declarationCounts.visits : 0);
      save(\`${prefix}count-\${version}-\${name}\${development ?`);
  }
  // This analysis instrumentation never enters the timer bundles.
  source = `const instrument = ${instrument.toString()};\n` + source;
  await import('data:text/javascript;base64,' + Buffer.from(source).toString('base64'));
}

/** Count collector allocations and flatten passes without changing declarations or traversal. */
function instrument(content, relative) {
  if (relative.endsWith('/collectDeclarations.ts')) {
    const sink = content.includes('result: PropertyDeclaration[] = []');
    content = content.replace('if (visiting.includes(input.schemaPath))', 'globalThis.__declarationCounts.visits++;\n  if (visiting.includes(input.schemaPath))');
    if (sink) content = content.replace('result: PropertyDeclaration[] = []', 'result: PropertyDeclaration[] = (globalThis.__declarationCounts.arrays++, [])');
    else {
      content = content.replace('return [];', 'return (globalThis.__declarationCounts.arrays++, []);');
      content = content.replace('const result = [declaration];', 'globalThis.__declarationCounts.arrays++;\n  const result = [declaration];');
      content = content.replaceAll('result.push(\n', 'globalThis.__declarationCounts.flattenPasses++;\n    result.push(\n');
    }
  } else if (relative.endsWith('/buildNodes.ts')) {
    const sink = content.includes('const declarations: PropertyDeclaration[] = []');
    content = content.replace('const key = getTemplateKey(context, inputs);', 'const key = getTemplateKey(context, inputs);');
    content = content.replace('const declarations' + (sink ? ': PropertyDeclaration[]' : '') + ' = [];',
      `globalThis.__declarationCounts.rootCalls++;\n  const declarations${sink ? ': PropertyDeclaration[]' : ''} = [];`);
    if (!sink) content = content.replace('const collected = collectDeclarations', 'globalThis.__declarationCounts.flattenPasses++;\n    const collected = collectDeclarations');
  }
  return content;
}
