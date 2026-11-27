import {
  chmodSync,
  existsSync,
  linkSync,
  lstatSync,
  mkdirSync,
  readFileSync,
  rmSync,
  statSync,
  symlinkSync,
  writeFileSync,
} from 'node:fs';
import { join } from 'node:path';

import { expect, it } from 'vitest';

import { makeRoot, removeRoot } from '../../../__tests__/roundThree/fixture.js';
import { applyAction } from '../utils/applyAction.js';

const kinds = [
  'missing',
  'regular',
  'hard-link',
  'symbolic-link',
  'dangling-link',
] as const;
const combinations = kinds.flatMap((kind) =>
  [false, true].flatMap((deletion) =>
    [false, true].map((readonly) => ({ kind, deletion, readonly })),
  ),
);

it('matches an entry/identity reference model for every kind, deletion and read-only combination', async () => {
  const root = makeRoot('identity-model');
  try {
    for (const { kind, deletion, readonly } of combinations) {
      const mode = readonly ? 0o444 : 0o640;
      const directory = join(root, 'case');
      mkdirSync(directory);
      const source = join(directory, 'source');
      writeFileSync(source, 'new');
      const target = join(directory, 'target');
      const actual = kind === 'regular' ? target : join(directory, 'actual');
      if (kind !== 'missing' && kind !== 'dangling-link') {
        writeFileSync(actual, 'old');
        chmodSync(actual, mode);
      }
      if (kind === 'hard-link') linkSync(actual, target);
      else if (kind === 'symbolic-link' || kind === 'dangling-link')
        symlinkSync(actual, target);
      const original = existsSync(actual) ? statSync(actual) : undefined;
      const shouldRefuse = deletion
        ? readonly && (kind === 'regular' || kind === 'hard-link')
        : kind === 'dangling-link' || (readonly && kind !== 'missing');
      const action = {
        kind: deletion ? ('delete' as const) : ('copy' as const),
        relPath: 'source',
        target: { kind: 'file' as const, dstAbs: target },
      };
      const outcome = await applyAction(action, directory).then(
        () => 'written',
        () => 'refused',
      );
      const label = `kind=${kind}, deletion=${deletion}, readonly=${readonly}`;
      expect(outcome, label).toBe(shouldRefuse ? 'refused' : 'written');
      if (shouldRefuse) {
        if (existsSync(actual))
          expect(readFileSync(actual, 'utf8'), label).toBe('old');
      } else if (deletion) {
        expect(() => lstatSync(target), label).toThrow(/ENOENT/);
        if (original && kind !== 'regular')
          expect(readFileSync(actual, 'utf8'), label).toBe('old');
      } else {
        expect(readFileSync(target, 'utf8'), label).toBe('new');
        if (original) {
          expect(readFileSync(actual, 'utf8'), label).toBe('new');
          if (kind === 'hard-link')
            expect(statSync(actual).ino, label).toBe(original.ino);
          expect(statSync(actual).mode & 0o777, label).toBe(mode);
          expect(statSync(actual).gid, label).toBe(original.gid);
        }
        if (kind === 'symbolic-link')
          expect(lstatSync(target).isSymbolicLink(), label).toBe(true);
      }
      if (existsSync(actual)) chmodSync(actual, 0o640);
      rmSync(directory, { recursive: true, force: true });
    }
  } finally {
    removeRoot(root);
  }
}, 120000);
