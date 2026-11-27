import { existsSync } from 'node:fs';
import { join } from 'node:path';

import { afterEach, expect, it } from 'vitest';

import {
  consumerOf,
  installPackage,
  makeRoot,
  removeRoot,
  writeAt,
} from '../../../__tests__/roundThree/fixture.js';
import { runInjection } from '../utils/session/runInjection.js';

const roots: string[] = [];
afterEach(() => {
  for (const root of roots.splice(0)) removeRoot(root);

});
it('names only failed participants that can own the protected namespace', async () => {
  const root = makeRoot('prefix-notice');
  roots.push(root);
  const targets = [
    consumerOf(
      installPackage(root, {
        name: '@probe/good',
        assets: { 'skills/alpha/good.md': 'good' },
        manifest: true,
      }),
      '@probe/good',
      'manifest',
    ),
    ...['alpha', 'gamma'].map((namespace) =>
      consumerOf(
        installPackage(root, {
          name: `@probe/${namespace}`,
          assets: {
            [`skills/${namespace}/owned.md`]: 'owned',
            'rules/bad.md': '~~~\nopen',
          },
          manifest: true,
        }),
        `@probe/${namespace}`,
        'manifest',
      ),
    ),
  ];
  const orphan = join(root, '.claude/skills/alpha/old.md');
  writeAt(orphan, 'keep');
  const result = await runInjection({
    targets,
    flags: { agent: ['claude'], scope: 'project', force: true, yes: true },
    originCwd: root,
  });
  expect(existsSync(orphan)).toBe(true);
  expect(
    result.notices
      ?.filter((notice) => notice.path === orphan)
      .map((notice) => notice.unitKey),
  ).toEqual(['claude:@probe/alpha']);
});
