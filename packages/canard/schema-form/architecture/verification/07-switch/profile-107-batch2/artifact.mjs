// Per-change evidence only; this command never modifies git or product files.
import assert from 'node:assert/strict';
import { spawnSync } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const directory = path.dirname(fileURLToPath(import.meta.url));
const repo = path.resolve(directory, '../../../../../../..');
const [command, phase, ...files] = process.argv.slice(2);
const save = (name, text) => { assert(Buffer.byteLength(text) <= 5_000_000); fs.writeFileSync(path.join(directory, name), text); };
if (command === 'snapshot') {
  const snapshot = Object.fromEntries(files.map(argument => {
    const created = argument.startsWith('--new=');
    const file = created ? argument.slice(6) : argument;
    return [file, !created && fs.existsSync(path.join(repo, file)) ? fs.readFileSync(path.join(repo, file), 'utf8') : null];
  }));
  save(phase + '-base.json', JSON.stringify({ phase, files: snapshot }, null, 2) + '\n');
  console.log(`${phase}: ${files.length}개 기반 파일 상태 기록`);
} else if (command === 'patch') {
  const baseline = JSON.parse(fs.readFileSync(path.join(directory, phase + '-base.json'), 'utf8'));
  const following = phase === '2-declaration-slice'
    ? JSON.parse(fs.readFileSync(path.join(directory, '4-default-choices-base.json'), 'utf8')).files
    : {};
  const pairs = Object.entries(baseline.files).map(([file, before]) => ({ file, before,
    after: following[file] ?? fs.readFileSync(path.join(repo, file), 'utf8') }));
  const python = `import sys,json,difflib\nfor pair in json.load(sys.stdin):\n if pair['before']==pair['after']: continue\n p=pair['file']\n print('diff --git a/'+p+' b/'+p)\n if pair['before'] is None: print('new file mode 100644')\n sys.stdout.writelines(difflib.unified_diff((pair['before'] or '').splitlines(True),pair['after'].splitlines(True),fromfile='/dev/null' if pair['before'] is None else 'a/'+p,tofile='b/'+p))\n`;
  const result = spawnSync('python3', ['-c', python], { input: JSON.stringify(pairs), encoding: 'utf8', maxBuffer: 5_000_000 });
  assert.equal(result.status, 0, result.stderr); assert.equal(result.signal, null);
  save(phase + '.patch', result.stdout);
  const manifest = { phase, measuredBase: phase + '-build-head.json', patch: phase + '.patch', files: pairs.filter(pair=>pair.before!==pair.after).map(pair=>({ file: pair.file,
    detailLines: pair.file.endsWith('/DETAIL.md') ? pair.after.split('\n').flatMap((line,index)=>line.trim() && !(pair.before ?? '').split('\n').includes(line) ? [index+1] : []) : undefined })) };
  save(phase + '-files.json', JSON.stringify(manifest, null, 2) + '\n');
  console.log(JSON.stringify(manifest));
} else throw new Error('Use snapshot or patch');
