import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';

import { afterEach, beforeEach, describe, expect, it } from 'vitest';

import {
  cleanAssetDir,
  createSyncMeta,
  ensureDir,
  needsSync,
  readSyncMeta,
  writeAssetFile,
  writeFile,
  writeSyncMeta,
} from '../core/filesystem';
import { parsePackageName } from '../utils/packageName';
import { getDestinationDir } from '../utils/paths';
import { type TestFixture, createTestFixture, mockSyncMeta } from './helpers';

describe('parsePackageName', () => {
  it('should parse scoped package name', () => {
    const [scope, name] = parsePackageName('@canard/schema-form');
    expect(scope).toBe('@canard');
    expect(name).toBe('schema-form');
  });

  it('should parse unscoped package name', () => {
    const [scope, name] = parsePackageName('my-package');
    expect(scope).toBe('');
    expect(name).toBe('my-package');
  });

  it('should handle deeply scoped package name', () => {
    const [scope, name] = parsePackageName('@scope/package-name');
    expect(scope).toBe('@scope');
    expect(name).toBe('package-name');
  });
});

describe('getDestinationDir', () => {
  it('should build path for scoped package commands', () => {
    const path = getDestinationDir(
      '/project',
      '@canard/schema-form',
      'commands',
    );
    expect(path).toBe('/project/.claude/commands/@canard/schema-form');
  });

  it('should build path for scoped package skills', () => {
    const path = getDestinationDir('/project', '@lerx/promise-modal', 'skills');
    expect(path).toBe('/project/.claude/skills/@lerx/promise-modal');
  });

  it('should build path for unscoped package', () => {
    const path = getDestinationDir('/project', 'my-package', 'commands');
    expect(path).toBe('/project/.claude/commands/my-package');
  });
});

describe('createSyncMeta', () => {
  it('should create sync metadata with correct structure', () => {
    const meta = createSyncMeta('0.10.0', ['file1.md', 'file2.md']);

    expect(meta.version).toBe('0.10.0');
    expect(meta.files).toEqual(['file1.md', 'file2.md']);
    expect(meta.syncedAt).toMatch(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}/);
  });

  it('should create sync metadata with empty files', () => {
    const meta = createSyncMeta('1.0.0', []);

    expect(meta.version).toBe('1.0.0');
    expect(meta.files).toEqual([]);
  });
});

