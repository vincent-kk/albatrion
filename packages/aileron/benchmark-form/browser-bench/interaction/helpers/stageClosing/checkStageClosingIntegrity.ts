import assert from 'node:assert/strict';
import { execFileSync } from 'node:child_process';
import { createHash } from 'node:crypto';
import fs from 'node:fs';
import path from 'node:path';

import { isStageClosingDecisionFile } from './isStageClosingDecisionFile';

/** Bind every non-test decision file to both the timed manifest and committed git blob. */
export function checkStageClosingIntegrity(
  repository: string,
  preregisteredCommit: string,
  toolCommit: string,
  toolHashes: Record<string, string>,
) {
  const packagePath = 'packages/aileron/benchmark-form/';
  const helpers = 'browser-bench/interaction/helpers/';
  const scopes = [
    helpers + 'stageClosing',
    helpers + 'deriveStageClosingResults.ts',
    helpers + 'checkStageClosingResults.ts',
    helpers + 'deriveValidationAfterPaintResults.ts',
    helpers + 'validationAfterPaint',
    ':(glob)' + helpers + 'summarize*',
    'fixtures/input-responsiveness',
  ];
  const paths = scopes.map((scope) =>
    scope.startsWith(':(glob)')
      ? ':(glob)' + packagePath + scope.slice(7)
      : packagePath + scope,
  );
  const git = (args: string[]) =>
    execFileSync('git', args, { cwd: repository });
  for (const file of [
    helpers + 'stageClosing/decideStageClosingGates.ts',
    helpers + 'deriveStageClosingResults.ts',
    helpers + 'stageClosing/decideVsyncBound.ts',
    helpers + 'stageClosing/bootstrapStageClosingMetric.ts',
  ])
    assert.ok(
      toolHashes[file],
      'Formal start records required decision key: ' + file,
    );
  const currentFiles = git([
    'ls-files',
    '--cached',
    '--others',
    '--exclude-standard',
    '--',
    packagePath,
  ])
    .toString()
    .trim()
    .split('\n');
  const timedFiles = git([
    'ls-tree',
    '-r',
    '--name-only',
    toolCommit,
    '--',
    packagePath,
  ])
    .toString()
    .trim()
    .split('\n');
  const providedFiles = Object.keys(toolHashes)
    .filter(isStageClosingDecisionFile)
    .map((file) => {
      assert.equal(path.posix.normalize(file), file, 'Canonical decision path');
      return packagePath + file;
    });
  const all = [...currentFiles, ...timedFiles, ...providedFiles].filter(
    (file, index, files) => file && files.indexOf(file) === index,
  );
  for (const fullPath of all) {
    const file = fullPath.slice(packagePath.length);
    if (!isStageClosingDecisionFile(file)) continue;
    assert.ok(toolHashes[file], 'Formal start records decision key: ' + file);
    const current = createHash('sha256')
      .update(fs.readFileSync(path.join(repository, fullPath)))
      .digest('hex');
    assert.equal(
      current,
      toolHashes[file],
      'Current implementation matches formal-start hash: ' + file,
    );
    const committed = createHash('sha256')
      .update(git(['show', toolCommit + ':' + fullPath]))
      .digest('hex');
    assert.equal(
      current,
      committed,
      'Timed git blob matches current decision file: ' + file,
    );
  }
  git(['diff', '--quiet', preregisteredCommit, toolCommit, '--', ...paths]);
}
