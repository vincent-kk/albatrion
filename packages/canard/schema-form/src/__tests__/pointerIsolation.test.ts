/** Loaded by Vitest; scans product source to keep pointer grammar in its owner. */
import { readFileSync, readdirSync } from 'node:fs';
import { join, relative, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import ts from 'typescript';
import { expect, it } from 'vitest';

/** Checkout-independent product source boundary. */
const sourceRoot = resolve(fileURLToPath(new URL('../', import.meta.url)));

/**
 * Enumerate product TypeScript without legacy and verification compartments.
 * @param directory - Existing source directory to scan recursively.
 * @returns Source files that can ship in the product.
 */
function walkFiles(directory: string): string[] {
  return readdirSync(directory, { withFileTypes: true }).flatMap((entry) => {
    if (entry.name === '__legacy__' || entry.name === '__tests__') return [];
    const file = join(directory, entry.name);
    return entry.isDirectory()
      ? walkFiles(file)
      : /\.tsx?$/.test(entry.name) && !/\.(test|spec)\./.test(entry.name)
        ? [file]
        : [];
  });
}

/**
 * Find pointer interpretation and construction outside the owning fractal.
 * @param file - Product source file outside helpers/jsonPointer.
 * @param content - Source text override for forbidden-pattern regression probes.
 * @returns File/line findings suitable for a migration checklist.
 */
function findViolations(
  file: string,
  content = readFileSync(file, 'utf8'),
): string[] {
  const source = ts.createSourceFile(
    file,
    content,
    ts.ScriptTarget.Latest,
    true,
  );
  const violations: string[] = [];
  const separators = new Set<string>();
  const record = (node: ts.Node, rule: string): void => {
    const line = source.getLineAndCharacterOfPosition(node.getStart()).line + 1;
    violations.push(`${relative(sourceRoot, file)}:${line}: ${rule}`);
  };
  const separator = (node: ts.Node): boolean =>
    (ts.isStringLiteralLike(node) && node.text === '/') ||
    (ts.isPropertyAccessExpression(node) && node.name.text === 'Separator') ||
    (ts.isIdentifier(node) && separators.has(node.text));
  const visit = (node: ts.Node): void => {
    if (
      ts.isVariableDeclaration(node) &&
      ts.isIdentifier(node.name) &&
      node.initializer &&
      separator(node.initializer)
    )
      separators.add(node.name.text);
    if (
      ts.isImportDeclaration(node) &&
      ts.isStringLiteral(node.moduleSpecifier) &&
      /^@winglet\/json\/(pointer|pointer-escape)$/.test(
        node.moduleSpecifier.text,
      )
    )
      record(node, 'external pointer implementation');
    if (
      ts.isIdentifier(node) &&
      /^(ESCAPED_SLASH_REGEX|ESCAPED_TILDE_REGEX|SLASH_REGEX|TILDE_REGEX)$/.test(
        node.text,
      )
    )
      record(node, 'private escape implementation');
    if (
      node.kind === ts.SyntaxKind.RegularExpressionLiteral &&
      /~[01]/.test(node.getText(source))
    )
      record(node, 'inline tilde decoding expression');
    if (
      ts.isNewExpression(node) &&
      ts.isIdentifier(node.expression) &&
      node.expression.text === 'RegExp' &&
      node.arguments?.some(
        (argument) =>
          ts.isStringLiteralLike(argument) && /~[01]/.test(argument.text),
      )
    )
      record(node, 'constructed tilde decoding expression');
    if (
      ts.isCallExpression(node) &&
      ts.isPropertyAccessExpression(node.expression)
    ) {
      const method = node.expression.name.text;
      const argument = node.arguments[0];
      if (
        ['split', 'join', 'indexOf', 'lastIndexOf'].includes(method) &&
        argument &&
        separator(argument)
      )
        record(node, `pointer ${method}`);
      if (
        ['includes', 'startsWith', 'endsWith', 'indexOf'].includes(method) &&
        argument &&
        ts.isStringLiteralLike(argument) &&
        /(^|\/)\*(\/|$)/.test(argument.text) &&
        /path|pointer/i.test(node.expression.expression.getText(source))
      )
        record(node, 'raw wildcard interpretation');
      if (
        ['replace', 'replaceAll'].includes(method) &&
        node.arguments.some(
          (argument) =>
            ts.isStringLiteralLike(argument) && /^~[01]$/.test(argument.text),
        )
      )
        record(node, 'inline tilde escaping');
    }
    if (
      ts.isCallExpression(node) &&
      ts.isPropertyAccessExpression(node.expression) &&
      ['replace', 'replaceAll'].includes(node.expression.name.text) &&
      /path|pointer|segment|encoded|token/i.test(
        node.expression.expression.getText(source),
      ) &&
      node.arguments
        .slice(1)
        .some(
          (argument) =>
            ts.isStringLiteralLike(argument) &&
            (argument.text === '/' || argument.text === '~'),
        )
    )
      record(node, 'dynamic pointer escape implementation');
    if (ts.isBinaryExpression(node)) {
      const equality = [
        ts.SyntaxKind.EqualsEqualsToken,
        ts.SyntaxKind.EqualsEqualsEqualsToken,
        ts.SyntaxKind.ExclamationEqualsToken,
        ts.SyntaxKind.ExclamationEqualsEqualsToken,
      ].includes(node.operatorToken.kind);
      const literal = ts.isStringLiteralLike(node.left)
        ? node.left
        : ts.isStringLiteralLike(node.right)
          ? node.right
          : undefined;
      const operand = literal === node.left ? node.right : node.left;
      if (
        equality &&
        literal &&
        ['*', '..', '.', '@'].includes(literal.text) &&
        /(?:path|pointer|segment|token|dependency|watched)/i.test(
          operand.getText(source),
        )
      )
        record(node, 'raw literal operator comparison');

      const left = node.left.getText(source);
      const right = node.right.getText(source);
      if (
        node.operatorToken.kind === ts.SyntaxKind.PlusToken &&
        ((ts.isStringLiteralLike(node.right) &&
          node.right.text.startsWith('/') &&
          /path|pointer|suffix|prefix|appendSegment|appendFormattedSegment|joinPointer/i.test(left)) ||
          (ts.isStringLiteralLike(node.left) &&
            node.left.text === '/' &&
            /path|pointer|segment|encoded|name|index/i.test(right)))
      )
        record(node, 'pointer concatenation');
      if (
        [
          ts.SyntaxKind.EqualsEqualsToken,
          ts.SyntaxKind.EqualsEqualsEqualsToken,
          ts.SyntaxKind.ExclamationEqualsToken,
          ts.SyntaxKind.ExclamationEqualsEqualsToken,
        ].includes(node.operatorToken.kind) &&
        /(?:\$|JSONPointer)\.(?:Wildcard|Parent|Current|Context)\b/.test(
          left + right,
        )
      )
        record(node, 'raw operator comparison');
    }
    ts.forEachChild(node, visit);
  };
  visit(source);
  return violations;
}

it('keeps pointer parsing and construction inside helpers/jsonPointer', () => {
  const violations = walkFiles(sourceRoot)
    .filter(
      (file) => !relative(sourceRoot, file).startsWith('helpers/jsonPointer/'),
    )
    .flatMap((file) => findViolations(file));
  expect(violations).toEqual([]);
});

it('rejects literal and constructed tilde decoders outside the pointer owner', () => {
  const violations = findViolations(
    join(sourceRoot, 'pointer-probe.ts'),
    [
      "const path = input.replace(/~1/g, '/');",
      "const decoder = new RegExp('~0', 'g');",
      "const segment = path.replace(new RegExp(pattern), '~');",
      "const encoded = segment.replaceAll(pattern, '/');",
    ].join('\n'),
  );
  expect(
    violations.some((finding) =>
      finding.includes('inline tilde decoding expression'),
    ),
  ).toBe(true);
  expect(
    violations.some((finding) =>
      finding.includes('constructed tilde decoding expression'),
    ),
  ).toBe(true);
  expect(
    violations.filter((finding) =>
      finding.includes('dynamic pointer escape implementation'),
    ),
  ).toHaveLength(2);
});

it('rejects separator construction after a centralized builder result', () => {
  const violations = findViolations(
    join(sourceRoot, 'pointer-probe.ts'),
    "const match = address.startsWith(appendSegment(base, name) + '/');",
  );
  expect(violations.some((finding) => finding.includes('pointer concatenation'))).toBe(true);
});
