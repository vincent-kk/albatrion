// CLI evidence writer: baseline text and generated per-change patches never update git state.
import assert from 'node:assert/strict';
import { spawnSync } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const directory = path.dirname(fileURLToPath(import.meta.url));
const repo = path.resolve(directory, '../../../../../../..');
const owner = 'packages/canard/schema-form/src/core/blueprint/';
const [command, phase, source, test] = process.argv.slice(2);
const bounded = (file, text) => { assert(Buffer.byteLength(text) <= 5_000_000); fs.writeFileSync(path.join(directory, file), text); };
if (command === 'snapshot') {
  const files = {};
  for (const file of [owner + 'DETAIL.md', owner + source]) files[file] = fs.readFileSync(path.join(repo, file), 'utf8');
  files[owner + test] = null;
  bounded(`${phase}-base.json`, JSON.stringify({ phase, files }, null, 2) + '\n');
  console.log(`${phase}-base.json: 현재 기반의 DETAIL·소스와 독립 시험의 부재를 기록했습니다.`);
} else if (command === 'patch') {
  const baseline = JSON.parse(fs.readFileSync(path.join(directory, `${phase}-base.json`), 'utf8'));
  const successor = { '2-child-input-literal': '3-path-strings', '3-path-strings': '4-template-key' }[phase];
  const measured = successor ? JSON.parse(fs.readFileSync(path.join(directory, `${successor}-base.json`), 'utf8')).files : {};
  const pairs = Object.entries(baseline.files).map(([file, before]) => ({ file, before,
    after: before !== null && measured[file] !== undefined ? measured[file] : fs.readFileSync(path.join(repo, file), 'utf8') }));
  const python = `import sys,json,difflib\npairs=json.load(sys.stdin)\nfor pair in pairs:\n if pair['before']==pair['after']: continue\n p=pair['file']\n print('diff --git a/'+p+' b/'+p)\n if pair['before'] is None: print('new file mode 100644')\n sys.stdout.writelines(difflib.unified_diff((pair['before'] or '').splitlines(True),pair['after'].splitlines(True),fromfile='/dev/null' if pair['before'] is None else 'a/'+p,tofile='b/'+p))\n`;
  const generated = spawnSync('python3', ['-c', python], { input: JSON.stringify(pairs), encoding: 'utf8', maxBuffer: 5_000_000 });
  assert.equal(generated.status, 0, generated.stderr); assert.equal(generated.signal, null);
  bounded(`${phase}.patch`, generated.stdout);
  const manifest = { phase, measuredBase: `${phase}-build-head.json`, patch: `${phase}.patch`,
    files: pairs.filter(pair => pair.before !== pair.after).map(pair => ({ file: pair.file,
      detailAddedLines: pair.file.endsWith('/DETAIL.md') ? pair.after.split('\n').flatMap((line, index) =>
        line.includes(`107라운드 ${phase}`) ? [index + 1] : []) : undefined,
      finalDetailAddedLines: pair.file.endsWith('/DETAIL.md') ? fs.readFileSync(path.join(repo, pair.file), 'utf8').split('\n').flatMap((line, index) =>
        line.includes(`107라운드 ${phase}`) ? [index + 1] : []) : undefined })) };
  bounded(`${phase}-files.json`, JSON.stringify(manifest, null, 2) + '\n');
  console.log(JSON.stringify(manifest));
} else throw new Error('Use snapshot or patch');
