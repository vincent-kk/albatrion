import { existsSync, mkdtempSync, readFileSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';

import { afterEach, beforeEach, describe, expect, it } from 'vitest';

import {
  createEmptyUnifiedMeta,
  needsSyncUnified,
  readUnifiedSyncMeta,
  removePackageFromMeta,
  updatePackageInMeta,
  writeUnifiedSyncMeta,
} from '../core/syncMeta';
import type { PackageSyncInfo, UnifiedSyncMeta } from '../utils/types';

describe('Unified Metadata Management', () => {
  let tempDir: string;

  beforeEach(() => {
    // Create temporary directory for each test
    tempDir = mkdtempSync(join(tmpdir(), 'syncmeta-test-'));
  });

  afterEach(() => {
    // Clean up temporary directory
    if (existsSync(tempDir)) {
      rmSync(tempDir, { recursive: true, force: true });
    }
  });

  describe('createEmptyUnifiedMeta', () => {
    it('should create empty metadata with correct schema version', () => {
      const meta = createEmptyUnifiedMeta();

      expect(meta.schemaVersion).toBe('0.0.2');
      expect(meta.packages).toEqual({});
      expect(meta.syncedAt).toBeDefined();
      expect(new Date(meta.syncedAt).getTime()).toBeLessThanOrEqual(Date.now());
    });

    it('should create ISO 8601 formatted timestamp', () => {
      const meta = createEmptyUnifiedMeta();
      const isoRegex = /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d{3}Z$/;

      expect(meta.syncedAt).toMatch(isoRegex);
    });

    it('should create unique timestamps for successive calls', async () => {
      const meta1 = createEmptyUnifiedMeta();
      // Small delay to ensure different timestamps
      await new Promise((resolve) => setTimeout(resolve, 2));
      const meta2 = createEmptyUnifiedMeta();

      expect(meta1.syncedAt).not.toBe(meta2.syncedAt);
    });
  });

  describe('writeUnifiedSyncMeta', () => {
    it('should create .claude directory if it does not exist', () => {
      const meta = createEmptyUnifiedMeta();

      writeUnifiedSyncMeta(tempDir, meta);

      const claudeDir = join(tempDir, '.claude');
      expect(existsSync(claudeDir)).toBe(true);
    });

    it('should write metadata file with correct path', () => {
      const meta = createEmptyUnifiedMeta();

      writeUnifiedSyncMeta(tempDir, meta);

      const metaPath = join(tempDir, '.claude', '.sync-meta.json');
      expect(existsSync(metaPath)).toBe(true);
    });

    it('should write valid JSON content', () => {
      const meta = createEmptyUnifiedMeta();

      writeUnifiedSyncMeta(tempDir, meta);

      const metaPath = join(tempDir, '.claude', '.sync-meta.json');
      const content = readFileSync(metaPath, 'utf-8');
      const parsed = JSON.parse(content);

      expect(parsed).toEqual(meta);
    });

    it('should write pretty-formatted JSON', () => {
      const meta = createEmptyUnifiedMeta();

      writeUnifiedSyncMeta(tempDir, meta);

      const metaPath = join(tempDir, '.claude', '.sync-meta.json');
      const content = readFileSync(metaPath, 'utf-8');

      // Check for indentation (2 spaces)
      expect(content).toContain('  "schemaVersion"');
      expect(content).toContain('  "syncedAt"');
    });

    it('should overwrite existing metadata file', () => {
      const meta1 = createEmptyUnifiedMeta();
      writeUnifiedSyncMeta(tempDir, meta1);

      const meta2 = {
        ...createEmptyUnifiedMeta(),
        packages: {
          'test-pkg': {
            originalName: '@test/pkg',
            version: '1.0.0',
            files: { commands: [], skills: [], agents: [] },
          },
        },
      };
      writeUnifiedSyncMeta(tempDir, meta2);

      const read = readUnifiedSyncMeta(tempDir);
      expect(read?.packages).toEqual(meta2.packages);
    });

    it('should handle metadata with package data', () => {
      const meta: UnifiedSyncMeta = {
        schemaVersion: '2.0',
        syncedAt: new Date().toISOString(),
        packages: {
          'canard-schemaForm': {
            originalName: '@canard/schema-form',
            version: '0.10.0',
            files: {
              commands: ['schema-form.md'],
              skills: [
                {
                  original: 'expert.md',
                  transformed: 'canard-schemaForm_expert.md',
                },
              ],
              agents: [],
            },
          },
        },
      };

      writeUnifiedSyncMeta(tempDir, meta);

      const read = readUnifiedSyncMeta(tempDir);
      expect(read).toEqual(meta);
    });
  });

  describe('readUnifiedSyncMeta', () => {
    it('should return null if metadata file does not exist', () => {
      const meta = readUnifiedSyncMeta(tempDir);

      expect(meta).toBeNull();
    });

    it('should read existing metadata correctly', () => {
      const original = createEmptyUnifiedMeta();
      writeUnifiedSyncMeta(tempDir, original);

      const read = readUnifiedSyncMeta(tempDir);

      expect(read).toEqual(original);
    });

    it('should handle metadata with multiple packages', () => {
      const meta: UnifiedSyncMeta = {
        schemaVersion: '2.0',
        syncedAt: new Date().toISOString(),
        packages: {
          'canard-schemaForm': {
            originalName: '@canard/schema-form',
            version: '0.10.0',
            files: { commands: [], skills: [], agents: [] },
          },
          'winglet-reactUtils': {
            originalName: '@winglet/react-utils',
            version: '2.3.1',
            files: { commands: [], skills: [], agents: [] },
          },
        },
      };
      writeUnifiedSyncMeta(tempDir, meta);

      const read = readUnifiedSyncMeta(tempDir);

      expect(read?.packages).toHaveProperty('canard-schemaForm');
      expect(read?.packages).toHaveProperty('winglet-reactUtils');
      expect(Object.keys(read?.packages ?? {})).toHaveLength(2);
    });

    it('should return null if JSON is invalid', () => {
      const metaPath = join(tempDir, '.claude', '.sync-meta.json');
      const claudeDir = join(tempDir, '.claude');

      // Create directory and write invalid JSON
      const { mkdirSync, writeFileSync } = require('fs');
      if (!existsSync(claudeDir)) {
        mkdirSync(claudeDir, { recursive: true });
      }
      writeFileSync(metaPath, '{ invalid json }', 'utf-8');

      const read = readUnifiedSyncMeta(tempDir);

      expect(read).toBeNull();
    });

    it('should preserve all metadata fields', () => {
      const meta: UnifiedSyncMeta = {
        schemaVersion: '2.0',
        syncedAt: '2025-02-05T12:00:00.000Z',
        packages: {
          'test-pkg': {
            originalName: '@test/pkg',
            version: '1.2.3',
            files: {
              commands: ['cmd1.md', 'cmd2.md'],
              skills: [
                { original: 'skill1.md', transformed: 'test-pkg_skill1.md' },
              ],
              agents: [],
            },
          },
        },
      };
      writeUnifiedSyncMeta(tempDir, meta);

      const read = readUnifiedSyncMeta(tempDir);

      expect(read).toEqual(meta);
      expect(read?.schemaVersion).toBe('2.0');
      expect(read?.syncedAt).toBe('2025-02-05T12:00:00.000Z');
      expect(read?.packages['test-pkg'].files.commands).toHaveLength(2);
      expect(read?.packages['test-pkg'].files.skills).toHaveLength(1);
    });
  });

  describe('updatePackageInMeta', () => {
    it('should add new package to empty metadata', () => {
      const meta = createEmptyUnifiedMeta();
      const pkgInfo: PackageSyncInfo = {
        originalName: '@canard/schema-form',
        version: '0.10.0',
        files: { commands: [], skills: [], agents: [] },
      };

      const updated = updatePackageInMeta(meta, 'canard-schemaForm', pkgInfo);

      expect(updated.packages).toHaveProperty('canard-schemaForm');
      expect(updated.packages['canard-schemaForm']).toEqual(pkgInfo);
    });

    it('should update syncedAt timestamp', async () => {
      const meta = createEmptyUnifiedMeta();
      const originalTimestamp = meta.syncedAt;

      // Small delay to ensure different timestamp
      await new Promise((resolve) => setTimeout(resolve, 2));

      const pkgInfo: PackageSyncInfo = {
        originalName: '@test/pkg',
        version: '1.0.0',
        files: { commands: [], skills: [], agents: [] },
      };

      const updated = updatePackageInMeta(meta, 'test-pkg', pkgInfo);

      expect(updated.syncedAt).not.toBe(originalTimestamp);
      expect(new Date(updated.syncedAt).getTime()).toBeGreaterThan(
        new Date(originalTimestamp).getTime(),
      );
    });

    it('should preserve existing packages', () => {
      const meta: UnifiedSyncMeta = {
        schemaVersion: '2.0',
        syncedAt: new Date().toISOString(),
        packages: {
          'existing-pkg': {
            originalName: '@existing/pkg',
            version: '1.0.0',
            files: { commands: [], skills: [], agents: [] },
          },
        },
      };

      const newPkgInfo: PackageSyncInfo = {
        originalName: '@new/pkg',
        version: '2.0.0',
        files: { commands: [], skills: [], agents: [] },
      };

      const updated = updatePackageInMeta(meta, 'new-pkg', newPkgInfo);

      expect(updated.packages).toHaveProperty('existing-pkg');
      expect(updated.packages).toHaveProperty('new-pkg');
      expect(Object.keys(updated.packages)).toHaveLength(2);
    });

    it('should update existing package', () => {
      const meta: UnifiedSyncMeta = {
        schemaVersion: '2.0',
        syncedAt: new Date().toISOString(),
        packages: {
          'test-pkg': {
            originalName: '@test/pkg',
            version: '1.0.0',
            files: { commands: [], skills: [], agents: [] },
          },
        },
      };

      const updatedInfo: PackageSyncInfo = {
        originalName: '@test/pkg',
        version: '2.0.0',
        files: {
          commands: ['new.md'],
          skills: [],
          agents: [],
        },
      };

      const updated = updatePackageInMeta(meta, 'test-pkg', updatedInfo);

      expect(updated.packages['test-pkg'].version).toBe('2.0.0');
      expect(updated.packages['test-pkg'].files.commands).toHaveLength(1);
    });

    it('should not mutate original metadata', () => {
      const meta = createEmptyUnifiedMeta();
      const pkgInfo: PackageSyncInfo = {
        originalName: '@test/pkg',
        version: '1.0.0',
        files: { commands: [], skills: [], agents: [] },
      };

      const updated = updatePackageInMeta(meta, 'test-pkg', pkgInfo);

      expect(meta.packages).toEqual({});
      expect(updated.packages).toHaveProperty('test-pkg');
    });

    it('should handle complex file mappings', () => {
      const meta = createEmptyUnifiedMeta();
      const pkgInfo: PackageSyncInfo = {
        originalName: '@canard/schema-form',
        version: '0.10.0',
        files: {
          commands: ['form.md', 'validate.md'],
          skills: [
            {
              original: 'expert.md',
              transformed: 'canard-schemaForm_expert.md',
            },
            {
              original: 'advanced.md',
              transformed: 'canard-schemaForm_advanced.md',
            },
          ],
          agents: [],
        },
      };

      const updated = updatePackageInMeta(meta, 'canard-schemaForm', pkgInfo);

      expect(updated.packages['canard-schemaForm'].files.commands).toHaveLength(
        2,
      );
      expect(updated.packages['canard-schemaForm'].files.skills).toHaveLength(
        2,
      );
      expect(updated.packages['canard-schemaForm'].files.commands[0]).toBe(
        'form.md',
      );
      const skillFile = updated.packages['canard-schemaForm'].files.skills[0];
      expect(typeof skillFile !== 'string' && skillFile.original).toBe(
        'expert.md',
      );
      expect(typeof skillFile !== 'string' && skillFile.transformed).toBe(
        'canard-schemaForm_expert.md',
      );
    });
  });

  describe('removePackageFromMeta', () => {
    it('should remove specified package', () => {
      const meta: UnifiedSyncMeta = {
        schemaVersion: '2.0',
        syncedAt: new Date().toISOString(),
        packages: {
          pkg1: {
            originalName: '@test/pkg1',
            version: '1.0.0',
            files: { commands: [], skills: [], agents: [] },
          },
          pkg2: {
            originalName: '@test/pkg2',
            version: '2.0.0',
            files: { commands: [], skills: [], agents: [] },
          },
        },
      };

      const updated = removePackageFromMeta(meta, 'pkg1');

      expect(updated.packages).not.toHaveProperty('pkg1');
      expect(updated.packages).toHaveProperty('pkg2');
      expect(Object.keys(updated.packages)).toHaveLength(1);
    });

    it('should preserve other packages', () => {
      const meta: UnifiedSyncMeta = {
        schemaVersion: '2.0',
        syncedAt: new Date().toISOString(),
        packages: {
          pkg1: {
            originalName: '@test/pkg1',
            version: '1.0.0',
            files: { commands: [], skills: [], agents: [] },
          },
          pkg2: {
            originalName: '@test/pkg2',
            version: '2.0.0',
            files: { commands: [], skills: [], agents: [] },
          },
          pkg3: {
            originalName: '@test/pkg3',
            version: '3.0.0',
            files: { commands: [], skills: [], agents: [] },
          },
        },
      };

      const updated = removePackageFromMeta(meta, 'pkg2');

      expect(updated.packages).toHaveProperty('pkg1');
      expect(updated.packages).toHaveProperty('pkg3');
      expect(updated.packages['pkg1'].version).toBe('1.0.0');
      expect(updated.packages['pkg3'].version).toBe('3.0.0');
    });

    it('should handle removal of non-existent package gracefully', () => {
      const meta: UnifiedSyncMeta = {
        schemaVersion: '2.0',
        syncedAt: new Date().toISOString(),
        packages: {
          'existing-pkg': {
            originalName: '@test/pkg',
            version: '1.0.0',
            files: { commands: [], skills: [], agents: [] },
          },
        },
      };

      const updated = removePackageFromMeta(meta, 'non-existent');

      expect(updated.packages).toHaveProperty('existing-pkg');
      expect(Object.keys(updated.packages)).toHaveLength(1);
    });

    it('should not mutate original metadata', () => {
      const meta: UnifiedSyncMeta = {
        schemaVersion: '2.0',
        syncedAt: new Date().toISOString(),
        packages: {
          pkg1: {
            originalName: '@test/pkg1',
            version: '1.0.0',
            files: { commands: [], skills: [], agents: [] },
          },
        },
      };

      const updated = removePackageFromMeta(meta, 'pkg1');

      expect(meta.packages).toHaveProperty('pkg1');
      expect(updated.packages).not.toHaveProperty('pkg1');
    });

    it('should handle empty metadata after removal', () => {
      const meta: UnifiedSyncMeta = {
        schemaVersion: '2.0',
        syncedAt: new Date().toISOString(),
        packages: {
          'only-pkg': {
            originalName: '@test/pkg',
            version: '1.0.0',
            files: { commands: [], skills: [], agents: [] },
          },
        },
      };

      const updated = removePackageFromMeta(meta, 'only-pkg');

      expect(updated.packages).toEqual({});
      expect(Object.keys(updated.packages)).toHaveLength(0);
    });
  });

  describe('needsSyncUnified', () => {
    it('should return true if metadata is null', () => {
      const result = needsSyncUnified(null, 'any-pkg', '1.0.0');

      expect(result).toBe(true);
    });

    it('should return true if package not in metadata', () => {
      const meta: UnifiedSyncMeta = {
        schemaVersion: '2.0',
        syncedAt: new Date().toISOString(),
        packages: {
          'other-pkg': {
            originalName: '@other/pkg',
            version: '1.0.0',
            files: { commands: [], skills: [], agents: [] },
          },
        },
      };

      const result = needsSyncUnified(meta, 'missing-pkg', '1.0.0');

      expect(result).toBe(true);
    });

    it('should return true if version differs', () => {
      const meta: UnifiedSyncMeta = {
        schemaVersion: '2.0',
        syncedAt: new Date().toISOString(),
        packages: {
          'test-pkg': {
            originalName: '@test/pkg',
            version: '1.0.0',
            files: { commands: [], skills: [], agents: [] },
          },
        },
      };

      const result = needsSyncUnified(meta, 'test-pkg', '2.0.0');

      expect(result).toBe(true);
    });

    it('should return false if version matches', () => {
      const meta: UnifiedSyncMeta = {
        schemaVersion: '2.0',
        syncedAt: new Date().toISOString(),
        packages: {
          'test-pkg': {
            originalName: '@test/pkg',
            version: '1.0.0',
            files: { commands: [], skills: [], agents: [] },
          },
        },
      };

      const result = needsSyncUnified(meta, 'test-pkg', '1.0.0');

      expect(result).toBe(false);
    });

    it('should handle multiple packages correctly', () => {
      const meta: UnifiedSyncMeta = {
        schemaVersion: '2.0',
        syncedAt: new Date().toISOString(),
        packages: {
          pkg1: {
            originalName: '@test/pkg1',
            version: '1.0.0',
            files: { commands: [], skills: [], agents: [] },
          },
          pkg2: {
            originalName: '@test/pkg2',
            version: '2.0.0',
            files: { commands: [], skills: [], agents: [] },
          },
        },
      };

      expect(needsSyncUnified(meta, 'pkg1', '1.0.0')).toBe(false);
      expect(needsSyncUnified(meta, 'pkg2', '2.0.0')).toBe(false);
      expect(needsSyncUnified(meta, 'pkg1', '1.0.1')).toBe(true);
      expect(needsSyncUnified(meta, 'pkg3', '3.0.0')).toBe(true);
    });

    it('should compare versions as exact strings', () => {
      const meta: UnifiedSyncMeta = {
        schemaVersion: '2.0',
        syncedAt: new Date().toISOString(),
        packages: {
          'test-pkg': {
            originalName: '@test/pkg',
            version: '1.0.0',
            files: { commands: [], skills: [], agents: [] },
          },
        },
      };

      // Semantic version comparison should be exact string match
      expect(needsSyncUnified(meta, 'test-pkg', '1.0.0')).toBe(false);
      expect(needsSyncUnified(meta, 'test-pkg', '1.0')).toBe(true);
      expect(needsSyncUnified(meta, 'test-pkg', 'v1.0.0')).toBe(true);
    });
  });

  describe('Integration: Full CRUD Operations', () => {
    it('should handle complete create-read-update-delete cycle', () => {
      // CREATE
      const meta = createEmptyUnifiedMeta();
      writeUnifiedSyncMeta(tempDir, meta);

      // READ
      let read = readUnifiedSyncMeta(tempDir);
      expect(read?.packages).toEqual({});

      // UPDATE (ADD)
      const pkg1: PackageSyncInfo = {
        originalName: '@test/pkg1',
        version: '1.0.0',
        files: { commands: [], skills: [], agents: [] },
      };
      const updated1 = updatePackageInMeta(read!, 'pkg1', pkg1);
      writeUnifiedSyncMeta(tempDir, updated1);

      read = readUnifiedSyncMeta(tempDir);
      expect(read?.packages).toHaveProperty('pkg1');

      // UPDATE (MODIFY)
      const pkg1Updated: PackageSyncInfo = {
        originalName: '@test/pkg1',
        version: '2.0.0',
        files: {
          commands: ['cmd.md'],
          skills: [],
          agents: [],
        },
      };
      const updated2 = updatePackageInMeta(read!, 'pkg1', pkg1Updated);
      writeUnifiedSyncMeta(tempDir, updated2);

      read = readUnifiedSyncMeta(tempDir);
      expect(read?.packages['pkg1'].version).toBe('2.0.0');

      // DELETE
      const updated3 = removePackageFromMeta(read!, 'pkg1');
      writeUnifiedSyncMeta(tempDir, updated3);

      read = readUnifiedSyncMeta(tempDir);
      expect(read?.packages).not.toHaveProperty('pkg1');
    });

    it('should maintain consistency across multiple operations', () => {
      const meta = createEmptyUnifiedMeta();
      writeUnifiedSyncMeta(tempDir, meta);

      // Add multiple packages
      let current = readUnifiedSyncMeta(tempDir)!;
      current = updatePackageInMeta(current, 'pkg1', {
        originalName: '@test/pkg1',
        version: '1.0.0',
        files: { commands: [], skills: [], agents: [] },
      });
      current = updatePackageInMeta(current, 'pkg2', {
        originalName: '@test/pkg2',
        version: '2.0.0',
        files: { commands: [], skills: [], agents: [] },
      });
      current = updatePackageInMeta(current, 'pkg3', {
        originalName: '@test/pkg3',
        version: '3.0.0',
        files: { commands: [], skills: [], agents: [] },
      });
      writeUnifiedSyncMeta(tempDir, current);

      // Verify all packages
      let read = readUnifiedSyncMeta(tempDir);
      expect(Object.keys(read?.packages ?? {})).toHaveLength(3);

      // Remove one package
      current = removePackageFromMeta(read!, 'pkg2');
      writeUnifiedSyncMeta(tempDir, current);

      read = readUnifiedSyncMeta(tempDir);
      expect(Object.keys(read?.packages ?? {})).toHaveLength(2);
      expect(read?.packages).toHaveProperty('pkg1');
      expect(read?.packages).toHaveProperty('pkg3');
      expect(read?.packages).not.toHaveProperty('pkg2');
    });
  });

  describe('Version Comparison Edge Cases', () => {
    it('should handle prerelease versions', () => {
      const meta: UnifiedSyncMeta = {
        schemaVersion: '2.0',
        syncedAt: new Date().toISOString(),
        packages: {
          'test-pkg': {
            originalName: '@test/pkg',
            version: '1.0.0-beta.1',
            files: { commands: [], skills: [], agents: [] },
          },
        },
      };

      expect(needsSyncUnified(meta, 'test-pkg', '1.0.0-beta.1')).toBe(false);
      expect(needsSyncUnified(meta, 'test-pkg', '1.0.0-beta.2')).toBe(true);
      expect(needsSyncUnified(meta, 'test-pkg', '1.0.0')).toBe(true);
    });

    it('should handle build metadata', () => {
      const meta: UnifiedSyncMeta = {
        schemaVersion: '2.0',
        syncedAt: new Date().toISOString(),
        packages: {
          'test-pkg': {
            originalName: '@test/pkg',
            version: '1.0.0+build.123',
            files: { commands: [], skills: [], agents: [] },
          },
        },
      };

      expect(needsSyncUnified(meta, 'test-pkg', '1.0.0+build.123')).toBe(false);
      expect(needsSyncUnified(meta, 'test-pkg', '1.0.0+build.124')).toBe(true);
    });
  });

  describe('JSON Serialization/Deserialization', () => {
    it('should preserve all data types through serialization', () => {
      const meta: UnifiedSyncMeta = {
        schemaVersion: '2.0',
        syncedAt: '2025-02-05T12:00:00.000Z',
        packages: {
          'complex-pkg': {
            originalName: '@complex/pkg',
            version: '1.2.3-beta.4+build.567',
            files: {
              commands: ['cmd1.md', 'cmd-2.md'],
              skills: [
                { original: 'skill.md', transformed: 'complex-pkg_skill.md' },
              ],
              agents: [],
            },
          },
        },
      };

      writeUnifiedSyncMeta(tempDir, meta);
      const read = readUnifiedSyncMeta(tempDir);

      expect(read).toEqual(meta);
      expect(typeof read?.schemaVersion).toBe('string');
      expect(typeof read?.syncedAt).toBe('string');
      expect(Array.isArray(read?.packages['complex-pkg'].files.commands)).toBe(
        true,
      );
    });
  });

  describe('Dynamic Asset Types Support', () => {
    it('should handle custom asset types (docs, rules)', () => {
      const meta: UnifiedSyncMeta = {
        schemaVersion: '2.0',
        syncedAt: new Date().toISOString(),
        packages: {
          'canard-schemaForm': {
            originalName: '@canard/schema-form',
            version: '0.10.0',
            files: {
              commands: ['schema-form.md'],
              skills: [
                {
                  original: 'expert.md',
                  transformed: 'canard-schemaForm_expert.md',
                },
              ],
              docs: ['api-reference.md'],
              rules: [
                {
                  original: 'validation.md',
                  transformed: 'canard-schemaForm_validation.md',
                },
              ],
            },
          },
        },
      };

      writeUnifiedSyncMeta(tempDir, meta);
      const read = readUnifiedSyncMeta(tempDir);

      expect(read).toEqual(meta);
      expect(read?.packages['canard-schemaForm'].files.docs).toEqual([
        'api-reference.md',
      ]);
      expect(read?.packages['canard-schemaForm'].files.rules).toHaveLength(1);
    });

    it('should preserve arbitrary asset type names', () => {
      const meta: UnifiedSyncMeta = {
        schemaVersion: '2.0',
        syncedAt: new Date().toISOString(),
        packages: {
          'test-pkg': {
            originalName: '@test/pkg',
            version: '1.0.0',
            files: {
              // Custom asset types with arbitrary names
              tutorials: ['getting-started.md', 'advanced.md'],
              templates: [
                { original: 'basic.md', transformed: 'test-pkg_basic.md' },
              ],
              examples: [],
            },
          },
        },
      };

      writeUnifiedSyncMeta(tempDir, meta);
      const read = readUnifiedSyncMeta(tempDir);

      expect(read?.packages['test-pkg'].files.tutorials).toHaveLength(2);
      expect(read?.packages['test-pkg'].files.templates).toHaveLength(1);
      expect(read?.packages['test-pkg'].files.examples).toHaveLength(0);
    });

    it('should update package with new asset types', () => {
      const meta = createEmptyUnifiedMeta();

      // Initial sync with standard asset types
      const initialInfo: PackageSyncInfo = {
        originalName: '@test/pkg',
        version: '1.0.0',
        files: {
          commands: ['cmd.md'],
          skills: [],
          agents: [],
        },
      };
      const updated1 = updatePackageInMeta(meta, 'test-pkg', initialInfo);

      // Update with custom asset types
      const extendedInfo: PackageSyncInfo = {
        originalName: '@test/pkg',
        version: '1.1.0',
        files: {
          commands: ['cmd.md'],
          skills: [],
          agents: [],
          docs: ['readme.md'],
          rules: ['style-guide.md'],
        },
      };
      const updated2 = updatePackageInMeta(updated1, 'test-pkg', extendedInfo);

      expect(updated2.packages['test-pkg'].files.docs).toEqual(['readme.md']);
      expect(updated2.packages['test-pkg'].files.rules).toEqual([
        'style-guide.md',
      ]);
      expect(updated2.packages['test-pkg'].version).toBe('1.1.0');
    });

    it('should handle mixed structure types in files record', () => {
      const meta: UnifiedSyncMeta = {
        schemaVersion: '2.0',
        syncedAt: new Date().toISOString(),
        packages: {
          'mixed-pkg': {
            originalName: '@mixed/pkg',
            version: '1.0.0',
            files: {
              // Nested structure: string array
              commands: ['create.md', 'update.md'],
              docs: ['api.md'],
              // Flat structure: FileMapping array
              skills: [
                { original: 'expert.md', transformed: 'mixed-pkg_expert.md' },
              ],
              rules: [
                { original: 'lint.md', transformed: 'mixed-pkg_lint.md' },
                { original: 'format.md', transformed: 'mixed-pkg_format.md' },
              ],
            },
          },
        },
      };

      writeUnifiedSyncMeta(tempDir, meta);
      const read = readUnifiedSyncMeta(tempDir);

      // Verify nested structure (string arrays)
      expect(read?.packages['mixed-pkg'].files.commands).toEqual([
        'create.md',
        'update.md',
      ]);
      expect(read?.packages['mixed-pkg'].files.docs).toEqual(['api.md']);

      // Verify flat structure (FileMapping arrays)
      const skills = read?.packages['mixed-pkg'].files.skills;
      expect(skills).toHaveLength(1);
      expect(typeof skills?.[0] !== 'string' && skills?.[0].original).toBe(
        'expert.md',
      );

      const rules = read?.packages['mixed-pkg'].files.rules;
      expect(rules).toHaveLength(2);
    });
  });
});
