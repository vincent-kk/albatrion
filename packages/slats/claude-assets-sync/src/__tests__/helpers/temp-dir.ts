import { mkdirSync, mkdtempSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';

import type { PackageInfo, SyncMeta } from '../../utils/types';

/**
 * Create a temporary directory for testing
 */
export const createTempDir = (): string =>
  mkdtempSync(join(tmpdir(), 'claude-assets-sync-test-'));

/**
 * Remove a temporary directory
 */
export const removeTempDir = (dirPath: string): void => {
  rmSync(dirPath, { recursive: true, force: true });
};

/**
 * Setup a mock project with node_modules
 */
export const setupMockProject = (
  tempDir: string,
  packages: PackageInfo[],
): void => {
  // Create node_modules directory
  const nodeModulesDir = join(tempDir, 'node_modules');
  mkdirSync(nodeModulesDir, { recursive: true });

  // Create package directories with package.json files
  for (const pkg of packages) {
    const pkgDir = join(nodeModulesDir, pkg.name);
    mkdirSync(pkgDir, { recursive: true });
    writeFileSync(join(pkgDir, 'package.json'), JSON.stringify(pkg, null, 2));
  }
};

/**
 * Setup existing sync meta for a package
 */
export const setupExistingSyncMeta = (
  tempDir: string,
  packageName: string,
  assetType: 'commands' | 'skills',
  meta: SyncMeta,
): void => {
  const [scope, name] = packageName.startsWith('@')
    ? packageName.split('/')
    : ['', packageName];

  const destDir = scope
    ? join(tempDir, '.claude', assetType, scope, name)
    : join(tempDir, '.claude', assetType, name);

  mkdirSync(destDir, { recursive: true });
  writeFileSync(
    join(destDir, '.sync-meta.json'),
    JSON.stringify(meta, null, 2),
  );
};

/**
 * Create a test fixture for full E2E testing
 */
export interface TestFixture {
  tempDir: string;
  cleanup: () => void;
}

/**
 * Setup local docs in node_modules for testing local source logic
 */
export const setupLocalDocs = (
  tempDir: string,
  packageName: string,
  assetPath: string,
  docs: Record<string, Record<string, string>>,
): void => {
  const docsDir = join(tempDir, 'node_modules', packageName, assetPath);
  for (const [assetType, files] of Object.entries(docs)) {
    const assetDir = join(docsDir, assetType);
    mkdirSync(assetDir, { recursive: true });
    for (const [fileName, content] of Object.entries(files)) {
      writeFileSync(join(assetDir, fileName), content);
    }
  }
};

export const createTestFixture = (
  packages: PackageInfo[] = [],
): TestFixture => {
  const tempDir = createTempDir();

  if (packages.length > 0) {
    setupMockProject(tempDir, packages);
  }

  return {
    tempDir,
    cleanup: () => removeTempDir(tempDir),
  };
};
