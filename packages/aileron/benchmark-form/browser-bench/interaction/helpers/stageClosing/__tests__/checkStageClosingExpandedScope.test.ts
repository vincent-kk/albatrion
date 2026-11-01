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
const files = [
  'browser-bench/interaction/helpers/deriveValidationAfterPaintResults.ts',
  'fixtures/input-responsiveness/ir-6-cases.json',
  'browser-bench/interaction/helpers/checkStageClosingResults.ts',
];
it.each(files)(
  'rejects committed drift in expanded scope %s with matching hashes',
  (file) => {
    const f = createClosingIntegrityFixture();
    roots.push(f.root);
    fs.writeFileSync(path.join(f.root, f.prefix, file), 'changed');
    f.hashes[file] = createHash('sha256').update('changed').digest('hex');
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
it.each(files)(
  'rejects uncommitted drift in expanded scope %s against formal-start hash',
  (file) => {
    const f = createClosingIntegrityFixture();
    roots.push(f.root);
    fs.writeFileSync(path.join(f.root, f.prefix, file), 'changed');
    expect(() =>
      checkStageClosingIntegrity(f.root, f.commit, f.commit, f.hashes),
    ).toThrow('formal-start hash');
  },
);
