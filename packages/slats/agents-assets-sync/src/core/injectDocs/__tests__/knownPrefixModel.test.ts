import { existsSync, readFileSync, unlinkSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';

import { expect, it } from 'vitest';

import {
  consumerOf,
  installPackage,
  makeRoot,
  removeRoot,
  writeAt,
} from '../../../__tests__/roundThree/fixture.js';
import { runInjection } from '../utils/session/runInjection.js';

it('models known and unknown failed-owner prefixes in 1000 real preparations (seed 0x5f1e)', async () => {
  for (let sequence = 0; sequence < 1000; sequence++) {
    const root = makeRoot('known-prefix-model');
    try {
      const shared = sequence % 2 === 0;
      const failure = ['manifest', 'source', 'markdown'][
        Math.floor(sequence / 2) % 3
      ];
      const force = Math.floor(sequence / 6) % 2 === 0;
      const dryRun = Math.floor(sequence / 12) % 2 === 0;
      const namespace = shared ? 'alpha' : 'gamma';
      const a = installPackage(root, {
        name: '@probe/a',
        assets: { 'skills/alpha/a.md': 'a' },
        manifest: true,
      });
      const b = installPackage(root, {
        name: '@probe/b',
        assets: {
          [`skills/${namespace}/b.md`]: 'b',
          ...(failure === 'markdown' ? { 'rules/bad.md': '~~~\nopen' } : {}),
        },
        manifest: true,
      });
      if (failure === 'manifest')
        writeFileSync(join(b, 'dist/agents-hashes.json'), '{bad');
      if (failure === 'source')
        unlinkSync(join(b, 'docs/agents', `skills/${namespace}/b.md`));
      const old = join(root, '.claude/skills/alpha/old.md');
      const protectedFile = join(root, '.claude/skills', namespace, 'b.md');
      writeAt(old, 'orphan');
      writeAt(protectedFile, 'owned');
      const targets = [
        consumerOf(a, '@probe/a', 'manifest'),
        consumerOf(b, '@probe/b', 'manifest'),
      ];
      if (sequence % 5 === 0) targets.reverse();
      const result = await runInjection({
        targets,
        flags: {
          agent: ['claude'],
          scope: 'project',
          force,
          dryRun,
          yes: true,
        },
        originCwd: root,
      });
      expect(result.exitCode, `seed=0x5f1e sequence=${sequence}`).toBe(1);
      expect(readFileSync(protectedFile, 'utf8')).toBe('owned');
      expect(existsSync(old), `sequence=${sequence}`).toBe(
        !(force && !dryRun && !shared && failure !== 'manifest'),
      );
    } finally {
      removeRoot(root);
    }
  }
}, 120000);
