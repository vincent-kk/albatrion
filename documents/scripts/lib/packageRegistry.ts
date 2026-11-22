import * as fs from 'node:fs';
import * as path from 'node:path';
import type { PackageEntry, SubPathEntry } from './types';

const MONOREPO_ROOT = path.resolve(__dirname, '..', '..', '..');
const DOCS_DIR = path.resolve(__dirname, '..', '..', 'docs');
const PACKAGES_DIR = path.join(MONOREPO_ROOT, 'packages');

/** Namespaces to include (aileron excluded) */
const TARGET_NAMESPACES = ['canard', 'lerx', 'winglet', 'slats'];

interface PkgJSON {
  name: string;
  version: string;
  exports?: Record<string, { types?: string; import?: { types?: string } } | string>;
}

/** Directories to scan; each defaults to this repository's own. */
interface RegistryRoots {
  /** Directory that holds `<namespace>/<package>/package.json`; defaults to the repository `packages` directory. */
  packagesDir?: string;
  /** Directory that holds `<namespace>/<package>/index.mdx`; defaults to `documents/docs`. */
  docsDir?: string;
}

/**
 * Discover all packages under packages/{namespace}/ and map them
 * to their .d.ts files and MDX doc paths. A package without a built main
 * .d.ts or without an `index.mdx` is left out; `listUnbuiltPackages` names
 * the documented ones among them.
 */
export function discoverPackages(roots: RegistryRoots = {}): PackageEntry[] {
  const packagesDir = roots.packagesDir ?? PACKAGES_DIR;
  const docsDir = roots.docsDir ?? DOCS_DIR;
  const entries: PackageEntry[] = [];

  for (const ns of TARGET_NAMESPACES) {
    for (const pkgDir of listPackageDirs(packagesDir, ns)) {
      const pkgJSONPath = path.join(packagesDir, ns, pkgDir, 'package.json');
      if (!fs.existsSync(pkgJSONPath)) continue;

      const pkgJSON: PkgJSON = JSON.parse(fs.readFileSync(pkgJSONPath, 'utf-8'));
      const pkgRoot = path.join(packagesDir, ns, pkgDir);

      // Documentation uses the import declaration graph; CommonJS companions share its API.
      const mainDtsPath = resolveMainDts(pkgJSON, pkgRoot);
      if (!mainDtsPath || !fs.existsSync(mainDtsPath)) continue;

      // Map to MDX doc path
      const mdxPath = path.join(docsDir, ns, pkgDir, 'index.mdx');
      if (!fs.existsSync(mdxPath)) continue;

      // Collect sub-path exports
      const subPaths = resolveSubPaths(pkgJSON, pkgRoot).filter(subPath => fs.existsSync(subPath.dtsPath));

      const name = pkgJSON.name;
      const namespace = ns;
      const shortName = pkgDir;

      entries.push({
        name,
        version: pkgJSON.version,
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

/**
 * Names the packages of a namespace that have a documentation page
 * (`<docsDir>/<namespace>/<package>/index.mdx`) but lack the main .d.ts or
 * the .d.ts of any sub-path export, so that a caller fails instead of
 * skipping them silently.
 *
 * @param namespace - Namespace directory under `packagesDir`, e.g. "winglet".
 * @param roots - Directories to scan; each defaults to this repository's own.
 * @returns Package names from their package.json, e.g. "@winglet/json", sorted.
 */
export function listUnbuiltPackages(namespace: string, roots: RegistryRoots = {}): string[] {
  const packagesDir = roots.packagesDir ?? PACKAGES_DIR;
  const docsDir = roots.docsDir ?? DOCS_DIR;
  const names: string[] = [];
  for (const pkgDir of listPackageDirs(packagesDir, namespace)) {
    const pkgRoot = path.join(packagesDir, namespace, pkgDir);
    const pkgJSONPath = path.join(pkgRoot, 'package.json');
    if (!fs.existsSync(pkgJSONPath) || !fs.existsSync(path.join(docsDir, namespace, pkgDir, 'index.mdx'))) continue;
    const pkgJSON: PkgJSON = JSON.parse(fs.readFileSync(pkgJSONPath, 'utf-8'));
    const declarationFiles = [resolveMainDts(pkgJSON, pkgRoot), ...resolveSubPaths(pkgJSON, pkgRoot).map(subPath => subPath.dtsPath)];
    if (declarationFiles.some(filePath => !fs.existsSync(filePath))) names.push(pkgJSON.name);
  }
  return names.sort();
}

/** Directory names under `<packagesDir>/<namespace>`; empty when the namespace directory does not exist. */
function listPackageDirs(packagesDir: string, namespace: string): string[] {
  const nsDir = path.join(packagesDir, namespace);
  if (!fs.existsSync(nsDir)) return [];
  return fs.readdirSync(nsDir, { withFileTypes: true })
    .filter(d => d.isDirectory())
    .map(d => d.name);
}

function resolveMainDts(pkgJSON: PkgJSON, pkgRoot: string): string {
  const exportsMap = pkgJSON.exports;
  if (exportsMap && exportsMap['.']) {
    const rootExport = exportsMap['.'];
    if (typeof rootExport === 'object') {
      const types = rootExport.import?.types ?? rootExport.types;
      if (types) return path.resolve(pkgRoot, types);
    }
  }
  // Fallback
  return path.join(pkgRoot, 'dist', 'index.d.ts');
}

/** Sub-path exports that declare a `types` file, in `exports` order, whether or not the file exists yet. */
function resolveSubPaths(pkgJSON: PkgJSON, pkgRoot: string): SubPathEntry[] {
  const exportsMap = pkgJSON.exports;
  if (!exportsMap) return [];

  const subPaths: SubPathEntry[] = [];

  for (const [exportKey, exportValue] of Object.entries(exportsMap)) {
    // Skip root export and package.json
    if (exportKey === '.' || exportKey === './package.json') continue;

    if (typeof exportValue === 'object') {
      const types = exportValue.import?.types ?? exportValue.types;
      if (types) subPaths.push({ exportKey, dtsPath: path.resolve(pkgRoot, types) });
    }
  }

  return subPaths;
}
