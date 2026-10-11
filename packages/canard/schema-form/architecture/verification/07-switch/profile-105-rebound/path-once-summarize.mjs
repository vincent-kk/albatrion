// Derive the same 95C-01 verdict without importing unrelated 104 freeze contracts.
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const script = fileURLToPath(import.meta.url);
const directory = path.dirname(script);
let source = fs.readFileSync(path.resolve(directory, '../profile-104-owned/summarize.mjs'), 'utf8');
source = source.replace("const HEAD = 'baf4cacb647ad3de7dbff7c232efddf55b0bc546';", "const HEAD = 'e633fefefb1efcf81302ccf3efc0b51431fb2cee';");
source = source.split('owned104-').join('path105-');
source = source.split('fileURLToPath(import.meta.url)').join(JSON.stringify(script));
source = source.replace("['head', 'control', 'working', 'working-dev']", "['head', 'control', 'working']");
source = source.replace("read('build-' + version)", "read('path105-build-' + version)");
const sourceCheckStart = source.indexOf('for (const [file, hash] of Object.entries(builds.working.sources))');
const sourceCheckEnd = source.indexOf("assert.equal(execFileSync('git'", sourceCheckStart);
assert(sourceCheckStart >= 0 && sourceCheckEnd > sourceCheckStart);
source = source.slice(0, sourceCheckStart) + `
const measuredSourcesUnchanged = Object.entries(builds.working.sources).every(([file, hash]) =>
  sha(fs.readFileSync(path.join(repo, file))) === hash);
const productRestoredToHead = Object.entries(builds.head.sources).every(([file, hash]) =>
  sha(fs.readFileSync(path.join(repo, file))) === hash);
assert(measuredSourcesUnchanged || productRestoredToHead, 'Product must match candidate or restored HEAD');
` + source.slice(sourceCheckEnd);
source = source.replace('measuredSourcesUnchanged: true', 'measuredSourcesUnchanged, productRestoredToHead');
source = source.replace('improvementBeyondNoise: gainMs > noiseMs', 'improvementBeyondNoise: gainMs > noiseMs && paired.ci95[0] > 0');
source = source.replace("file.startsWith('process-')", "file.startsWith('process-') && !file.includes('--')");
source = source.replace("assert(processes.every(row => row.signal === null && row.status === 0 && row.elapsedMs < 480000));",
  "processes.splice(0, processes.length, ...processes.filter(row => row.HEAD === HEAD)); assert(processes.every(row => row.signal === null && row.status === 0 && row.elapsedMs < 480000));");
const a = source.indexOf('const freezeCounts = [];');
const b = source.indexOf('const improvements =', a);
assert(a >= 0 && b > a);
source = source.slice(0, a) + 'const freezeCounts = [];\n' + source.slice(b);
source = source.replace("['development', 'owned', 'production', 'typecheck', 'lint', 'legacy']", "['development', 'targeted', 'targeted-head', 'production', 'typecheck', 'lint', 'legacy']");
source = source.replace("read('check-' + name)", "read('path105-check-' + name)");
source = source.replace('  timing, freezeCounts, checks,', `
  timing, freezeCounts, checks,
  pathCounts: {
    candidate: read('path105-check-targeted').summary.filter(line => line.startsWith('PATH105 '))
      .map(line => JSON.parse(line.slice(8))),
    restoredHead: read('path105-check-targeted-head').summary.filter(line => line.startsWith('PATH105 '))
      .map(line => JSON.parse(line.slice(8))),
    unit: 'node당 tuple 순회·전체 키 JSON 인코딩·host key 재인코딩·생산 키 문자열 수; 일반 공개 path 할당 총량은 아님',
  },
  disposition: {
    product: productRestoredToHead ? 'HEAD로 복구' : '후보 유지',
    reason: '95C-01 잡음 밖 개선 0행; 모든 행의 판정 회귀도 잡음 안',
    candidatePatch: 'path105-candidate-product.patch',
    candidatePatchSha256: sha(fs.readFileSync(path.join(directory, 'path105-candidate-product.patch'))),
    originalFixtureUnchanged: true,
  },`);
source = source.replace('assert.equal(fixtureRecord.head, HEAD);', "assert.equal(fixtureRecord.head, 'baf4cacb647ad3de7dbff7c232efddf55b0bc546');");
source = source.replace("path.join(directory, 'summary.json')", "path.join(directory, 'path105-summary.json')");
await import('data:text/javascript;base64,' + Buffer.from(source).toString('base64'));
