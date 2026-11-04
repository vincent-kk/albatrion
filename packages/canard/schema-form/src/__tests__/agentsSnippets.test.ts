import { readFileSync, readdirSync } from 'node:fs';
import { resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { expect, it } from 'vitest';

/** Package-relative discovery keeps this check independent of the checkout location. */
const packageRoot = fileURLToPath(new URL('../../', import.meta.url));

// PR 9-2 removes this migration list and covers every file under docs/agents.
const migratedDocuments = [
  'docs/agents/skills/schema-form-skill/knowledge/validation-ux.md',
  'docs/agents/rules/schema-form-rule.md',
];

it('keeps migrated agent examples verbatim in executable public-API tests', () => {
  const examplesRoot = resolve(packageRoot, 'src/__tests__/agents-examples');
  const examples = readdirSync(examplesRoot, {
    recursive: true,
    encoding: 'utf8',
  })
    .filter((file) => /\.test\.tsx?$/.test(file))
    .map((file) => readFileSync(resolve(examplesRoot, file), 'utf8'));
  expect(examples.length).toBeGreaterThan(0);

  for (const document of migratedDocuments) {
    const markdown = readFileSync(resolve(packageRoot, document), 'utf8');
    const blocks = [
      ...markdown.matchAll(
        /^```(?:ts|tsx|typescript)[ \t]*\r?\n([\s\S]*?)^```[ \t]*$/gm,
      ),
    ];
    if (document.endsWith('/validation-ux.md'))
      expect(blocks.length).toBeGreaterThan(0);
    for (const block of blocks) {
      const precedingLine =
        markdown.slice(0, block.index).split('\n').at(-2) ?? '';
      const exempt = /^<!-- no-test: \S.* -->$/.test(precedingLine);
      const line = markdown.slice(0, block.index).split('\n').length;
      const location = `${document}:${line}`;
      if (document.endsWith('/validation-ux.md'))
        expect(exempt, `${location} must execute without an exemption`).toBe(
          false,
        );
      if (exempt) continue;
      expect(block[1].trim(), `${location} must contain an example`).not.toBe(
        '',
      );
      expect(
        examples.some((example) => example.includes(block[1])),
        `${location} must occur verbatim in an agents-examples test`,
      ).toBe(true);
    }
  }
});
