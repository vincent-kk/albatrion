import { spawnSync } from 'node:child_process';
import { existsSync, readFileSync } from 'node:fs';
import { join } from 'node:path';

import { expect, it } from 'vitest';

import {
  PACKAGE_ROOT,
  makeRoot,
  removeRoot,
  writeAt,
} from '../roundThree/fixture.js';

/** Exercise the published build executable, including real opt-out side effects. */
it('matches the build opt-in model over 120 metadata and source combinations (seed 0x5b01)', () => {
  for (let sequence = 0; sequence < 120; sequence++) {
    const root = makeRoot('build-model');
    try {
      const assetPath = [undefined, null, '', 17, 'custom', 'absent'][
        sequence % 6
      ];
      writeAt(
        join(root, 'package.json'),
        (sequence % 2 ? '\uFEFF' : '') +
          JSON.stringify({
            name: '@probe/a',
            version: '1.0.0',
            agents: { assetPath },
          }),
      );
      writeAt(
        join(root, 'agents/skills/default.md'),
        'fallback must not be used',
      );
      writeAt(join(root, 'custom/rules/a.md'), `body ${sequence}\n`);
      const result = spawnSync(
        process.execPath,
        [join(PACKAGE_ROOT, 'scripts/agents-build-hashes.mjs')],
        { cwd: root, encoding: 'utf8' },
      );
      const optedIn = typeof assetPath === 'string' && assetPath.length > 0;
      expect(result.status, `sequence=${sequence}`).toBe(
        assetPath === 'absent' ? 1 : 0,
      );
      const output = join(root, 'dist/agents-hashes.json');
      expect(existsSync(output), `sequence=${sequence}`).toBe(
        optedIn && assetPath !== 'absent',
      );
      if (existsSync(output))
        expect(
          Object.keys(JSON.parse(readFileSync(output, 'utf8')).files),
        ).toEqual(['rules/a.md']);
    } finally {
      removeRoot(root);
    }
  }
});
