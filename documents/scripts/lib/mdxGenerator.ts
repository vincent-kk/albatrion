import type { ParsedFunction, CategoryMeta } from './types';

/** Category position mapping for common-utils sub-paths. */
const CATEGORY_POSITIONS: Record<string, number> = {
  array: 1,
  filter: 2,
  object: 3,
  function: 4,
  promise: 5,
  scheduler: 6,
  hash: 7,
  math: 8,
  convert: 9,
  console: 10,
  constant: 11,
  error: 12,
  lib: 13,
};

/**
 * Generate MDX content for a parsed function/symbol documentation page.
 */
export function generateMdx(parsed: ParsedFunction): string {
  const lines: string[] = [];

  // Frontmatter
  lines.push('---');
  lines.push(`title: '${parsed.name}'`);
  lines.push(`sidebar_label: '${parsed.name}'`);
  lines.push('---');
  lines.push('<!-- sync-winglet-docs:auto -->');
  lines.push('');
  lines.push("import WingletPlayground from '@site/src/components/WingletPlayground';");
  lines.push('');

  // Title & description
  lines.push(`# ${parsed.name}`);
  lines.push('');
  if (parsed.description) {
    lines.push(escapeMdxContent(parsed.description));
    lines.push('');
  }

  // Signature
  lines.push('## Signature');
  lines.push('');
  lines.push('```typescript');
  lines.push(parsed.typeSignature);
  lines.push('```');
  lines.push('');

  // Parameters
  if (parsed.params.length > 0) {
    lines.push('## Parameters');
    lines.push('');
    lines.push('| Name | Type | Description |');
    lines.push('|------|------|-------------|');
    for (const param of parsed.params) {
      const type = param.type ? escapeTableCell(param.type) : '-';
      const desc = escapeTableCell(param.description);
      lines.push(`| \`${param.name}\` | \`${type}\` | ${desc} |`);
    }
    lines.push('');
  }

  // Returns
  if (parsed.returns) {
    lines.push('## Returns');
    lines.push('');
    const returnType = parsed.returns.type ? `\`${parsed.returns.type}\`` : '';
    const returnDesc = parsed.returns.description || '';
    if (returnType && returnDesc) {
      lines.push(`${returnType} — ${returnDesc}`);
    } else if (returnType) {
      lines.push(returnType);
    } else if (returnDesc) {
      lines.push(returnDesc);
    }
    lines.push('');
  }

  // Examples
  if (parsed.examples.length > 0) {
    lines.push('## Examples');
    lines.push('');
    for (const example of parsed.examples) {
      if (example.title) {
        lines.push(`### ${example.title}`);
        lines.push('');
      }
      lines.push('```typescript');
      lines.push(example.code);
      lines.push('```');
      lines.push('');
    }
  }

  // Playground
  const firstExample = parsed.examples[0];
  if (firstExample) {
    lines.push('## Playground');
    lines.push('');
    const escapedCode = escapeTemplateLiteral(firstExample.code);
    lines.push('<WingletPlayground');
    lines.push(`  dependencies={{ "${parsed.packageName}": "${parsed.packageVersion}" }}`);
    lines.push(`  code={\`${escapedCode}\`}`);
    lines.push('/>');
    lines.push('');
  }

  // Remarks / Notes
  if (parsed.remarks) {
    lines.push('## Notes');
    lines.push('');
    lines.push(escapeMdxContent(parsed.remarks));
    lines.push('');
  }

  return lines.join('\n');
}

/**
 * Generate category metadata for a category directory.
 * Includes a unique key to avoid Docusaurus translation key conflicts
 * when the same category label exists across multiple packages.
 */
export function generateCategoryMeta(categoryPath: string, packageShortName: string): CategoryMeta {
  const label = capitalizeFirst(categoryPath);
  const position = CATEGORY_POSITIONS[categoryPath] || 99;

  return {
    label,
    position,
    collapsed: true,
    key: `${packageShortName}-${categoryPath}`,
  };
}

/**
 * Serialize a CategoryMeta to a JSON string for _category_.json.
 */
export function serializeCategoryJson(meta: CategoryMeta): string {
  return JSON.stringify(meta, null, 2) + '\n';
}

/** Escape pipe characters in markdown table cells. */
function escapeTableCell(text: string): string {
  return text.replace(/\|/g, '\\|').replace(/\n/g, ' ');
}

/** Escape backtick template literals for JSX embedding. */
function escapeTemplateLiteral(code: string): string {
  return code.replace(/`/g, '\\`').replace(/\$\{/g, '\\${');
}

/**
 * Escape content for safe MDX rendering.
 * MDX interprets bare `<` followed by alphanumeric as JSX tags.
 * Replaces `<` with `&lt;` outside of code blocks (``` fenced blocks).
 */
function escapeMdxContent(text: string): string {
  const lines = text.split('\n');
  const result: string[] = [];
  let inCodeBlock = false;

  for (const line of lines) {
    if (line.trim().startsWith('```')) {
      inCodeBlock = !inCodeBlock;
      result.push(line);
      continue;
    }
    if (inCodeBlock) {
      result.push(line);
    } else {
      // Escape < when followed by alphanumeric (would be parsed as JSX)
      result.push(line.replace(/<(?=[\w\d])/g, '&lt;'));
    }
  }

  return result.join('\n');
}

/** Capitalize the first letter of a string. */
function capitalizeFirst(str: string): string {
  return str.charAt(0).toUpperCase() + str.slice(1);
}
