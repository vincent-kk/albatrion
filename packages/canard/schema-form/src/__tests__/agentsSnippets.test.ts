import { readFileSync, readdirSync } from 'node:fs';
import { resolve, sep } from 'node:path';
import { fileURLToPath } from 'node:url';
import { expect, it } from 'vitest';

/** Package-relative discovery keeps this check independent of the checkout location. */
const packageRoot = fileURLToPath(new URL('../../', import.meta.url));

/** Every agent document is checked, so a new document or example cannot skip execution. */
const checkedDocuments = readdirSync(resolve(packageRoot, 'docs/agents'), {
  recursive: true,
  encoding: 'utf8',
})
  .filter((file) => file.endsWith('.md'))
  .map((file) => `docs/agents/${file.split(sep).join('/')}`)
  .sort();

/** Reduce text to its trimmed lines, so indentation and line-end spacing never matter. */
const toTrimmedLines = (text: string): string[] =>
  text.split('\n').map((line) => line.trim());

/**
 * Tell whether a test source contains a document block as written.
 * @param source - Text of one agents-examples test file.
 * @param snippet - Document block with its fence indentation removed.
 * @returns True when the block's lines, each trimmed of leading and trailing whitespace,
 *   equal a contiguous run of the source's trimmed lines. Whole lines must be equal, so a
 *   match cannot start or end in the middle of a source line; indentation is ignored.
 */
const containsBlock = (source: string, snippet: string): boolean => {
  const wanted = toTrimmedLines(snippet.replace(/\n$/, ''));
  const lines = toTrimmedLines(source);
  for (let start = 0; start + wanted.length <= lines.length; start++) {
    let offset = 0;
    while (offset < wanted.length && lines[start + offset] === wanted[offset])
      offset++;
    if (offset === wanted.length) return true;
  }
  return false;
};

it('matches whole trimmed lines only, ignoring indentation', () => {
  const block = 'if (ok) {\n  go();\n}\n';
  expect(containsBlock('      if (ok) {\n go();\n    }\n', block)).toBe(true);
  expect(containsBlock(block, block)).toBe(true);
  expect(containsBlock('} else if (ok) {\n  go();\n}\n', block)).toBe(false);
});

it('keeps agent examples verbatim in executable public-API tests', () => {
  expect(
    checkedDocuments.length,
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

  for (const document of checkedDocuments) {
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
        examples.some((example) => containsBlock(example, snippet)),
        `${location} must occur verbatim in an agents-examples test`,
      ).toBe(true);
    }
  }
  expect(checkedBlocks, 'at least one example must be checked').toBeGreaterThan(
    0,
  );
});
