import { existsSync, readFileSync } from 'node:fs';
import { join } from 'node:path';

import { expect, it } from 'vitest';

import {
  installPackage,
  makeRoot,
  removeRoot,
  writeAt,
} from '../roundThree/fixture.js';
import { runObservedSurface } from './helpers/runObservedSurface.js';

it.each(['plain', 'json', 'ink'] as const)(
  'shows dry-run copy paths and divergence reasons in the final %s output',
  async (mode) => {
    for (const diverged of [false, true]) {
      const root = makeRoot('dry-run-actions');
      const destination = join(root, '.claude/skills/alpha/a.md');
      try {
        installPackage(root, {
          name: '@probe/a',
          assets: { 'skills/alpha/a.md': 'planned\n' },
          manifest: true,
        });
        if (diverged) writeAt(destination, 'edited\n');
        const result = await runObservedSurface(mode, root, [
          '--package=@probe/a',
          '--dry-run',
        ]);
        expect(result.code).toBe(0);
        expect(result.observedActions).toEqual([
          {
            path: 'skills/alpha/a.md',
            reason: diverged
              ? 'local differs from source (user edit or version change)'
              : '',
          },
        ]);
        expect(existsSync(destination)).toBe(diverged);
        if (diverged)
          expect(readFileSync(destination, 'utf8')).toBe('edited\n');
      } finally {
        removeRoot(root);
      }
    }
  },
);
