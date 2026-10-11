// CLI evidence audit; only read-only git operations and byte fingerprints are used.
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import childProcess from 'node:child_process';
import { directory, pkg, repo, scratch, HEAD, hash, git, emit } from './runtime.mjs';

const label = process.argv[2];
assert(['before-D', 'final'].includes(label));
const baseline = JSON.parse(fs.readFileSync(path.join(directory, 'baseline.json'), 'utf8'));
const prepared = JSON.parse(fs.readFileSync(path.join(directory, 'bundles.json'), 'utf8'));
const paths = childProcess.execFileSync('rg', ['--files', path.join(pkg, 'src'), '--hidden'],
  { encoding: 'utf8' }).trim().split('\n').sort();
const sources = Object.fromEntries(paths.map(file => [path.relative(repo, file), hash(fs.readFileSync(file))]));
const sourceTreeSha256 = hash(JSON.stringify(sources));
const srcDiffSha256 = hash(git(['diff', '--', 'packages/canard/schema-form/src']));
const revision = git(['rev-parse', 'HEAD']).trim();
assert.equal(revision, HEAD);
assert.equal(revision, baseline.HEAD);
assert.equal(sourceTreeSha256, baseline.sourceTreeSha256, 'All src bytes must remain unchanged');
assert.equal(srcDiffSha256, baseline.srcDiffSha256, 'Existing src changes must remain unchanged');
assert.equal(prepared.sourceTreeSha256, sourceTreeSha256);
const bundles = prepared.bundles.map(bundle => {
  assert.equal(path.dirname(bundle.file), scratch);
  const bytes = fs.readFileSync(bundle.file);
  assert(bytes.length <= 5_000_000);
  const sha256 = hash(bytes);
  assert.equal(sha256, bundle.sha256, 'Prepared bundle must still match its source snapshot');
  return { file: bundle.file, bytes: bytes.length, sha256, matchesPrepared: true };
});
const artifactFiles = fs.readdirSync(directory).filter(file => fs.statSync(path.join(directory, file)).isFile());
const largestArtifact = artifactFiles.map(file => ({ file, bytes: fs.statSync(path.join(directory, file)).size }))
  .sort((left, right) => right.bytes - left.bytes)[0];
assert(largestArtifact.bytes <= 5_000_000);
emit('audit-' + label + '.json', { HEAD, checked: new Date().toISOString(), sourceFiles: paths.length,
  sourceTreeSha256, srcDiffSha256, sourceTreeMatchesBaseline: true, existingSrcChangesPreserved: true,
  bundles, bundleRebuildRequired: false, artifactFiles: artifactFiles.length, largestArtifact });
console.log(label + '의 소스 보존과 번들 최신성을 확인했습니다.');

