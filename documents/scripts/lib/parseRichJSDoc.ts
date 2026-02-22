import * as ts from 'typescript';
import * as fs from 'node:fs';
import type { ParsedFunction, ParamInfo, ReturnInfo, TemplateInfo, Example } from './types';

/**
 * Parse a .d.ts file and extract rich JSDoc information for each exported declaration.
 */
export function parseRichJSDoc(
  dtsPath: string,
  packageName: string,
  packageVersion: string,
  categoryPath: string,
): ParsedFunction[] {
  const content = fs.readFileSync(dtsPath, 'utf-8');
  const sourceFile = ts.createSourceFile(
    dtsPath,
    content,
    ts.ScriptTarget.Latest,
    true,
    ts.ScriptKind.TS,
  );

  const resultMap = new Map<string, ParsedFunction>();

  ts.forEachChild(sourceFile, (node) => {
    if (!isExportedDeclaration(node)) return;

    const info = extractDeclarationInfo(node, sourceFile, content);
    if (!info) return;

    const entry: ParsedFunction = {
      ...info,
      packageName,
      packageVersion,
      categoryPath,
      sourceFile: dtsPath,
    };

    // Deduplicate by name: prefer the entry with richer JSDoc
    const existing = resultMap.get(info.name);
    if (!existing || info.description.length > existing.description.length) {
      resultMap.set(info.name, entry);
    }
  });

  return Array.from(resultMap.values());
}

/** Check if a node is an exported declaration. */
function isExportedDeclaration(node: ts.Node): boolean {
  const modifiers = ts.canHaveModifiers(node) ? ts.getModifiers(node) : undefined;
  if (!modifiers) return false;
  return modifiers.some(m => m.kind === ts.SyntaxKind.ExportKeyword);
}

/** Extract declaration info including JSDoc from a node. */
function extractDeclarationInfo(
  node: ts.Node,
  sourceFile: ts.SourceFile,
  fullText: string,
): Omit<ParsedFunction, 'packageName' | 'packageVersion' | 'categoryPath' | 'sourceFile'> | null {
  const name = getDeclarationName(node);
  if (!name) return null;

  const kind = getDeclarationKind(node);
  const typeSignature = extractTypeSignature(node, sourceFile, fullText);
  const jsdoc = extractJSDocComment(node, fullText);

  const description = jsdoc ? parseDescription(jsdoc) : '';
  const params = jsdoc ? parseParams(jsdoc) : [];
  const returns = jsdoc ? parseReturns(jsdoc) : undefined;
  const templates = jsdoc ? parseTemplates(jsdoc) : [];
  const examples = jsdoc ? parseExamples(jsdoc) : [];
  const remarks = jsdoc ? parseRemarks(jsdoc) : undefined;

  return {
    name,
    kind,
    description,
    typeSignature,
    params,
    returns,
    templates,
    examples,
    remarks,
  };
}

/** Get the name of a declaration node. */
function getDeclarationName(node: ts.Node): string | null {
  if (ts.isVariableStatement(node)) {
    const decl = node.declarationList.declarations[0];
    return decl && ts.isIdentifier(decl.name) ? decl.name.text : null;
  }
  if (ts.isFunctionDeclaration(node) && node.name) return node.name.text;
  if (ts.isClassDeclaration(node) && node.name) return node.name.text;
  if (ts.isTypeAliasDeclaration(node)) return node.name.text;
  if (ts.isInterfaceDeclaration(node)) return node.name.text;
  if (ts.isEnumDeclaration(node)) return node.name.text;
  return null;
}

/** Determine the kind of a declaration. */
function getDeclarationKind(node: ts.Node): ParsedFunction['kind'] {
  if (ts.isFunctionDeclaration(node)) return 'function';
  if (ts.isClassDeclaration(node)) return 'class';
  if (ts.isTypeAliasDeclaration(node)) return 'type';
  if (ts.isInterfaceDeclaration(node)) return 'interface';
  if (ts.isEnumDeclaration(node)) return 'enum';
  if (ts.isVariableStatement(node)) {
    const decl = node.declarationList.declarations[0];
    if (decl && decl.type) {
      const typeText = decl.type.getText();
      // If the type annotation is a function signature, treat as function
      if (typeText.includes('=>') || typeText.includes('(...')) return 'function';
    }
    return 'const';
  }
  return 'const';
}

