// @vitest-environment node
import { readFileSync } from 'node:fs';
import { createRequire } from 'node:module';
import { resolve } from 'node:path';
import { expect, it } from 'vitest';

const semver = createRequire(import.meta.url)('semver');
const manifest = JSON.parse(
  readFileSync(resolve(__dirname, '../../package.json'), 'utf8'),
);

it.each(['README.md', 'README-ko_kr.md'])(
  'round-5 mui 7: %s agrees with the React peer range',
  (file) => {
    const readme = readFileSync(resolve(__dirname, '../..', file), 'utf8');
    const line = readme.split('\n').find((text) => /^- React \d/.test(text));
    expect(line).toBeDefined();
    expect(semver.satisfies('19.2.0', manifest.peerDependencies.react)).toBe(
      true,
    );
    expect(line).not.toMatch(/(?:below|미만).*19\.0\.0|19\.0\.0.*미만/);
  },
);