describe('Filesystem operations with temp directory', () => {
  let fixture: TestFixture;

  beforeEach(() => {
    fixture = createTestFixture();
  });

  afterEach(() => {
    fixture.cleanup();
  });

  describe('ensureDir', () => {
    it('should create directory if not exists', () => {
      const dirPath = join(fixture.tempDir, 'new', 'nested', 'dir');

      expect(existsSync(dirPath)).toBe(false);
      ensureDir(dirPath);
      expect(existsSync(dirPath)).toBe(true);
    });

    it('should not throw if directory already exists', () => {
      const dirPath = join(fixture.tempDir, 'existing');
      mkdirSync(dirPath, { recursive: true });

      expect(() => ensureDir(dirPath)).not.toThrow();
    });
  });

  describe('writeFile', () => {
    it('should write file and create parent directories', () => {
      const filePath = join(fixture.tempDir, 'deep', 'nested', 'file.txt');

      writeFile(filePath, 'Hello, World!');

      expect(existsSync(filePath)).toBe(true);
      expect(readFileSync(filePath, 'utf-8')).toBe('Hello, World!');
    });

    it('should overwrite existing file', () => {
      const filePath = join(fixture.tempDir, 'existing.txt');
      writeFileSync(filePath, 'Original content');

      writeFile(filePath, 'New content');

      expect(readFileSync(filePath, 'utf-8')).toBe('New content');
    });
  });

  describe('readSyncMeta', () => {
    it('should read existing sync meta', () => {
      const destDir = getDestinationDir(
        fixture.tempDir,
        '@canard/schema-form',
        'commands',
      );
      mkdirSync(destDir, { recursive: true });
      writeFileSync(
        join(destDir, '.sync-meta.json'),
        JSON.stringify(mockSyncMeta),
      );

      const result = readSyncMeta(
        fixture.tempDir,
        '@canard/schema-form',
        'commands',
      );

      expect(result).toEqual(mockSyncMeta);
    });

    it('should return null if sync meta does not exist', () => {
      const result = readSyncMeta(
        fixture.tempDir,
        '@canard/schema-form',
        'commands',
      );

      expect(result).toBeNull();
    });

    it('should return null for invalid JSON', () => {
      const destDir = getDestinationDir(
        fixture.tempDir,
        '@canard/schema-form',
        'commands',
      );
      mkdirSync(destDir, { recursive: true });
      writeFileSync(join(destDir, '.sync-meta.json'), 'invalid json');

      const result = readSyncMeta(
        fixture.tempDir,
        '@canard/schema-form',
        'commands',
      );

      expect(result).toBeNull();
    });
  });

  describe('writeSyncMeta', () => {
    it('should write sync meta to correct location', () => {
      writeSyncMeta(
        fixture.tempDir,
        '@canard/schema-form',
        'commands',
        mockSyncMeta,
      );

      const destDir = getDestinationDir(
        fixture.tempDir,
        '@canard/schema-form',
        'commands',
      );
      const content = readFileSync(join(destDir, '.sync-meta.json'), 'utf-8');
      const parsed = JSON.parse(content);

      expect(parsed).toEqual(mockSyncMeta);
    });

    it('should create directories if not exist', () => {
      writeSyncMeta(
        fixture.tempDir,
        '@lerx/promise-modal',
        'skills',
        mockSyncMeta,
      );

      const destDir = getDestinationDir(
        fixture.tempDir,
        '@lerx/promise-modal',
        'skills',
      );
      expect(existsSync(join(destDir, '.sync-meta.json'))).toBe(true);
    });
  });

  describe('writeAssetFile', () => {
    it('should write asset file to correct location', () => {
      const content = '# My Command\n\nThis is a command file.';

      writeAssetFile(
        fixture.tempDir,
        '@canard/schema-form',
        'commands',
        'my-command.md',
        content,
      );

      const destDir = getDestinationDir(
        fixture.tempDir,
        '@canard/schema-form',
        'commands',
      );
      const fileContent = readFileSync(join(destDir, 'my-command.md'), 'utf-8');

      expect(fileContent).toBe(content);
    });

    it('should handle unscoped package', () => {
      writeAssetFile(
        fixture.tempDir,
        'my-package',
        'skills',
        'skill.md',
        '# Skill',
      );

      const destDir = getDestinationDir(
        fixture.tempDir,
        'my-package',
        'skills',
      );
      expect(existsSync(join(destDir, 'skill.md'))).toBe(true);
    });
  });

  describe('cleanAssetDir', () => {
    it('should remove existing directory and contents', () => {
      const destDir = getDestinationDir(
        fixture.tempDir,
        '@canard/schema-form',
        'commands',
      );
      mkdirSync(destDir, { recursive: true });
      writeFileSync(join(destDir, 'file1.md'), 'content1');
      writeFileSync(join(destDir, 'file2.md'), 'content2');
      writeFileSync(join(destDir, '.sync-meta.json'), '{}');

      cleanAssetDir(fixture.tempDir, '@canard/schema-form', 'commands');

      expect(existsSync(destDir)).toBe(false);
    });

    it('should not throw if directory does not exist', () => {
      expect(() =>
        cleanAssetDir(fixture.tempDir, '@non/existent', 'commands'),
      ).not.toThrow();
    });
  });

  describe('needsSync', () => {
    it('should return true if no sync meta exists', () => {
      const result = needsSync(
        fixture.tempDir,
        '@canard/schema-form',
        '0.10.0',
      );

      expect(result).toBe(true);
    });

    it('should return false if version matches', () => {
      // Setup existing sync meta
      writeSyncMeta(fixture.tempDir, '@canard/schema-form', 'commands', {
        version: '0.10.0',
        syncedAt: new Date().toISOString(),
        files: ['file.md'],
      });

      const result = needsSync(
        fixture.tempDir,
        '@canard/schema-form',
        '0.10.0',
      );

      expect(result).toBe(false);
    });

    it('should return true if version differs', () => {
      writeSyncMeta(fixture.tempDir, '@canard/schema-form', 'commands', {
        version: '0.9.0',
        syncedAt: new Date().toISOString(),
        files: ['file.md'],
      });

      const result = needsSync(
        fixture.tempDir,
        '@canard/schema-form',
        '0.10.0',
      );

      expect(result).toBe(true);
    });

    it('should check both commands and skills', () => {
      // Only commands synced
      writeSyncMeta(fixture.tempDir, '@canard/schema-form', 'commands', {
        version: '0.10.0',
        syncedAt: new Date().toISOString(),
        files: ['cmd.md'],
      });

      // Skills not synced - but version matches in commands
      const result = needsSync(
        fixture.tempDir,
        '@canard/schema-form',
        '0.10.0',
      );

      expect(result).toBe(false);
    });

    it('should return true if any version differs', () => {
      writeSyncMeta(fixture.tempDir, '@canard/schema-form', 'commands', {
        version: '0.10.0',
        syncedAt: new Date().toISOString(),
        files: ['cmd.md'],
      });
      writeSyncMeta(fixture.tempDir, '@canard/schema-form', 'skills', {
        version: '0.9.0', // Different version
        syncedAt: new Date().toISOString(),
        files: ['skill.md'],
      });

      const result = needsSync(
        fixture.tempDir,
        '@canard/schema-form',
        '0.10.0',
      );

      expect(result).toBe(true);
    });
  });
});