/** Extract the type signature text from a declaration. */
function extractTypeSignature(
  node: ts.Node,
  sourceFile: ts.SourceFile,
  _fullText: string,
): string {
  if (ts.isVariableStatement(node)) {
    const decl = node.declarationList.declarations[0];
    if (decl && decl.type) {
      const name = ts.isIdentifier(decl.name) ? decl.name.text : 'unknown';
      const typeText = decl.type.getText(sourceFile);
      return `const ${name}: ${typeText}`;
    }
  }
  if (ts.isFunctionDeclaration(node)) {
    const name = node.name?.text || 'unknown';
    const typeParams = node.typeParameters
      ? `<${node.typeParameters.map(tp => tp.getText(sourceFile)).join(', ')}>`
      : '';
    const params = node.parameters
      .map(p => p.getText(sourceFile))
      .join(', ');
    const returnType = node.type ? node.type.getText(sourceFile) : 'void';
    return `function ${name}${typeParams}(${params}): ${returnType}`;
  }
  if (ts.isTypeAliasDeclaration(node)) {
    return node.getText(sourceFile).replace(/^export\s+declare\s+/, '').replace(/;$/, '');
  }
  if (ts.isInterfaceDeclaration(node)) {
    return node.getText(sourceFile).replace(/^export\s+declare\s+/, '').replace(/^export\s+/, '');
  }
  if (ts.isClassDeclaration(node)) {
    // Just return class header, not full body
    const name = node.name?.text || 'unknown';
    const heritage = node.heritageClauses
      ? ' ' + node.heritageClauses.map(h => h.getText(sourceFile)).join(' ')
      : '';
    return `class ${name}${heritage}`;
  }
  if (ts.isEnumDeclaration(node)) {
    return node.getText(sourceFile).replace(/^export\s+declare\s+/, '');
  }
  // Fallback: strip export declare prefix
  const text = node.getText(sourceFile);
  return text.replace(/^export\s+declare\s+/, '').replace(/;$/, '');
}

/** Extract the full JSDoc comment block preceding a node. */
function extractJSDocComment(node: ts.Node, fullText: string): string | null {
  const nodeStart = node.getFullStart();
  const leadingText = fullText.substring(0, nodeStart + node.getLeadingTriviaWidth());

  // Find the last JSDoc block before this node
  const jsdocRegex = /\/\*\*[\s\S]*?\*\//g;
  let lastMatch: RegExpExecArray | null = null;
  let match: RegExpExecArray | null;

  while ((match = jsdocRegex.exec(leadingText)) !== null) {
    lastMatch = match;
  }

  if (!lastMatch) return null;

  // Verify the JSDoc block is close to the node (no other code between)
  const textBetween = leadingText.substring(lastMatch.index + lastMatch[0].length).trim();
  if (textBetween.length > 0) return null;

  return lastMatch[0];
}

/** Parse description text from JSDoc (text before the first @tag). */
function parseDescription(jsdoc: string): string {
  const lines = jsdoc.split('\n');
  const descLines: string[] = [];

  for (const line of lines) {
    const stripped = line.replace(/^\s*\/\*\*\s*/, '').replace(/\s*\*\/\s*$/, '').replace(/^\s*\*\s?/, '').trim();
    if (stripped.startsWith('@')) break;
    if (stripped) descLines.push(stripped);
  }

  return descLines.join('\n');
}

/** Parse @param tags from JSDoc. */
function parseParams(jsdoc: string): ParamInfo[] {
  const params: ParamInfo[] = [];
  const paramRegex = /@param\s+(?:\{([^}]*)\}\s+)?(\w+(?:\.\w+)*)\s*-?\s*([\s\S]*?)(?=\n\s*\*\s*@|\n\s*\*\/|\n\s*\*\s*\n)/g;

  let match;
  while ((match = paramRegex.exec(jsdoc)) !== null) {
    const type = match[1]?.trim() || '';
    const name = match[2].trim();
    const description = match[3].trim()
      .split('\n')
      .map(l => l.replace(/^\s*\*\s?/, '').trim())
      .join(' ')
      .trim();

    // Skip sub-property params like options.signal
    if (name.includes('.')) continue;

    params.push({ name, type, description });
  }

  return params;
}

