import { readFileSync, readdirSync } from 'node:fs';
import { resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { expect, it } from 'vitest';

/** Package-relative discovery keeps this check independent of the checkout location. */
const packageRoot = fileURLToPath(new URL('../../', import.meta.url));

/** Only documents with executable examples migrated to this harness are checked. */
const migratedDocuments = [
  'docs/agents/skills/schema-form-skill/knowledge/validation-ux.md',
  'docs/agents/skills/schema-form-skill/knowledge/error-feedback.md',
  'docs/agents/skills/schema-form-skill/knowledge/interaction-state.md',
  'docs/agents/skills/schema-form-skill/knowledge/validation-failures.md',
  'docs/agents/rules/schema-form-rule.md',
];

it('keeps migrated agent examples verbatim in executable public-API tests', () => {
  expect(
    migratedDocuments.length,
    'checked documents must not be empty',
  ).toBeGreaterThan(0);
  let checkedBlocks = 0;
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
        /^( {0,3})((`|~)\3{2,})(?:ts|tsx|typescript)(?:[ \t]+[^\r\n]*)?\r?\n([\s\S]*?)^ {0,3}\2\3*[ \t]*\r?$/gim,
      ),
    ];
    for (const fence of markdown.matchAll(
      /^[ \t]*[`~]{3,}[ \t]*(?:ts|tsx|typescript)(?=[ \t\r\n]|$)[^\r\n]*$/gim,
    )) {
      const line = markdown.slice(0, fence.index).split('\n').length;
      expect(
        blocks.some((block) => block.index === fence.index),
        `${document}:${line} unrecognized TypeScript fence`,
      ).toBe(true);
    }
    if (document.endsWith('/validation-ux.md'))
      expect(blocks.length).toBeGreaterThan(0);
    for (const block of blocks) {
      const precedingLine =
        markdown.slice(0, block.index).split('\n').at(-2) ?? '';
      const exempt = /^<!-- no-test: \S.* -->$/.test(precedingLine);
      const line = markdown.slice(0, block.index).split('\n').length;
      const location = `${document}:${line}`;
      if (document.includes('/knowledge/'))
        expect(exempt, `${location} must execute without an exemption`).toBe(
          false,
        );
      if (exempt) continue;
      const snippet = block[4].replace(
        new RegExp(`^ {0,${block[1].length}}`, 'gm'),
        '',
      );
      checkedBlocks++;
      expect(snippet.trim(), `${location} must contain an example`).not.toBe(
        '',
      );
      expect(
        examples.some((example) => example.includes(snippet)),
        `${location} must occur verbatim in an agents-examples test`,
      ).toBe(true);
    }
  }
  expect(checkedBlocks, 'at least one example must be checked').toBeGreaterThan(
    0,
  );
});
