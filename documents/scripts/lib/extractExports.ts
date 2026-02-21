import * as fs from 'node:fs';
import type { ExportedSymbol } from './types';

/**
 * Extract exported symbols from a .d.ts file using regex patterns.
 * Handles: export declare function/class/const/type/interface/enum,
 * named re-exports (export { X } from), and barrel re-exports (export * from).
 */
export function extractExports(dtsPath: string): ExportedSymbol[] {
  const content = fs.readFileSync(dtsPath, 'utf-8');
  const symbols: ExportedSymbol[] = [];
  const lines = content.split('\n');

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];

    // Skip empty lines and pure comments
    if (!line.trim() || line.trim().startsWith('//')) continue;

    // Collect preceding JSDoc
    const jsdoc = collectJSDoc(lines, i);

    // Pattern 1: export declare function name(...)
    const funcMatch = line.match(
      /^export\s+declare\s+function\s+(\w+)\s*(<[^>]*>)?\s*\(([^)]*)\)\s*:\s*(.+?);?\s*$/
    );
    if (funcMatch) {
      symbols.push({
        name: funcMatch[1],
        kind: 'function',
        signature: `${funcMatch[1]}${funcMatch[2] || ''}(${funcMatch[3]}): ${funcMatch[4].replace(/;$/, '')}`,
        jsdoc,
      });
      continue;
    }

    // Pattern 1b: multi-line function (just capture name)
    const funcStartMatch = line.match(
      /^export\s+declare\s+function\s+(\w+)\s*(<[^>]*>)?\s*\(/
    );
    if (funcStartMatch && !funcMatch) {
      symbols.push({
        name: funcStartMatch[1],
        kind: 'function',
        jsdoc,
      });
      continue;
    }

    // Pattern 2: export declare class Name
    const classMatch = line.match(/^export\s+declare\s+class\s+(\w+)/);
    if (classMatch) {
      symbols.push({ name: classMatch[1], kind: 'class', jsdoc });
      continue;
    }

    // Pattern 3: export declare const name
    const constMatch = line.match(
      /^export\s+declare\s+const\s+(\w+)\s*:\s*(.+?);?\s*$/
    );
    if (constMatch) {
      symbols.push({
        name: constMatch[1],
        kind: 'const',
        signature: constMatch[2].replace(/;$/, ''),
        jsdoc,
      });
      continue;
    }

    // Pattern 3b: export declare const (multi-line)
    const constStartMatch = line.match(
      /^export\s+declare\s+const\s+(\w+)\s*:/
    );
    if (constStartMatch && !constMatch) {
      symbols.push({ name: constStartMatch[1], kind: 'const', jsdoc });
      continue;
    }

    // Pattern 4: export declare enum Name
    const enumMatch = line.match(/^export\s+declare\s+enum\s+(\w+)/);
    if (enumMatch) {
      symbols.push({ name: enumMatch[1], kind: 'enum', jsdoc });
      continue;
    }

    // Pattern 5: export declare type Name = ...
    const typeMatch = line.match(/^export\s+declare\s+type\s+(\w+)/);
    if (typeMatch) {
      symbols.push({ name: typeMatch[1], kind: 'type', jsdoc });
      continue;
    }

    // Pattern 6: export type Name = ...
    const typeAliasMatch = line.match(/^export\s+type\s+(\w+)\s*[<=]/);
    if (typeAliasMatch) {
      symbols.push({ name: typeAliasMatch[1], kind: 'type', jsdoc });
      continue;
    }

    // Pattern 7: export interface Name
    const interfaceMatch = line.match(/^export\s+(declare\s+)?interface\s+(\w+)/);
    if (interfaceMatch) {
      symbols.push({ name: interfaceMatch[2], kind: 'interface', jsdoc });
      continue;
    }

    // Pattern 8: export { Name, Name2 } from './module'
    // Also handles: export { type Name, Name2 } from './module'
    const namedReExportMatch = line.match(
      /^export\s+\{([^}]+)\}\s+from\s+['"]/
    );
    if (namedReExportMatch) {
      const names = namedReExportMatch[1].split(',').map(s => s.trim());
      for (const raw of names) {
        if (!raw) continue;
        // Handle "type Name" and "type Name as Alias"
        const isType = raw.startsWith('type ');
        const cleaned = raw.replace(/^type\s+/, '');
        const asMatch = cleaned.match(/^(\w+)\s+as\s+(\w+)$/);
        const name = asMatch ? asMatch[2] : cleaned.trim();
        if (name) {
          symbols.push({ name, kind: isType ? 'type' : 're-export' });
        }
      }
      continue;
    }

    // Pattern 9: export type { Name } from './module'
    const typeReExportMatch = line.match(
      /^export\s+type\s+\{([^}]+)\}\s+from\s+['"]/
    );
    if (typeReExportMatch) {
      const names = typeReExportMatch[1].split(',').map(s => s.trim());
      for (const raw of names) {
        if (!raw) continue;
        const asMatch = raw.match(/^(\w+)\s+as\s+(\w+)$/);
        const name = asMatch ? asMatch[2] : raw.trim();
        if (name) {
          symbols.push({ name, kind: 'type' });
        }
      }
      continue;
    }

    // Pattern 10: export type * from './module' (type-only wildcard)
    if (line.match(/^export\s+type\s+\*\s+from\s+['"]/)) {
      // We can't extract individual names from wildcard type re-exports
      // These are folded into the root barrel — skip
      continue;
    }

    // Pattern 11: export * from './module' (wildcard re-export)
    // Skip — symbols will be extracted from the sub-path .d.ts directly
    if (line.match(/^export\s+\*\s+from\s+['"]/)) {
      continue;
    }
  }

  // Deduplicate by name (re-exports may overlap with declarations)
  const seen = new Set<string>();
  return symbols.filter(s => {
    if (seen.has(s.name)) return false;
    seen.add(s.name);
    return true;
  });
}

function collectJSDoc(lines: string[], currentIndex: number): string | undefined {
  // Walk backwards to find JSDoc block ending with */
  let endIdx = currentIndex - 1;
  while (endIdx >= 0 && lines[endIdx].trim() === '') endIdx--;
  if (endIdx < 0 || !lines[endIdx].trim().endsWith('*/')) return undefined;

  // Find the start of the JSDoc block
  let startIdx = endIdx;
  while (startIdx > 0 && !lines[startIdx].trim().startsWith('/**')) startIdx--;
  if (!lines[startIdx].trim().startsWith('/**')) return undefined;

  // Extract the first meaningful line (skip @param, @returns etc.)
  for (let j = startIdx; j <= endIdx; j++) {
    const stripped = lines[j]
      .trim()
      .replace(/^\/\*\*\s*/, '')
      .replace(/^\*\/\s*$/, '')
      .replace(/^\*\s?/, '')
      .trim();
    if (stripped && !stripped.startsWith('@') && !stripped.startsWith('*')) {
      return stripped;
    }
  }
  return undefined;
}
