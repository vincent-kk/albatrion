import { join } from 'node:path';

import { describe, expect, it } from 'vitest';

import {
  getAssetFilePath,
  getDestinationDir,
  getFlatAssetFilePath,
  getFlatDestinationDir,
  getMetaFilePath,
  getUnifiedMetaFilePath,
} from '../utils/paths';

describe('paths.ts', () => {
  const cwd = '/test/project';

  describe('getDestinationDir', () => {
    it('should build path for scoped package commands', () => {
      const path = getDestinationDir(cwd, '@canard/schema-form', 'commands');

      expect(path).toBe(
        join(cwd, '.claude', 'commands', '@canard', 'schema-form'),
      );
    });

    it('should build path for scoped package skills', () => {
      const path = getDestinationDir(cwd, '@lerx/promise-modal', 'skills');

      expect(path).toBe(
        join(cwd, '.claude', 'skills', '@lerx', 'promise-modal'),
      );
    });

    it('should build path for scoped package agents', () => {
      const path = getDestinationDir(cwd, '@winglet/react-utils', 'agents');

      expect(path).toBe(
        join(cwd, '.claude', 'agents', '@winglet', 'react-utils'),
      );
    });

    it('should build path for non-scoped package', () => {
      const path = getDestinationDir(cwd, 'my-package', 'commands');

      expect(path).toBe(join(cwd, '.claude', 'commands', 'my-package'));
    });

    it('should build path for non-scoped package skills', () => {
      const path = getDestinationDir(cwd, 'lodash', 'skills');

      expect(path).toBe(join(cwd, '.claude', 'skills', 'lodash'));
    });

    it('should handle custom asset types', () => {
      const path = getDestinationDir(cwd, '@canard/schema-form', 'docs');

      expect(path).toBe(join(cwd, '.claude', 'docs', '@canard', 'schema-form'));
    });

    it('should handle different working directories', () => {
      const path = getDestinationDir('/other/path', '@scope/pkg', 'commands');

      expect(path).toBe(
        join('/other/path', '.claude', 'commands', '@scope', 'pkg'),
      );
    });
  });

  describe('getFlatDestinationDir', () => {
    it('should build flat path for commands', () => {
      const path = getFlatDestinationDir(cwd, 'commands');

      expect(path).toBe(join(cwd, '.claude', 'commands'));
    });

    it('should build flat path for skills', () => {
      const path = getFlatDestinationDir(cwd, 'skills');

      expect(path).toBe(join(cwd, '.claude', 'skills'));
    });

    it('should build flat path for agents', () => {
      const path = getFlatDestinationDir(cwd, 'agents');

      expect(path).toBe(join(cwd, '.claude', 'agents'));
    });

    it('should handle custom asset types', () => {
      const path = getFlatDestinationDir(cwd, 'docs');

      expect(path).toBe(join(cwd, '.claude', 'docs'));
    });

    it('should handle different working directories', () => {
      const path = getFlatDestinationDir('/other/path', 'commands');

      expect(path).toBe(join('/other/path', '.claude', 'commands'));
    });
  });

  describe('getMetaFilePath', () => {
    it('should build meta path for scoped package', () => {
      const path = getMetaFilePath(cwd, '@canard/schema-form', 'commands');

      expect(path).toBe(
        join(
          cwd,
          '.claude',
          'commands',
          '@canard',
          'schema-form',
          '.sync-meta.json',
        ),
      );
    });

    it('should build meta path for non-scoped package', () => {
      const path = getMetaFilePath(cwd, 'my-package', 'skills');

      expect(path).toBe(
        join(cwd, '.claude', 'skills', 'my-package', '.sync-meta.json'),
      );
    });

    it('should build meta path for different asset types', () => {
      const path = getMetaFilePath(cwd, '@lerx/promise-modal', 'agents');

      expect(path).toBe(
        join(
          cwd,
          '.claude',
          'agents',
          '@lerx',
          'promise-modal',
          '.sync-meta.json',
        ),
      );
    });

    it('should handle custom asset types', () => {
      const path = getMetaFilePath(cwd, '@scope/pkg', 'docs');

      expect(path).toBe(
        join(cwd, '.claude', 'docs', '@scope', 'pkg', '.sync-meta.json'),
      );
    });
  });

  describe('getUnifiedMetaFilePath', () => {
    it('should build unified meta path', () => {
      const path = getUnifiedMetaFilePath(cwd);

      expect(path).toBe(join(cwd, '.claude', '.sync-meta.json'));
    });

    it('should handle different working directories', () => {
      const path = getUnifiedMetaFilePath('/other/path');

      expect(path).toBe(join('/other/path', '.claude', '.sync-meta.json'));
    });

    it('should always return same structure regardless of package', () => {
      const path1 = getUnifiedMetaFilePath(cwd);
      const path2 = getUnifiedMetaFilePath(cwd);

      expect(path1).toBe(path2);
    });
  });

  describe('getAssetFilePath', () => {
    it('should build asset file path for scoped package', () => {
      const path = getAssetFilePath(
        cwd,
        '@canard/schema-form',
        'commands',
        'guide.md',
      );

      expect(path).toBe(
        join(cwd, '.claude', 'commands', '@canard', 'schema-form', 'guide.md'),
      );
    });

    it('should build asset file path for non-scoped package', () => {
      const path = getAssetFilePath(cwd, 'my-package', 'skills', 'expert.md');

      expect(path).toBe(
        join(cwd, '.claude', 'skills', 'my-package', 'expert.md'),
      );
    });

    it('should handle different file names', () => {
      const path = getAssetFilePath(
        cwd,
        '@lerx/promise-modal',
        'commands',
        'create-modal.md',
      );

      expect(path).toBe(
        join(
          cwd,
          '.claude',
          'commands',
          '@lerx',
          'promise-modal',
          'create-modal.md',
        ),
      );
    });

    it('should handle custom asset types', () => {
      const path = getAssetFilePath(cwd, '@scope/pkg', 'docs', 'api.md');

      expect(path).toBe(
        join(cwd, '.claude', 'docs', '@scope', 'pkg', 'api.md'),
      );
    });

    it('should handle nested file paths', () => {
      const path = getAssetFilePath(
        cwd,
        '@scope/pkg',
        'commands',
        'nested/file.md',
      );

      expect(path).toBe(
        join(cwd, '.claude', 'commands', '@scope', 'pkg', 'nested', 'file.md'),
      );
    });
  });

  describe('getFlatAssetFilePath', () => {
    it('should build flat asset file path for commands', () => {
      const path = getFlatAssetFilePath(
        cwd,
        'commands',
        'canard-schemaForm_guide.md',
      );

      expect(path).toBe(
        join(cwd, '.claude', 'commands', 'canard-schemaForm_guide.md'),
      );
    });

    it('should build flat asset file path for skills', () => {
      const path = getFlatAssetFilePath(
        cwd,
        'skills',
        'lerx-promiseModal_expert.md',
      );

      expect(path).toBe(
        join(cwd, '.claude', 'skills', 'lerx-promiseModal_expert.md'),
      );
    });

    it('should build flat asset file path for agents', () => {
      const path = getFlatAssetFilePath(
        cwd,
        'agents',
        'winglet-reactUtils_builder.md',
      );

      expect(path).toBe(
        join(cwd, '.claude', 'agents', 'winglet-reactUtils_builder.md'),
      );
    });

    it('should handle custom asset types', () => {
      const path = getFlatAssetFilePath(
        cwd,
        'docs',
        'canard-schemaForm_api.md',
      );

      expect(path).toBe(
        join(cwd, '.claude', 'docs', 'canard-schemaForm_api.md'),
      );
    });

    it('should handle different working directories', () => {
      const path = getFlatAssetFilePath(
        '/other/path',
        'commands',
        'prefix_file.md',
      );

      expect(path).toBe(
        join('/other/path', '.claude', 'commands', 'prefix_file.md'),
      );
    });

    it('should handle various file name formats', () => {
      const path = getFlatAssetFilePath(
        cwd,
        'skills',
        'my-very-long-prefix_some-file.md',
      );

      expect(path).toBe(
        join(cwd, '.claude', 'skills', 'my-very-long-prefix_some-file.md'),
      );
    });
  });

  describe('path consistency', () => {
    it('nested and flat paths should share same base directory', () => {
      const nested = getDestinationDir(cwd, '@scope/pkg', 'commands');
      const flat = getFlatDestinationDir(cwd, 'commands');

      const nestedBase = nested.split('commands')[0];
      const flatBase = flat.split('commands')[0];

      expect(nestedBase).toBe(flatBase);
    });

    it('meta path should be within destination directory', () => {
      const destDir = getDestinationDir(cwd, '@canard/schema-form', 'commands');
      const metaPath = getMetaFilePath(cwd, '@canard/schema-form', 'commands');

      expect(metaPath.startsWith(destDir)).toBe(true);
      expect(metaPath.endsWith('.sync-meta.json')).toBe(true);
    });

    it('asset file path should be within destination directory', () => {
      const destDir = getDestinationDir(cwd, '@canard/schema-form', 'commands');
      const filePath = getAssetFilePath(
        cwd,
        '@canard/schema-form',
        'commands',
        'file.md',
      );

      expect(filePath.startsWith(destDir)).toBe(true);
      expect(filePath.endsWith('file.md')).toBe(true);
    });

    it('flat asset file path should be within flat destination directory', () => {
      const destDir = getFlatDestinationDir(cwd, 'commands');
      const filePath = getFlatAssetFilePath(cwd, 'commands', 'prefix_file.md');

      expect(filePath.startsWith(destDir)).toBe(true);
      expect(filePath.endsWith('prefix_file.md')).toBe(true);
    });

    it('unified meta path should be at .claude root', () => {
      const unifiedPath = getUnifiedMetaFilePath(cwd);
      const claudeDir = join(cwd, '.claude');

      expect(unifiedPath).toBe(join(claudeDir, '.sync-meta.json'));
    });
  });

  describe('path normalization', () => {
    it('should handle trailing slashes in cwd', () => {
      const path1 = getDestinationDir(
        '/test/project/',
        '@scope/pkg',
        'commands',
      );
      const path2 = getDestinationDir(
        '/test/project',
        '@scope/pkg',
        'commands',
      );

      // Both should produce valid paths (normalization handled by path.join)
      expect(path1).toBeTruthy();
      expect(path2).toBeTruthy();
    });

    it('should handle relative paths correctly', () => {
      const path = getDestinationDir('.', '@scope/pkg', 'commands');

      expect(path).toBe(join('.', '.claude', 'commands', '@scope', 'pkg'));
    });

    it('should handle absolute paths correctly', () => {
      const path = getDestinationDir(
        '/absolute/path',
        '@scope/pkg',
        'commands',
      );

      expect(path).toBe(
        join('/absolute/path', '.claude', 'commands', '@scope', 'pkg'),
      );
    });
  });
});
