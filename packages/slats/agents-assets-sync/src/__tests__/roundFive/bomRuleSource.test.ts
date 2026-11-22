import { readFileSync } from 'node:fs';
import { join } from 'node:path';

import { afterEach, expect, it } from 'vitest';

import {
  installPackage,
  makeRoot,
  removeRoot,
  runCliCode,
  writeAt,
} from '../../__tests__/roundThree/fixture.js';
import { assertManagedMarkdown } from '../../core/markerBlock/index.js';

const roots: string[] = [];
afterEach(() => {
  for (const root of roots.splice(0)) removeRoot(root);
});

const BOM = '﻿';
// A rule that is one fenced example, saved as UTF-8 with a BOM.
const RULE = `${BOM}\`\`\`bash\nyarn lint\n\`\`\`\n\n# Lint before committing\n`;

function setup() {
  const root = makeRoot('r5-bom-rule');
  roots.push(root);
  installPackage(root, {
    name: '@probe/kit',
    assets: { 'rules/lint.md': RULE },
    manifest: true,
  });
  writeAt(join(root, 'AGENTS.md'), '# Team\n');
  return root;
}

const args = (root: string, ...extra: string[]) => [
  '--package=@probe/kit',
  '--agent=codex',
  '--scope=project',
  '--no-interactive',
  `--root=${root}`,
  ...extra,
];

it('control: the BOM rule source alone passes the Markdown boundary check', () => {
  expect(() => assertManagedMarkdown(RULE, 'rules/lint.md')).not.toThrow();
});

it('codex: a BOM-prefixed rule that opens with a fence installs and the next run is a no-op', async () => {
  const root = setup();
  const first = await runCliCode(args(root));
  const second = await runCliCode(args(root));
  const document = readFileSync(join(root, 'AGENTS.md'), 'utf8');
  let documentIssue: string | null = null;
  try {
    assertManagedMarkdown(document, 'AGENTS.md');
  } catch (error) {
    documentIssue = error instanceof Error ? error.message : String(error);
  }
  expect({ first, second, documentIssue }).toEqual({
    first: 0,
    second: 0,
    documentIssue: null,
  });
});

it('codex: after the BOM rule is installed, another package can still add its rule block to the same AGENTS.md', async () => {
  const root = setup();
  installPackage(root, {
    name: '@probe/other',
    assets: { 'rules/other.md': '# Other rule\n' },
    manifest: true,
  });
  const first = await runCliCode(args(root));
  const other = await runCliCode([
    '--package=@probe/other',
    '--agent=codex',
    '--scope=project',
    '--no-interactive',
    `--root=${root}`,
  ]);
  const document = readFileSync(join(root, 'AGENTS.md'), 'utf8');
  expect({
    first,
    other,
    otherInstalled: document.includes('# Other rule'),
  }).toEqual({ first: 0, other: 0, otherInstalled: true });
});
