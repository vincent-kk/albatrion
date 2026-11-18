import { createRequire } from 'node:module';
import { expect, it } from 'vitest';

import manifest from '../../package.json';

const semver: { subset(left: string, right: string): boolean } = createRequire(
  import.meta.url,
)('semver');

it.each(['antd', 'dayjs'])('%s accepts the same host versions as its bundled dependency (round-2 antd6-plugin 2)', (name) => {
  const dependencies: Record<string, string> = manifest.dependencies;
  const peers: Record<string, string> = manifest.peerDependencies;
  expect(peers[name]).toBeDefined();
  expect(semver.subset(peers[name], dependencies[name])).toBe(true);
  expect(semver.subset(dependencies[name], peers[name])).toBe(true);
});