/** Parse @returns tag from JSDoc. */
function parseReturns(jsdoc: string): ReturnInfo | undefined {
  const returnsRegex = /@returns?\s+(?:\{([^}]*)\}\s+)?-?\s*([\s\S]*?)(?=\n\s*\*\s*@|\n\s*\*\/|\n\s*\*\s*\n)/;
  const match = jsdoc.match(returnsRegex);
  if (!match) return undefined;

  const type = match[1]?.trim() || '';
  const description = match[2].trim()
    .split('\n')
    .map(l => l.replace(/^\s*\*\s?/, '').trim())
    .join(' ')
    .trim();

  return { type, description };
}

/** Parse @template tags from JSDoc. */
function parseTemplates(jsdoc: string): TemplateInfo[] {
  const templates: TemplateInfo[] = [];
  const templateRegex = /@template\s+(\w+)\s*-?\s*([\s\S]*?)(?=\n\s*\*\s*@|\n\s*\*\/|\n\s*\*\s*\n)/g;

  let match;
  while ((match = templateRegex.exec(jsdoc)) !== null) {
    const name = match[1].trim();
    const description = match[2].trim()
      .split('\n')
      .map(l => l.replace(/^\s*\*\s?/, '').trim())
      .join(' ')
      .trim();
    templates.push({ name, description });
  }

  return templates;
}

/** Parse @example blocks from JSDoc. */
function parseExamples(jsdoc: string): Example[] {
  const examples: Example[] = [];

  // Split on @example boundaries
  const exampleParts = jsdoc.split(/@example\b/);
  // Skip the first part (before any @example)
  for (let i = 1; i < exampleParts.length; i++) {
    const part = exampleParts[i];

    // Find the end: next @tag or end of JSDoc
    const endIdx = findNextTagIndex(part);
    const exampleText = endIdx !== -1 ? part.substring(0, endIdx) : part;

    // Clean up the lines
    const cleanLines = exampleText
      .split('\n')
      .map(l => l.replace(/^\s*\*\s?/, '').replace(/\s*\*\/\s*$/, ''))
      .filter(l => l !== undefined);

    // Find title (text before ```)
    const titleLines: string[] = [];
    const codeLines: string[] = [];
    let inCode = false;
    let codeFound = false;

    for (const line of cleanLines) {
      const trimmed = line.trim();
      if (!inCode && trimmed.startsWith('```')) {
        inCode = true;
        codeFound = true;
        continue;
      }
      if (inCode && trimmed.startsWith('```')) {
        inCode = false;
        continue;
      }
      if (inCode) {
        codeLines.push(line);
      } else if (!codeFound && trimmed) {
        titleLines.push(trimmed);
      }
    }

    const title = titleLines.join(' ').replace(/:$/, '').trim();
    const code = codeLines.join('\n').trim();

    if (code) {
      examples.push({ title: title || `Example ${i}`, code });
    }
  }

  return examples;
}

/** Find the index of the next @tag in text (excluding @example). */
function findNextTagIndex(text: string): number {
  const tagRegex = /\n\s*\*\s*@(?!example\b)(\w+)/g;
  const match = tagRegex.exec(text);
  return match ? match.index : -1;
}

/** Parse @remarks text from JSDoc. */
function parseRemarks(jsdoc: string): string | undefined {
  const remarksRegex = /@remarks\s+([\s\S]*?)(?=\n\s*\*\s*@(?!remarks)|\n\s*\*\/)/;
  const match = jsdoc.match(remarksRegex);
  if (!match) return undefined;

  const text = match[1]
    .split('\n')
    .map(l => l.replace(/^\s*\*\s?/, ''))
    .join('\n')
    .trim();

  return text || undefined;
}
