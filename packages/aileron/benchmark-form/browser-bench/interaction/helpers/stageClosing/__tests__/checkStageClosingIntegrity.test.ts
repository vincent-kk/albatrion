import { createHash } from 'node:crypto';
import fs from 'node:fs';
import path from 'node:path';
import { afterEach, expect, it } from 'vitest';

import { checkStageClosingIntegrity } from '../checkStageClosingIntegrity';
import { createClosingIntegrityFixture } from './fixtures/createClosingIntegrityFixture';

const roots: string[] = [];
afterEach(() => {
  for (const root of roots.splice(0))
    fs.rmSync(root, { recursive: true, force: true });
});
it('accepts unchanged registered implementation and recorded hashes', () => {
  const f = createClosingIntegrityFixture();
  roots.push(f.root);
  expect(() =>
    checkStageClosingIntegrity(f.root, f.commit, f.commit, f.hashes),
  ).not.toThrow();
});
it('rejects current gate edits even when the commit range is unchanged', () => {
  const f = createClosingIntegrityFixture();
  roots.push(f.root);
  fs.writeFileSync(path.join(f.root, f.prefix, f.files[0]), 'changed');
  expect(() =>
    checkStageClosingIntegrity(f.root, f.commit, f.commit, f.hashes),
  ).toThrow('formal-start hash');
});
it('rejects current derive edits even when the commit range is unchanged', () => {
  const f = createClosingIntegrityFixture();
  roots.push(f.root);
  fs.writeFileSync(path.join(f.root, f.prefix, f.files[1]), 'changed');
  expect(() =>
    checkStageClosingIntegrity(f.root, f.commit, f.commit, f.hashes),
  ).toThrow('formal-start hash');
});
it.each([
  'stageClosing/threshold.ts',
  'deriveStageClosingResults.ts',
  'validationAfterPaint/quantile.ts',
  'summarizePage.ts',
])(
  'rejects committed scoped drift in %s even with matching current hashes',
  (file) => {
    const f = createClosingIntegrityFixture();
    roots.push(f.root);
    const location = path.join(f.root, f.prefix, f.helpers, file);
    fs.mkdirSync(path.dirname(location), { recursive: true });
    fs.writeFileSync(location, 'changed');
    if (file === 'deriveStageClosingResults.ts')
      f.hashes[f.helpers + '/' + file] = createHash('sha256')
        .update('changed')
        .digest('hex');
    f.git(['add', '.']);
    f.git([
      '-c',
      'user.name=Fixture',
      '-c',
      'user.email=fixture@example.invalid',
      'commit',
      '--quiet',
      '-m',
      'drift',
    ]);
    expect(() =>
      checkStageClosingIntegrity(
        f.root,
        f.commit,
        f.git(['rev-parse', 'HEAD']),
        f.hashes,
      ),
    ).toThrow();
  },
);

it('rejects an omitted required decision helper hash', () => {
  const f = createClosingIntegrityFixture();
  roots.push(f.root);
  delete f.hashes[f.files[2]];
  expect(() =>
    checkStageClosingIntegrity(f.root, f.commit, f.commit, f.hashes),
  ).toThrow();
});
it('rejects current helper drift beyond the two top-level files', () => {
  const f = createClosingIntegrityFixture();
  roots.push(f.root);
  fs.writeFileSync(path.join(f.root, f.prefix, f.files[2]), 'changed');
  expect(() =>
    checkStageClosingIntegrity(f.root, f.commit, f.commit, f.hashes),
  ).toThrow();
});
it('rejects a current/toolHashes pair that differs from the timed git blob', () => {
  const f = createClosingIntegrityFixture();
  roots.push(f.root);
  fs.writeFileSync(path.join(f.root, f.prefix, f.files[0]), 'changed');
  f.hashes[f.files[0]] = createHash('sha256').update('changed').digest('hex');
  expect(() =>
    checkStageClosingIntegrity(f.root, f.commit, f.commit, f.hashes),
  ).toThrow();
});
