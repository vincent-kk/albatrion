import { describe, expect, it } from 'vitest';

import {
  createSyncMeta,
  getDestinationDir,
  parsePackageName,
} from '../core/filesystem';

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
    const path = getDestinationDir('/project', '@canard/schema-form', 'commands');
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
