import { readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

import { describe, expect, it } from 'vitest';

import { VERSION } from '../utils/version.js';

const PACKAGE_JSON_PATH = join(
  dirname(fileURLToPath(import.meta.url)),
  '..',
  '..',
  'package.json',
);

describe('AC-VERSION-SYNC — generated VERSION tracks the manifest', () => {
  it('equals the version field of package.json', () => {
    const manifest = JSON.parse(readFileSync(PACKAGE_JSON_PATH, 'utf-8')) as {
      version: string;
    };

    expect(VERSION).toBe(manifest.version);
  });
});
