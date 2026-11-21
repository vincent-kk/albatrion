import {
  chmodSync,
  existsSync,
  readFileSync,
  statSync,
  unlinkSync,
  writeFileSync,
} from 'node:fs';
import { join } from 'node:path';

import { expect, it } from 'vitest';

import {
  consumerOf,
  installPackage,
  makeRoot,
  removeRoot,
} from '../../../__tests__/roundThree/fixture.js';
import { runInjection } from '../utils/session/runInjection.js';

it('writes the plan-time bytes and mode for all source kinds after mutation or unlink (seed 0x5a11)', async () => {
  for (let sequence = 0; sequence < 240; sequence++) {
    const root = makeRoot('all-source-snapshot');
    try {
      const kind = ['rules', 'skills/alpha', 'commands'][sequence % 3];
      const relPath = `${kind}/a.md`;
      const original = Buffer.from('planned bytes\n');
      const packageRoot = installPackage(root, {
        name: '@probe/a',
        assets: { [relPath]: original },
        manifest: true,
      });
      const source = join(packageRoot, 'docs/agents', relPath);
      chmodSync(source, 0o750);
      const result = await runInjection({
        targets: [
          consumerOf(
            packageRoot,
            '@probe/a',
            sequence % 2 ? 'manifest' : 'directory',
          ),
        ],
        flags: {
          agent: sequence % 4 < 2 ? ['claude', 'codex'] : ['codex', 'claude'],
          scope: 'project',
          force: true,
          yes: true,
        },
        originCwd: root,
        onPlan: () => {
          if (sequence % 5) {
            writeFileSync(source, 'mutated bytes\n');
            chmodSync(source, 0o600);
          } else unlinkSync(source);
        },
      });
      expect(
        result.exitCode,
        `sequence=${sequence}: ${JSON.stringify(result.failures)}`,
      ).toBe(0);
      const target = join(root, '.claude', relPath);
      expect(existsSync(target), `sequence=${sequence}`).toBe(true);
      expect(readFileSync(target), `sequence=${sequence}`).toEqual(original);
      expect(statSync(target).mode & 0o777).toBe(0o750);
    } finally {
      removeRoot(root);
    }
  }
}, 120000);
