import * as fs from 'node:fs';
import * as path from 'node:path';
import type { PackageEntry, SubPathEntry } from './types';

const MONOREPO_ROOT = path.resolve(__dirname, '..', '..', '..');
const DOCS_DIR = path.resolve(__dirname, '..', '..', 'docs');
const PACKAGES_DIR = path.join(MONOREPO_ROOT, 'packages');

/** Namespaces to include (aileron excluded) */
const TARGET_NAMESPACES = ['canard', 'lerx', 'winglet', 'slats'];

interface PkgJson {
  name: string;
  version: string;
  exports?: Record<string, { types?: string } | string>;
}

/**
 * Discover all packages under packages/{namespace}/ and map them
 * to their .d.ts files and MDX doc paths.
 */
export function discoverPackages(): PackageEntry[] {
  const entries: PackageEntry[] = [];

  for (const ns of TARGET_NAMESPACES) {
    const nsDir = path.join(PACKAGES_DIR, ns);
    if (!fs.existsSync(nsDir)) continue;

    const pkgDirs = fs.readdirSync(nsDir, { withFileTypes: true })
      .filter(d => d.isDirectory())
      .map(d => d.name);

    for (const pkgDir of pkgDirs) {
      const pkgJsonPath = path.join(nsDir, pkgDir, 'package.json');
      if (!fs.existsSync(pkgJsonPath)) continue;

      const pkgJson: PkgJson = JSON.parse(fs.readFileSync(pkgJsonPath, 'utf-8'));
      const pkgRoot = path.join(nsDir, pkgDir);

      // Find main .d.ts via exports["."].types or fallback to dist/index.d.ts
      const mainDtsPath = resolveMainDts(pkgJson, pkgRoot);
      if (!mainDtsPath || !fs.existsSync(mainDtsPath)) continue;

      // Map to MDX doc path
      const mdxPath = path.join(DOCS_DIR, ns, pkgDir, 'index.mdx');
      if (!fs.existsSync(mdxPath)) continue;

      // Collect sub-path exports
      const subPaths = resolveSubPaths(pkgJson, pkgRoot);

      const name = pkgJson.name;
      const namespace = ns;
      const shortName = pkgDir;

      entries.push({
        name,
        version: pkgJson.version,
        namespace,
        shortName,
        mainDtsPath,
        mdxPath,
        subPaths,
      });
    }
  }

  return entries.sort((a, b) => a.name.localeCompare(b.name));
}

function resolveMainDts(pkgJson: PkgJson, pkgRoot: string): string | null {
  const exportsMap = pkgJson.exports;
  if (exportsMap && exportsMap['.']) {
    const rootExport = exportsMap['.'];
    if (typeof rootExport === 'object' && rootExport.types) {
      return path.resolve(pkgRoot, rootExport.types);
    }
  }
  // Fallback
  return path.join(pkgRoot, 'dist', 'index.d.ts');
}

function resolveSubPaths(pkgJson: PkgJson, pkgRoot: string): SubPathEntry[] {
  const exportsMap = pkgJson.exports;
  if (!exportsMap) return [];

  const subPaths: SubPathEntry[] = [];

  for (const [exportKey, exportValue] of Object.entries(exportsMap)) {
    // Skip root export and package.json
    if (exportKey === '.' || exportKey === './package.json') continue;

    if (typeof exportValue === 'object' && exportValue.types) {
      const dtsPath = path.resolve(pkgRoot, exportValue.types);
      if (fs.existsSync(dtsPath)) {
        subPaths.push({ exportKey, dtsPath });
      }
    }
  }

  return subPaths;
}
