import { mkdirSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';

import { afterEach, beforeEach, describe, expect, it } from 'vitest';

import {
  canUseLocalSource,
  downloadLocalAssetFiles,
  expandLocalDirectoryEntries,
  fetchLocalAssetFiles,
  fetchLocalDirectoryContents,
} from '../core/localSource';
import type { AssetType } from '../utils/types';
import {
  type TestFixture,
  createTestFixture,
  mockSchemaFormPackage,
  setupLocalDocs,
} from './helpers';

describe('canUseLocalSource', () => {
  let fixture: TestFixture;

  beforeEach(() => {
    fixture = createTestFixture([mockSchemaFormPackage]);
  });

  afterEach(() => {
    fixture.cleanup();
  });

  it('should return available when docs path exists and version matches', () => {
    setupLocalDocs(fixture.tempDir, '@canard/schema-form', 'docs/claude', {
      commands: { 'test.md': '# Test' },
    });

    const result = canUseLocalSource(
      '@canard/schema-form',
      '0.10.0',
      'docs/claude',
      fixture.tempDir,
    );

    expect(result.available).toBe(true);
    expect(result.docsPath).toBeDefined();
  });

  it('should return unavailable when docs path does not exist', () => {
    const result = canUseLocalSource(
      '@canard/schema-form',
      '0.10.0',
      'docs/claude',
      fixture.tempDir,
    );

    expect(result.available).toBe(false);
    expect(result.reason).toContain('not found');
  });

  it('should return unavailable when version mismatches', () => {
    setupLocalDocs(fixture.tempDir, '@canard/schema-form', 'docs/claude', {
      commands: { 'test.md': '# Test' },
    });

    const result = canUseLocalSource(
      '@canard/schema-form',
      '0.99.0', // different from installed 0.10.0
      'docs/claude',
      fixture.tempDir,
    );

    expect(result.available).toBe(false);
    expect(result.reason).toContain('Version mismatch');
  });

  it('should return unavailable when package.json is missing', () => {
    const result = canUseLocalSource(
      '@non/existent',
      '1.0.0',
      'docs/claude',
      fixture.tempDir,
    );

    expect(result.available).toBe(false);
  });
});

describe('fetchLocalDirectoryContents', () => {
  let fixture: TestFixture;

  beforeEach(() => {
    fixture = createTestFixture([mockSchemaFormPackage]);
  });

  afterEach(() => {
    fixture.cleanup();
  });

  it('should return md files and directories', () => {
    const dirPath = join(fixture.tempDir, 'test-dir');
    mkdirSync(dirPath, { recursive: true });
    writeFileSync(join(dirPath, 'file1.md'), '# File 1');
    writeFileSync(join(dirPath, 'file2.md'), '# File 2');
    mkdirSync(join(dirPath, 'subdir'));

    const result = fetchLocalDirectoryContents(dirPath);

    expect(result).not.toBeNull();
    expect(result!.length).toBe(3);
    expect(result!.find((e) => e.name === 'file1.md')?.type).toBe('file');
    expect(result!.find((e) => e.name === 'subdir')?.type).toBe('dir');
  });

  it('should ignore non-md files', () => {
    const dirPath = join(fixture.tempDir, 'test-dir');
    mkdirSync(dirPath, { recursive: true });
    writeFileSync(join(dirPath, 'readme.md'), '# Readme');
    writeFileSync(join(dirPath, 'config.json'), '{}');
    writeFileSync(join(dirPath, 'script.ts'), 'export {}');

    const result = fetchLocalDirectoryContents(dirPath);

    expect(result).not.toBeNull();
    expect(result!.length).toBe(1);
    expect(result![0].name).toBe('readme.md');
  });

  it('should return null for non-existent directory', () => {
    const result = fetchLocalDirectoryContents('/non/existent/path');
    expect(result).toBeNull();
  });

  it('should return GitHubEntry format with download_url: null and sha: empty string', () => {
    const dirPath = join(fixture.tempDir, 'test-format');
    mkdirSync(dirPath, { recursive: true });
    writeFileSync(join(dirPath, 'test.md'), '# Test');
    mkdirSync(join(dirPath, 'subdir'));

    const result = fetchLocalDirectoryContents(dirPath);

    expect(result).not.toBeNull();
    for (const entry of result!) {
      expect(entry.download_url).toBeNull();
      expect(entry.sha).toBe('');
      expect(entry).toHaveProperty('name');
      expect(entry).toHaveProperty('path');
      expect(entry).toHaveProperty('type');
    }

    const fileEntry = result!.find((e) => e.name === 'test.md');
    expect(fileEntry!.type).toBe('file');
    expect(fileEntry!.path).toBe(join(dirPath, 'test.md'));

    const dirEntry = result!.find((e) => e.name === 'subdir');
    expect(dirEntry!.type).toBe('dir');
    expect(dirEntry!.path).toBe(join(dirPath, 'subdir'));
  });
});

describe('expandLocalDirectoryEntries', () => {
  let fixture: TestFixture;

  beforeEach(() => {
    fixture = createTestFixture([mockSchemaFormPackage]);
  });

  afterEach(() => {
    fixture.cleanup();
  });

  it('should expand directories into flat file list', () => {
    const dirPath = join(fixture.tempDir, 'test-expand');
    mkdirSync(join(dirPath, 'subdir'), { recursive: true });
    writeFileSync(join(dirPath, 'root.md'), '# Root');
    writeFileSync(join(dirPath, 'subdir', 'nested.md'), '# Nested');

    const entries = fetchLocalDirectoryContents(dirPath)!;
    const expanded = expandLocalDirectoryEntries(dirPath, entries);

    expect(expanded.length).toBe(2);
    expect(expanded.find((e) => e.name === 'root.md')).toBeDefined();
    expect(expanded.find((e) => e.name === 'subdir/nested.md')).toBeDefined();
  });

  it('should only include files in final result, excluding directories', () => {
    const dirPath = join(fixture.tempDir, 'test-mixed');
    mkdirSync(join(dirPath, 'subdir'), { recursive: true });
    mkdirSync(join(dirPath, 'empty-dir'), { recursive: true });
    writeFileSync(join(dirPath, 'top.md'), '# Top');
    writeFileSync(join(dirPath, 'subdir', 'deep.md'), '# Deep');

    const entries = fetchLocalDirectoryContents(dirPath)!;
    const expanded = expandLocalDirectoryEntries(dirPath, entries);

    // All results should be files, no directories
    for (const entry of expanded) {
      expect(entry.type).toBe('file');
    }
    expect(expanded.length).toBe(2);
    expect(expanded.find((e) => e.name === 'top.md')).toBeDefined();
    expect(expanded.find((e) => e.name === 'subdir/deep.md')).toBeDefined();
  });

  it('should handle deeply nested directories', () => {
    const dirPath = join(fixture.tempDir, 'test-deep');
    mkdirSync(join(dirPath, 'a', 'b'), { recursive: true });
    writeFileSync(join(dirPath, 'a', 'mid.md'), '# Mid');
    writeFileSync(join(dirPath, 'a', 'b', 'deep.md'), '# Deep');

    const entries = fetchLocalDirectoryContents(dirPath)!;
    const expanded = expandLocalDirectoryEntries(dirPath, entries);

    expect(expanded.length).toBe(2);
    expect(expanded.find((e) => e.name === 'a/mid.md')).toBeDefined();
    expect(expanded.find((e) => e.name === 'a/b/deep.md')).toBeDefined();
  });
});

describe('fetchLocalAssetFiles', () => {
  let fixture: TestFixture;

  beforeEach(() => {
    fixture = createTestFixture([mockSchemaFormPackage]);
  });

  afterEach(() => {
    fixture.cleanup();
  });

  it('should return entries for each asset type', async () => {
    const docsPath = join(
      fixture.tempDir,
      'node_modules',
      '@canard/schema-form',
      'docs/claude',
    );
    mkdirSync(join(docsPath, 'commands'), { recursive: true });
    mkdirSync(join(docsPath, 'skills'), { recursive: true });
    writeFileSync(join(docsPath, 'commands', 'cmd.md'), '# Command');
    writeFileSync(join(docsPath, 'skills', 'skill.md'), '# Skill');

    const result = await fetchLocalAssetFiles(docsPath, ['commands', 'skills']);

    expect(result.commands.length).toBe(1);
    expect(result.commands[0].name).toBe('cmd.md');
    expect(result.skills.length).toBe(1);
    expect(result.skills[0].name).toBe('skill.md');
  });

  it('should return empty arrays for missing asset types', async () => {
    const docsPath = join(
      fixture.tempDir,
      'node_modules',
      '@canard/schema-form',
      'docs/claude',
    );
    mkdirSync(docsPath, { recursive: true });

    const result = await fetchLocalAssetFiles(docsPath, ['commands', 'skills']);

    expect(result.commands).toEqual([]);
    expect(result.skills).toEqual([]);
  });
});

describe('downloadLocalAssetFiles', () => {
  let fixture: TestFixture;

  beforeEach(() => {
    fixture = createTestFixture([mockSchemaFormPackage]);
  });

  afterEach(() => {
    fixture.cleanup();
  });

  it('should read file contents from filesystem', async () => {
    const docsPath = join(
      fixture.tempDir,
      'node_modules',
      '@canard/schema-form',
      'docs/claude',
    );
    mkdirSync(join(docsPath, 'commands'), { recursive: true });
    writeFileSync(join(docsPath, 'commands', 'cmd.md'), '# My Command');

    const entries = [
      {
        name: 'cmd.md',
        path: '',
        type: 'file' as const,
        download_url: null,
        sha: '',
      },
    ];

    const result = await downloadLocalAssetFiles(
      docsPath,
      'commands' as AssetType,
      entries,
    );

    expect(result.size).toBe(1);
    expect(result.get('cmd.md')).toBe('# My Command');
  });

  it('should skip unreadable files gracefully', async () => {
    const docsPath = join(
      fixture.tempDir,
      'node_modules',
      '@canard/schema-form',
      'docs/claude',
    );
    mkdirSync(join(docsPath, 'commands'), { recursive: true });

    const entries = [
      {
        name: 'nonexistent.md',
        path: '',
        type: 'file' as const,
        download_url: null,
        sha: '',
      },
    ];

    const result = await downloadLocalAssetFiles(
      docsPath,
      'commands' as AssetType,
      entries,
    );

    expect(result.size).toBe(0);
  });

  it('should return exact content for multiple files', async () => {
    const docsPath = join(
      fixture.tempDir,
      'node_modules',
      '@canard/schema-form',
      'docs/claude',
    );
    mkdirSync(join(docsPath, 'skills'), { recursive: true });
    const content1 = '# Skill One\n\nDetailed description for skill one.';
    const content2 = '# Skill Two\n\nDetailed description for skill two.';
    writeFileSync(join(docsPath, 'skills', 'one.md'), content1);
    writeFileSync(join(docsPath, 'skills', 'two.md'), content2);

    const entries = [
      {
        name: 'one.md',
        path: '',
        type: 'file' as const,
        download_url: null,
        sha: '',
      },
      {
        name: 'two.md',
        path: '',
        type: 'file' as const,
        download_url: null,
        sha: '',
      },
    ];

    const result = await downloadLocalAssetFiles(
      docsPath,
      'skills' as AssetType,
      entries,
    );

    expect(result.size).toBe(2);
    expect(result.get('one.md')).toBe(content1);
    expect(result.get('two.md')).toBe(content2);
  });

  it('should skip unreadable files while returning readable ones', async () => {
    const docsPath = join(
      fixture.tempDir,
      'node_modules',
      '@canard/schema-form',
      'docs/claude',
    );
    mkdirSync(join(docsPath, 'commands'), { recursive: true });
    writeFileSync(join(docsPath, 'commands', 'good.md'), '# Good');

    const entries = [
      {
        name: 'good.md',
        path: '',
        type: 'file' as const,
        download_url: null,
        sha: '',
      },
      {
        name: 'missing.md',
        path: '',
        type: 'file' as const,
        download_url: null,
        sha: '',
      },
    ];

    const result = await downloadLocalAssetFiles(
      docsPath,
      'commands' as AssetType,
      entries,
    );

    expect(result.size).toBe(1);
    expect(result.get('good.md')).toBe('# Good');
    expect(result.has('missing.md')).toBe(false);
  });
});
