// @vitest-environment node
import { readFileSync } from 'node:fs';
import { expect, it } from 'vitest';

it('publishes distribution entry points and distinct ESM and CommonJS declarations', () => {
  const manifest: {
    publishConfig: { exports: Record<string, unknown> };
  } = JSON.parse(
    readFileSync(new URL('../../package.json', import.meta.url), 'utf8'),
  );
  const entries = manifest.publishConfig.exports;

  expect(JSON.stringify(entries)).not.toMatch(/"source"|\.\/src\//);
  expect(entries['.']).toMatchObject({
    import: { types: './dist/index.d.ts', default: './dist/index.mjs' },
    require: { types: './dist/index.d.cts', default: './dist/index.cjs' },
  });
});
