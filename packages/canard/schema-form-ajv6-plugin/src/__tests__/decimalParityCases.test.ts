import { createHash } from 'node:crypto';
import { readFileSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { expect, it } from 'vitest';

it('uses identical decimal cases and expected results in every AJV package', () => {
  const directory = dirname(fileURLToPath(import.meta.url));
  const digest = (path: string) =>
    createHash('sha256').update(readFileSync(path)).digest('hex');
  const own = digest(resolve(directory, 'fixtures/decimalParityCases.json'));
  for (const version of ['6', '7', '8']) {
    const copy = resolve(
      directory,
      `../../../schema-form-ajv${version}-plugin/src/__tests__/fixtures/decimalParityCases.json`,
    );
    expect(digest(copy), `AJV${version} decimal table`).toBe(own);
  }
});
