import { execFileSync } from 'node:child_process';
import { createHash } from 'node:crypto';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';

/** A local git fixture models committed drift independently of the measured implementation. */
export function createClosingIntegrityFixture() {
  const root = fs.mkdtempSync(path.join(os.tmpdir(), 'closing-integrity-'));
  const helpers = 'browser-bench/interaction/helpers';
  const files = [
    helpers + '/stageClosing/decideStageClosingGates.ts',
    helpers + '/deriveStageClosingResults.ts',
    helpers + '/stageClosing/decideVsyncBound.ts',
    helpers + '/stageClosing/bootstrapStageClosingMetric.ts',
    helpers + '/deriveValidationAfterPaintResults.ts',
    'fixtures/input-responsiveness/ir-6-cases.json',
    helpers + '/checkStageClosingResults.ts',
  ];
  const prefix = 'packages/aileron/benchmark-form/';
  for (const file of files) {
    fs.mkdirSync(path.dirname(path.join(root, prefix, file)), {
      recursive: true,
    });
    fs.writeFileSync(path.join(root, prefix, file), 'registered');
  }
  const git = (args: string[]) =>
    execFileSync('git', args, { cwd: root, encoding: 'utf8' }).trim();
  git(['init', '--quiet']);
  git(['add', '.']);
  git([
    '-c',
    'user.name=Fixture',
    '-c',
    'user.email=fixture@example.invalid',
    'commit',
    '--quiet',
    '-m',
    'fixture',
  ]);
  const commit = git(['rev-parse', 'HEAD']);
  const hashes = Object.fromEntries(
    files.map((file) => [
      file,
      createHash('sha256').update('registered').digest('hex'),
    ]),
  );
  return { root, helpers, prefix, files, git, commit, hashes };
}
