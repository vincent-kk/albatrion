import { readFileSync, readdirSync, statSync } from 'node:fs';
import { createRequire } from 'node:module';
import { join, resolve } from 'node:path';

import { expect, it } from 'vitest';

const require = createRequire(import.meta.url);
const semver = require('semver');
const packageRoot = resolve(__dirname, '../../..');
const packageJson = require('../../../package.json');

const listFiles = (dir: string): string[] =>
  readdirSync(dir).flatMap((name) => {
    const path = join(dir, name);
    return statSync(path).isDirectory() ? listFiles(path) : [path];
  });

/** Earliest React release that ships each API the built runtime imports. */
const introducedIn: Record<string, string> = {
  'react/jsx-runtime': '16.14.0',
  useState: '16.8.0',
  useEffect: '16.8.0',
  useRef: '16.8.0',
  forwardRef: '16.3.0',
};

it('the lowest React the peer range admits ships every API the published runtime imports', () => {
  const runtime = listFiles(join(packageRoot, 'dist'))
    .filter((path) => path.endsWith('.mjs'))
    .map((path) => readFileSync(path, 'utf8'))
    .join('\n');
  const floor = semver.minVersion(packageJson.peerDependencies.react).version;
  const used = Object.keys(introducedIn).filter((api) =>
    api.includes('/')
      ? runtime.includes(`from "${api}"`)
      : new RegExp(`import \\{[^}]*\\b${api}\\b[^}]*\\} from "react"`).test(runtime),
  );
  const unavailable = used.filter((api) => semver.lt(floor, introducedIn[api]));
  expect({ floor, unavailable }).toEqual({ floor, unavailable: [] });
});
