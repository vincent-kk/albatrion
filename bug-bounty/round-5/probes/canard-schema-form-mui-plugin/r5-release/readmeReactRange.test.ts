// @vitest-environment node
import { readFileSync } from 'node:fs';
import { createRequire } from 'node:module';
import { join, resolve } from 'node:path';

import { describe, expect, it } from 'vitest';

/**
 * r5-release, angle CA3: the README's stated React requirement against the published peer range.
 * Static check: documents and manifest only.
 */
const packageDir = resolve(__dirname, '../../..');
const semver = createRequire(__filename)('semver') as {
  intersects: (a: string, b: string) => boolean;
  satisfies: (version: string, range: string) => boolean;
};
const manifest = JSON.parse(readFileSync(join(packageDir, 'package.json'), 'utf8'));

describe('r5-release MUI plugin README React requirement', () => {
  it('the README admits React 19, which peerDependencies.react admits', () => {
    const readme = readFileSync(join(packageDir, 'README.md'), 'utf8');
    const line = readme.split('\n').find((text) => /^- React \d/.test(text)) ?? '';
    // "React 18.0.0 or later (below 19.0.0)" as a range.
    const lower = /React (\d+\.\d+\.\d+) or later/.exec(line)?.[1];
    const upper = /below (\d+\.\d+\.\d+)/.exec(line)?.[1];
    const documented = `>=${lower}${upper ? ` <${upper}` : ''}`;
    expect({
      line,
      react19: semver.satisfies('19.2.0', documented),
    }).toEqual({ line, react19: semver.satisfies('19.2.0', manifest.peerDependencies.react) });
  });

  it('control: the peer range admits React 19 and the installed React is 19', () => {
    expect(semver.satisfies('19.2.0', manifest.peerDependencies.react)).toBe(true);
    expect(createRequire(__filename)('react/package.json').version).toMatch(/^19\./);
  });
});
