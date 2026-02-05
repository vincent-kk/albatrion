import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';

import { afterEach, beforeEach, describe, expect, it } from 'vitest';

import {
  ensureDirectory,
  fileExists,
  listDirectory,
  readJsonFile,
  removeDirectory,
  writeJsonFile,
  writeTextFile,
} from '../core/io';
import { type TestFixture, createTestFixture } from './helpers';

describe('io.ts', () => {
  let fixture: TestFixture;

  beforeEach(() => {
    fixture = createTestFixture();
  });

  afterEach(() => {
    fixture.cleanup();
  });

  describe('readJsonFile', () => {
    it('should read and parse valid JSON file', () => {
      const filePath = join(fixture.tempDir, 'data.json');
      const data = { name: 'test', version: '1.0.0' };
      writeFileSync(filePath, JSON.stringify(data));

      const result = readJsonFile<typeof data>(filePath);

      expect(result).toEqual(data);
    });

    it('should return null if file does not exist', () => {
      const filePath = join(fixture.tempDir, 'non-existent.json');

      const result = readJsonFile(filePath);

      expect(result).toBeNull();
    });

    it('should return null for invalid JSON', () => {
      const filePath = join(fixture.tempDir, 'invalid.json');
      writeFileSync(filePath, 'not valid json{');

      const result = readJsonFile(filePath);

      expect(result).toBeNull();
    });

    it('should handle empty file', () => {
      const filePath = join(fixture.tempDir, 'empty.json');
      writeFileSync(filePath, '');

      const result = readJsonFile(filePath);

      expect(result).toBeNull();
    });

    it('should handle nested JSON objects', () => {
      const filePath = join(fixture.tempDir, 'nested.json');
      const data = {
        packages: {
          '@canard/schema-form': {
            version: '0.10.0',
            files: ['a.md', 'b.md'],
          },
        },
      };
      writeFileSync(filePath, JSON.stringify(data));

      const result = readJsonFile(filePath);

      expect(result).toEqual(data);
    });
  });

  describe('writeJsonFile', () => {
    it('should write JSON with pretty formatting', () => {
      const filePath = join(fixture.tempDir, 'output.json');
      const data = { name: 'test', version: '1.0.0' };

      writeJsonFile(filePath, data);

      expect(existsSync(filePath)).toBe(true);
      const content = readFileSync(filePath, 'utf-8');
      const parsed = JSON.parse(content);
      expect(parsed).toEqual(data);
      expect(content).toContain('\n'); // Pretty formatted
    });

    it('should overwrite existing file', () => {
      const filePath = join(fixture.tempDir, 'existing.json');
      writeFileSync(filePath, JSON.stringify({ old: 'data' }));

      const newData = { new: 'data' };
      writeJsonFile(filePath, newData);

      const content = readFileSync(filePath, 'utf-8');
      const parsed = JSON.parse(content);
      expect(parsed).toEqual(newData);
    });

    it('should create parent directories automatically', () => {
      const filePath = join(
        fixture.tempDir,
        'deep',
        'nested',
        'dir',
        'file.json',
      );
      const data = { test: 'value' };

      writeJsonFile(filePath, data);

      expect(existsSync(filePath)).toBe(true);
      const parsed = JSON.parse(readFileSync(filePath, 'utf-8'));
      expect(parsed).toEqual(data);
    });

    it('should handle complex nested objects', () => {
      const filePath = join(fixture.tempDir, 'complex.json');
      const data = {
        schemaVersion: '2.0.0',
        packages: {
          pkg1: { version: '1.0.0', files: { commands: ['a.md'] } },
          pkg2: { version: '2.0.0', files: { skills: ['b.md', 'c.md'] } },
        },
      };

      writeJsonFile(filePath, data);

      const result = readJsonFile(filePath);
      expect(result).toEqual(data);
    });
  });

  describe('ensureDirectory', () => {
    it('should create directory if not exists', () => {
      const dirPath = join(fixture.tempDir, 'new-dir');

      expect(existsSync(dirPath)).toBe(false);
      ensureDirectory(dirPath);
      expect(existsSync(dirPath)).toBe(true);
    });

    it('should create nested directories', () => {
      const dirPath = join(fixture.tempDir, 'level1', 'level2', 'level3');

      ensureDirectory(dirPath);

      expect(existsSync(dirPath)).toBe(true);
    });

    it('should not throw if directory already exists', () => {
      const dirPath = join(fixture.tempDir, 'existing');
      mkdirSync(dirPath);

      expect(() => ensureDirectory(dirPath)).not.toThrow();
      expect(existsSync(dirPath)).toBe(true);
    });

    it('should be idempotent', () => {
      const dirPath = join(fixture.tempDir, 'idempotent');

      ensureDirectory(dirPath);
      ensureDirectory(dirPath);
      ensureDirectory(dirPath);

      expect(existsSync(dirPath)).toBe(true);
    });
  });

  describe('fileExists', () => {
    it('should return true for existing file', () => {
      const filePath = join(fixture.tempDir, 'exists.txt');
      writeFileSync(filePath, 'content');

      expect(fileExists(filePath)).toBe(true);
    });

    it('should return true for existing directory', () => {
      const dirPath = join(fixture.tempDir, 'dir');
      mkdirSync(dirPath);

      expect(fileExists(dirPath)).toBe(true);
    });

    it('should return false for non-existent path', () => {
      const path = join(fixture.tempDir, 'does-not-exist');

      expect(fileExists(path)).toBe(false);
    });

    it('should return false for empty string path', () => {
      expect(fileExists('')).toBe(false);
    });
  });

  describe('removeDirectory', () => {
    it('should remove directory and all contents', () => {
      const dirPath = join(fixture.tempDir, 'to-remove');
      mkdirSync(dirPath, { recursive: true });
      writeFileSync(join(dirPath, 'file1.txt'), 'content1');
      writeFileSync(join(dirPath, 'file2.txt'), 'content2');

      removeDirectory(dirPath);

      expect(existsSync(dirPath)).toBe(false);
    });

    it('should remove nested directories', () => {
      const dirPath = join(fixture.tempDir, 'parent');
      const childPath = join(dirPath, 'child', 'grandchild');
      mkdirSync(childPath, { recursive: true });
      writeFileSync(join(childPath, 'file.txt'), 'content');

      removeDirectory(dirPath);

      expect(existsSync(dirPath)).toBe(false);
    });

    it('should not throw if directory does not exist', () => {
      const dirPath = join(fixture.tempDir, 'non-existent');

      expect(() => removeDirectory(dirPath)).not.toThrow();
    });

    it('should handle empty directory', () => {
      const dirPath = join(fixture.tempDir, 'empty');
      mkdirSync(dirPath);

      removeDirectory(dirPath);

      expect(existsSync(dirPath)).toBe(false);
    });
  });

  describe('listDirectory', () => {
    it('should return list of files in directory', () => {
      const dirPath = join(fixture.tempDir, 'list-test');
      mkdirSync(dirPath);
      writeFileSync(join(dirPath, 'file1.txt'), '');
      writeFileSync(join(dirPath, 'file2.md'), '');
      writeFileSync(join(dirPath, 'file3.json'), '');

      const files = listDirectory(dirPath);

      expect(files).toHaveLength(3);
      expect(files).toContain('file1.txt');
      expect(files).toContain('file2.md');
      expect(files).toContain('file3.json');
    });

    it('should return empty array for empty directory', () => {
      const dirPath = join(fixture.tempDir, 'empty-dir');
      mkdirSync(dirPath);

      const files = listDirectory(dirPath);

      expect(files).toEqual([]);
    });

    it('should return empty array for non-existent directory', () => {
      const dirPath = join(fixture.tempDir, 'non-existent');

      const files = listDirectory(dirPath);

      expect(files).toEqual([]);
    });

    it('should include subdirectories in listing', () => {
      const dirPath = join(fixture.tempDir, 'with-subdirs');
      mkdirSync(dirPath);
      mkdirSync(join(dirPath, 'subdir'));
      writeFileSync(join(dirPath, 'file.txt'), '');

      const files = listDirectory(dirPath);

      expect(files).toHaveLength(2);
      expect(files).toContain('subdir');
      expect(files).toContain('file.txt');
    });

    it('should handle special characters in filenames', () => {
      const dirPath = join(fixture.tempDir, 'special-chars');
      mkdirSync(dirPath);
      writeFileSync(join(dirPath, 'file with spaces.txt'), '');
      writeFileSync(join(dirPath, 'file_underscore.txt'), '');
      writeFileSync(join(dirPath, 'file-dash.txt'), '');

      const files = listDirectory(dirPath);

      expect(files).toHaveLength(3);
      expect(files).toContain('file with spaces.txt');
      expect(files).toContain('file_underscore.txt');
      expect(files).toContain('file-dash.txt');
    });
  });

  describe('writeTextFile', () => {
    it('should write text file with content', () => {
      const filePath = join(fixture.tempDir, 'text.txt');
      const content = 'Hello, World!';

      writeTextFile(filePath, content);

      expect(existsSync(filePath)).toBe(true);
      expect(readFileSync(filePath, 'utf-8')).toBe(content);
    });

    it('should create parent directories automatically', () => {
      const filePath = join(fixture.tempDir, 'deep', 'path', 'file.txt');
      const content = 'Nested content';

      writeTextFile(filePath, content);

      expect(existsSync(filePath)).toBe(true);
      expect(readFileSync(filePath, 'utf-8')).toBe(content);
    });

    it('should overwrite existing file', () => {
      const filePath = join(fixture.tempDir, 'overwrite.txt');
      writeFileSync(filePath, 'Original content');

      writeTextFile(filePath, 'New content');

      expect(readFileSync(filePath, 'utf-8')).toBe('New content');
    });

    it('should handle empty string content', () => {
      const filePath = join(fixture.tempDir, 'empty.txt');

      writeTextFile(filePath, '');

      expect(existsSync(filePath)).toBe(true);
      expect(readFileSync(filePath, 'utf-8')).toBe('');
    });

    it('should handle multiline content', () => {
      const filePath = join(fixture.tempDir, 'multiline.md');
      const content = `# Title

This is a multiline
markdown document.

- Item 1
- Item 2`;

      writeTextFile(filePath, content);

      expect(readFileSync(filePath, 'utf-8')).toBe(content);
    });

    it('should handle unicode content', () => {
      const filePath = join(fixture.tempDir, 'unicode.txt');
      const content = 'Hello 世界 🌍 Привет';

      writeTextFile(filePath, content);

      expect(readFileSync(filePath, 'utf-8')).toBe(content);
    });
  });
});
