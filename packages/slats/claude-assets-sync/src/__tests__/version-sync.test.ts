import { readFileSync } from 'node:fs';
import { join } from 'node:path';

import { describe, expect, it } from 'vitest';

describe('Version Synchronization', () => {
  const projectRoot = join(__dirname, '..', '..');

  it('should have matching version between package.json and version.ts', () => {
    // Read package.json version
    const packageJsonPath = join(projectRoot, 'package.json');
    const packageJson = JSON.parse(readFileSync(packageJsonPath, 'utf-8'));
    const packageVersion = packageJson.version;

    expect(packageVersion).toBeDefined();
    expect(packageVersion).toMatch(/^\d+\.\d+\.\d+/);

    // Read version.ts VERSION constant
    const versionPath = join(projectRoot, 'src', 'version.ts');
    const versionContent = readFileSync(versionPath, 'utf-8');

    const versionRegex = /export const VERSION = ['"]([^'"]+)['"]/;
    const match = versionContent.match(versionRegex);

    expect(match).toBeDefined();
    expect(match).toHaveLength(2);

    const version = match![1];

    // Versions must match exactly
    expect(version).toBe(packageVersion);
  });

  it('should have valid semantic version format in package.json', () => {
    const packageJsonPath = join(projectRoot, 'package.json');
    const packageJson = JSON.parse(readFileSync(packageJsonPath, 'utf-8'));
    const version = packageJson.version;

    // Semantic versioning regex
    const semverRegex =
      /^(0|[1-9]\d*)\.(0|[1-9]\d*)\.(0|[1-9]\d*)(?:-((?:0|[1-9]\d*|\d*[a-zA-Z-][0-9a-zA-Z-]*)(?:\.(?:0|[1-9]\d*|\d*[a-zA-Z-][0-9a-zA-Z-]*))*))?(?:\+([0-9a-zA-Z-]+(?:\.[0-9a-zA-Z-]+)*))?$/;

    expect(version).toMatch(semverRegex);
  });

  it('should have VERSION constant in correct format', () => {
    const versionPath = join(projectRoot, 'src', 'version.ts');
    const content = readFileSync(versionPath, 'utf-8');

    // Check for const declaration
    expect(content).toContain('export const VERSION');

    // Extract and validate format
    const versionRegex = /export const VERSION = ['"]([^'"]+)['"]/;
    const match = content.match(versionRegex);

    expect(match).not.toBeNull();
    expect(match![1]).toMatch(/^\d+\.\d+\.\d+/);
  });

  it('should fail if versions are out of sync', () => {
    const packageJsonPath = join(projectRoot, 'package.json');
    const versionPath = join(projectRoot, 'src', 'version.ts');

    const packageJson = JSON.parse(readFileSync(packageJsonPath, 'utf-8'));
    const packageVersion = packageJson.version;

    const versionContent = readFileSync(versionPath, 'utf-8');
    const versionRegex = /export const VERSION = ['"]([^'"]+)['"]/;
    const match = versionContent.match(versionRegex);
    const version = match![1];

    // This test explicitly checks that versions match
    // If they don't match, the build should fail
    if (packageVersion !== version) {
      throw new Error(
        `Version mismatch detected!\n` +
          `  package.json version: ${packageVersion}\n` +
          `  version.ts VERSION: ${version}\n` +
          `  Run 'node scripts/inject-version.js' to sync versions.`,
      );
    }

    expect(packageVersion).toBe(version);
  });

  it('should have inject-version.js script in scripts directory', () => {
    const scriptPath = join(projectRoot, 'scripts', 'inject-version.js');
    const { existsSync } = require('fs');

    expect(existsSync(scriptPath)).toBe(true);
  });

  it('should have prebuild script configured in package.json', () => {
    const packageJsonPath = join(projectRoot, 'package.json');
    const packageJson = JSON.parse(readFileSync(packageJsonPath, 'utf-8'));

    // Check if prebuild or build script includes version injection
    const hasPrebuild =
      packageJson.scripts?.prebuild?.includes('inject-version.js');
    const buildIncludesVersion =
      packageJson.scripts?.build?.includes('inject-version.js');

    expect(hasPrebuild || buildIncludesVersion).toBe(true);
  });

  it('should have dev script with version injection', () => {
    const packageJsonPath = join(projectRoot, 'package.json');
    const packageJson = JSON.parse(readFileSync(packageJsonPath, 'utf-8'));

    expect(packageJson.scripts).toHaveProperty('dev');
    expect(packageJson.scripts.dev).toContain('inject-version.js');
  });
});
