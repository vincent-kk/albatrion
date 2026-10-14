// Official decision uses only the three forced pairs; six balanced steady blocks are pooled records.
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { execFileSync } from 'node:child_process';

const directory = path.dirname(fileURLToPath(import.meta.url));
const repo = path.resolve(directory, '../../../../../../..');
assert.equal(execFileSync('git', ['--no-optional-locks', '-c', 'core.fsmonitor=false',
  'diff', '--exit-code', 'HEAD', '--', 'packages/canard/schema-form/src/core/blueprint'],
  { cwd: repo, encoding: 'utf8' }), '');
let source = fs.readFileSync(path.join(directory, 'summarize-single-contribution.mjs'), 'utf8')
  .replace('path.dirname(fileURLToPath(import.meta.url))', JSON.stringify(directory))
  .replaceAll('merge102-', 'freeze103-').replaceAll('237678927', 'a21a8003f');
source = source.replace("['sample-0', 'later'],", "['sample-0', 'later'], ['oneOf-40', 'first'], ['oneOf-40', 'later'],");
source = source.replace("['vitest', 'tsc', 'eslint', 'legacy']", "['vitest', 'production', 'tsc', 'eslint', 'legacy']");
source = source.replaceAll('freeze103-verify-', 'freeze103-head-verify-');
source = source.replace("'freeze103-equivalence.json'", "'freeze103-dev-equivalence.json'");
source = source.replace("'freeze103-counts.json'", "'freeze103-freeze-counts.json'");
source = source.replace('const result = {',
  "const developmentCounts = JSON.parse(fs.readFileSync(path.join(directory, 'freeze103-dev-freeze-counts.json'), 'utf8')).rows;\nconst result = { developmentCounts, productReverted: true, verificationScope: '복원된 HEAD와 보존한 호환성 시험', stopPoint: 'oneOf-20 예상 282개에는 버려지는 정적 schema 61개가 포함됩니다. 운영 실측은 221개입니다.',");
assert(source.includes('const controls = [1, 2, 3]'));
await import('data:text/javascript;base64,' + Buffer.from(source).toString('base64'));
