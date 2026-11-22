import { createRequire } from 'node:module';
import { expect, it } from 'vitest';

import manifest from '../../package.json';

it('preserves the published peer range for each bundled UI library', () => {
  expect(manifest.peerDependencies).toMatchObject({
    '@emotion/react': '^11.0.0',
    '@emotion/styled': '^11.0.0',
    '@mui/icons-material': '^7.0.0',
    '@mui/material': '^7.0.0',
    '@mui/x-date-pickers': '^8.0.0',
    dayjs: '^1.0.0',
  });
});

const semver: { subset(left: string, right: string): boolean } = createRequire(
  import.meta.url,
)('semver');

it.each([
  '@emotion/react',
  '@emotion/styled',
  '@mui/icons-material',
  '@mui/material',
  '@mui/x-date-pickers',
  'dayjs',
])(
  '%s accepts the same host versions as its bundled dependency (round-2 mui-plugin 2)',
  (name) => {
    const dependencies: Record<string, string> = manifest.dependencies;
    const peers: Record<string, string> = manifest.peerDependencies;
    expect(peers[name]).toBeDefined();
    expect(semver.subset(peers[name], dependencies[name])).toBe(true);
    expect(semver.subset(dependencies[name], peers[name])).toBe(true);
  },
);
