import { join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { beforeAll, expect, it } from 'vitest';

import { hasMigrationIdentifier } from './helpers/hasMigrationIdentifier';
import { parseMigrationIdentifiers } from './helpers/parseMigrationIdentifiers';
import { readDeclarationSurface } from './helpers/readDeclarationSurface';
import { readMigrationRows } from './helpers/readMigrationRows';

/** This external-consumer check reads the public entry instead of importing internals. */
const packageRoot = fileURLToPath(new URL('../../../', import.meta.url));
/** Repository-relative paths keep the test independent of the worktree name. */
const repositoryRoot = join(packageRoot, '../../..');
/** Schema-key and behavioral prose tables have their own contracts, not API-name rows. */
const guides = [
  'documents/docs/canard/schema-form/migration-from-0x.mdx',
  'documents/i18n/ko/docusaurus-plugin-content-docs/current/canard/schema-form/migration-from-0x.mdx',
].map((path) => readMigrationRows(join(repositoryRoot, path)));
/** One compiler program per release keeps the check's memory and startup cost bounded. */
let surfaces: Map<string, string[]>[];

beforeAll(() => {
  // The benchmark workspace declares this pinned dependency; CI installs all workspaces.
  surfaces = [
    join(
      repositoryRoot,
      'node_modules/@canard/schema-form_0.16.1/dist/index.d.ts',
    ),
    join(packageRoot, 'src/index.ts'),
  ].map((entry) => readDeclarationSurface(entry, packageRoot));
}, 60000);

it('keeps Korean API conversion rows identical to English', () => {
  expect(guides[1]).toEqual(guides[0]);
});

it('resolves every old and new API identifier in both migration tables and languages', () => {
  const missing: string[] = [];
  for (const [language, rows] of guides.entries())
    for (const row of rows)
      for (const [side, cell] of row.entries())
        for (const identifier of parseMigrationIdentifiers(cell))
          if (!hasMigrationIdentifier(surfaces[side], identifier, side === 0))
            missing.push(
              `${language === 0 ? 'en' : 'ko'} ${side === 0 ? '0.x' : 'current'}: ${identifier}`,
            );
  expect(missing).toEqual([]);
});

it('maps every Form and FormProvider prop without a same-name current counterpart', () => {
  const missing: string[] = [];
  for (const owner of ['FormProps', 'FormProviderProps']) {
    const oldProps = surfaces[0].get(owner);
    const newProps = surfaces[1].get(owner);
    expect(oldProps?.length).toBeGreaterThan(0);
    expect(newProps?.length).toBeGreaterThan(0);
    for (const prop of oldProps!) {
      if (newProps!.includes(prop)) continue;
      const mapped = guides[0].some(
        ([oldCell, newCell]) =>
          parseMigrationIdentifiers(oldCell).some(
            (name) => name === prop || name === `${owner}.${prop}`,
          ) &&
          parseMigrationIdentifiers(newCell).some((name) =>
            newProps!.includes(name.replace(`${owner}.`, '')),
          ),
      );
      if (!mapped) missing.push(`${owner}.${prop}`);
    }
  }
  expect(missing).toEqual([]);
});
