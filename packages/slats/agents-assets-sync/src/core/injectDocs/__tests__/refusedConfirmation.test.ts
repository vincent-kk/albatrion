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

it('offers only executable units when an independent sibling needs force confirmation', async () => {
  const root = makeRoot('refused-confirm');
  try {
    const targets = ['a', 'b', 'good'].map((name) =>
      consumerOf(
        installPackage(root, {
          name: `@probe/${name}`,
          assets:
            name === 'good'
              ? { 'skills/good/SKILL.md': 'new' }
              : { 'skills/shared/SKILL.md': name },
        }),
        `@probe/${name}`,
        'directory',
      ),
    );
    writeAt(join(root, '.claude/skills/good/SKILL.md'), 'local');
    let offered: string[] = [];
    const result = await runInjection({
      targets,
      flags: { agent: ['claude'], scope: 'project', force: true },
      originCwd: root,
      confirm: async (units) => {
        offered = units.map((unit) => unit.target.name);
        return true;
      },
    });
    expect(offered).toEqual(['@probe/good']);
    expect(result.exitCode).toBe(1);
  } finally {
    removeRoot(root);
  }
});
