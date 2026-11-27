import {
  chmodSync,
  linkSync,
  mkdtempSync,
  readFileSync,
  rmSync,
  statSync,
  symlinkSync,
  writeFileSync,
} from 'node:fs';
import { chown } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';

import { afterEach, expect, it, vi } from 'vitest';

import { setAlternateGroup } from '../../../__tests__/roundFive/helpers/setAlternateGroup.js';
import { applyAction } from '../utils/applyAction.js';
import { replaceDocument } from '../utils/replaceDocument.js';

vi.mock('node:fs/promises', async (original) => {
  const actual = await original<typeof import('node:fs/promises')>();
  return { ...actual, chown: vi.fn(actual.chown) };
});

/** Filesystem identity rows share one temporary fixture per independent case. */
const roots: string[] = [];
afterEach(() => {
  for (const root of roots.splice(0)) {
    chmodSync(join(root, 'target'), 0o600);
    rmSync(root, { recursive: true, force: true });
  }
  vi.mocked(chown).mockClear();
});

for (const links of [1, 2])
  for (const group of ['same', 'other', 'cannot-set'])
    for (const kind of ['regular', 'symlink', 'read-only'])
      it(`${links} links, ${group} group, ${kind}: document and file overwrites keep identity`, async () => {
        const root = mkdtempSync(join(tmpdir(), 'identity-matrix-'));
        roots.push(root);
        const path = join(root, 'target');
        const source = join(root, 'source');
        writeFileSync(path, 'old');
        writeFileSync(source, 'new');
        const alternate =
          group === 'other'
            ? setAlternateGroup(path, process.getgroups?.() ?? [])
            : undefined;
        const cannotRestore =
          group === 'cannot-set' ||
          (group === 'other' && alternate === undefined);
        chmodSync(path, kind === 'read-only' ? 0o440 : 0o640);
        if (links === 2) linkSync(path, join(root, 'second'));
        const destination = kind === 'symlink' ? join(root, 'link') : path;
        if (kind === 'symlink') symlinkSync(path, destination);
        const before = statSync(path);
        for (const operation of ['document', 'file']) {
          if (cannotRestore)
            vi.mocked(chown).mockRejectedValueOnce(
              Object.assign(new Error('ownership denied'), { code: 'EPERM' }),
            );
          const write =
            operation === 'document'
              ? replaceDocument(destination, Buffer.from('new'))
              : applyAction(
                  {
                    kind: 'warn-diverged',
                    relPath: 'source',
                    target: { kind: 'file', dstAbs: destination },
                  },
                  root,
                );
          if (kind === 'read-only')
            await expect(write).rejects.toThrow(/read.only/);
          else await write;
          const after = statSync(path);
          expect({
            mode: after.mode,
            uid: after.uid,
            gid: after.gid,
            links: after.nlink,
          }).toEqual({
            mode: before.mode,
            uid: before.uid,
            gid: before.gid,
            links: before.nlink,
          });
          if (links > 1 || cannotRestore || kind === 'read-only')
            expect(after.ino).toBe(before.ino);
          expect(readFileSync(path, 'utf8')).toBe(
            kind === 'read-only' ? 'old' : 'new',
          );
          if (links > 1)
            expect(readFileSync(join(root, 'second'), 'utf8')).toBe(
              kind === 'read-only' ? 'old' : 'new',
            );
          if (cannotRestore && links === 1 && kind !== 'read-only')
            expect(chown).toHaveBeenCalledOnce();
          vi.mocked(chown).mockReset();
        }
      });
