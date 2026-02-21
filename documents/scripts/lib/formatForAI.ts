import type { PackageEntry, SubPathExports } from './types';

/**
 * Format extracted exports into a ForAI markdown section.
 * Matches the existing ForAI style used across the documentation.
 */
export function formatForAI(
  pkg: PackageEntry,
  allExports: SubPathExports[],
): string {
  const lines: string[] = [];

  lines.push('');
  lines.push('## AI Reference');
  lines.push('');
  lines.push(`**Package**: \`${pkg.name}\` v${pkg.version}`);

  // Build purpose line from package name
  const purpose = inferPurpose(pkg);
  if (purpose) {
    lines.push(`**Purpose**: ${purpose}`);
  }

  // Sub-path exports section
  if (pkg.subPaths.length > 0) {
    lines.push('');
    lines.push('### Key exports');
    lines.push('```');

    for (const sp of allExports) {
      const label = sp.exportKey === '.' ? 'Main export' : sp.exportKey;
      const symbolSummaries = sp.symbols
        .slice(0, 20) // cap at 20 per sub-path to avoid bloat
        .map(s => formatSymbolLine(s));

      if (symbolSummaries.length > 0) {
        lines.push(`${label} → ${symbolSummaries[0]}`);
        for (let i = 1; i < symbolSummaries.length; i++) {
          lines.push(`${' '.repeat(label.length + 3)}${symbolSummaries[i]}`);
        }
      }
    }

    lines.push('```');
  } else {
    // Single-export package — list all symbols
    const rootExports = allExports.find(e => e.exportKey === '.');
    if (rootExports && rootExports.symbols.length > 0) {
      lines.push('');
      lines.push('### Exports');
      lines.push('```ts');
      for (const sym of rootExports.symbols.slice(0, 30)) {
        lines.push(formatTypescriptExportLine(sym, pkg.name));
      }
      lines.push('```');
    }
  }

  lines.push('');
  return lines.join('\n');
}

function formatSymbolLine(sym: { name: string; kind: string; signature?: string; jsdoc?: string }): string {
  const desc = sym.jsdoc ? ` — ${sym.jsdoc}` : '';
  if (sym.signature && sym.kind === 'function') {
    return `${sym.name}(${extractParams(sym.signature)})${desc}`;
  }
  if (sym.kind === 'class') {
    return `${sym.name} (class)${desc}`;
  }
  if (sym.kind === 'type' || sym.kind === 'interface') {
    return `${sym.name} (type)${desc}`;
  }
  if (sym.kind === 'enum') {
    return `${sym.name} (enum)${desc}`;
  }
  return `${sym.name}${desc}`;
}

function formatTypescriptExportLine(
  sym: { name: string; kind: string; signature?: string },
  pkgName: string,
): string {
  if (sym.kind === 'type' || sym.kind === 'interface') {
    return `import type { ${sym.name} } from '${pkgName}';`;
  }
  return `import { ${sym.name} } from '${pkgName}';`;
}

function extractParams(signature: string): string {
  const match = signature.match(/\(([^)]*)\)/);
  if (!match) return '...';
  const params = match[1].trim();
  // Simplify long parameter lists
  if (params.length > 60) {
    const paramNames = params.split(',').map(p => {
      const name = p.trim().split(/[:\s]/)[0];
      return name;
    });
    return paramNames.join(', ');
  }
  return params;
}

function inferPurpose(pkg: PackageEntry): string | null {
  // Simple heuristic mapping from package name
  const purposeMap: Record<string, string> = {
    '@winglet/common-utils': 'General-purpose TypeScript utility functions.',
    '@winglet/react-utils': 'React hooks, HOCs, portal system, and render utilities.',
    '@winglet/json': 'RFC 6901 JSON Pointer and RFC 6902 JSON Patch with security protections.',
    '@winglet/json-schema': 'JSON Schema traversal, type-guard filters, and $ref resolution.',
    '@winglet/data-loader': 'Request batching and caching for async data fetching.',
    '@winglet/style-utils': 'Scoped CSS injection, CSS compression, and className utilities.',
    '@canard/schema-form': 'JSON Schema-driven dynamic form generation for React.',
    '@lerx/promise-modal': 'Promise-based modal management for React.',
    '@slats/claude-assets-sync': 'Claude Code asset synchronization CLI tool.',
  };
  return purposeMap[pkg.name] || null;
}
