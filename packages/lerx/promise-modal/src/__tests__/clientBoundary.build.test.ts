// @vitest-environment node
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { expect, it } from 'vitest';

it.each(['index.mjs', 'index.cjs'])(
  'starts %s with a use client directive',
  (file) => {
    const bundle = readFileSync(resolve(__dirname, '../../dist', file), 'utf8');
    expect(bundle.split('\n')[0]).toMatch(/^['"]use client['"];$/);
  },
);
