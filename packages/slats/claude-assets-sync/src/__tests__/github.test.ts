import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import {
  downloadAssetFiles,
  downloadFile,
  fetchAssetFiles,
  fetchDirectoryContents,
  NotFoundError,
  RateLimitError,
} from '../core/github';
import type { GitHubRepoInfo } from '../utils/types';

import {
  mockCommandContent,
  mockCommandEntries,
  mockRepoInfo,
  mockSkillContent,
  mockSkillEntries,
  restoreFetchMock,
  setupFetchMock,
} from './helpers';

describe('GitHub API Client', () => {
  afterEach(() => {
    restoreFetchMock();
  });

  describe('fetchDirectoryContents', () => {
    it('should fetch directory contents successfully', async () => {
      setupFetchMock({
        directoryEntries: { commands: mockCommandEntries },
      });

      const result = await fetchDirectoryContents(
        mockRepoInfo,
        'packages/canard/schema-form/docs/claude/commands',
        '@canard/schema-form@0.10.0',
      );

      expect(result).toHaveLength(1);
      expect(result?.[0].name).toBe('schema-form.md');
    });

    it('should return null for non-existent directory', async () => {
      setupFetchMock({ notFound: true });

      const result = await fetchDirectoryContents(
        mockRepoInfo,
        'non/existent/path',
        '@canard/schema-form@0.10.0',
      );

      expect(result).toBeNull();
    });

    it('should throw RateLimitError when rate limited', async () => {
      setupFetchMock({ rateLimited: true });

      await expect(
        fetchDirectoryContents(
          mockRepoInfo,
          'some/path',
          '@canard/schema-form@0.10.0',
        ),
      ).rejects.toThrow(RateLimitError);
    });

    it('should filter only .md files', async () => {
      const entriesWithNonMd = [
        ...mockCommandEntries,
        {
          name: 'config.json',
          path: 'some/path/config.json',
          type: 'file' as const,
          download_url: 'https://example.com/config.json',
          sha: 'xyz789',
        },
      ];

      setupFetchMock({
        directoryEntries: { commands: entriesWithNonMd },
      });

      const result = await fetchDirectoryContents(
        mockRepoInfo,
        'packages/canard/schema-form/docs/claude/commands',
        '@canard/schema-form@0.10.0',
      );

      expect(result).toHaveLength(1);
      expect(result?.[0].name).toBe('schema-form.md');
    });

    it('should include GITHUB_TOKEN in headers when set', async () => {
      const mockFetch = setupFetchMock({
        directoryEntries: { commands: mockCommandEntries },
      });

      process.env.GITHUB_TOKEN = 'test-token';

      await fetchDirectoryContents(
        mockRepoInfo,
        'some/path',
        '@canard/schema-form@0.10.0',
      );

      expect(mockFetch).toHaveBeenCalled();
      const callArgs = mockFetch.mock.calls[0];
      expect(callArgs[1]?.headers).toHaveProperty(
        'Authorization',
        'Bearer test-token',
      );

      delete process.env.GITHUB_TOKEN;
    });
  });

  describe('fetchAssetFiles', () => {
    it('should fetch both commands and skills', async () => {
      setupFetchMock({
        directoryEntries: {
          commands: mockCommandEntries,
          skills: mockSkillEntries,
        },
      });

      const result = await fetchAssetFiles(
        mockRepoInfo,
        'docs/claude',
        '@canard/schema-form@0.10.0',
      );

      expect(result.commands).toHaveLength(1);
      expect(result.skills).toHaveLength(2);
    });

    it('should return empty arrays when directories do not exist', async () => {
      setupFetchMock({
        directoryEntries: {},
      });

      const result = await fetchAssetFiles(
        mockRepoInfo,
        'docs/claude',
        '@canard/schema-form@0.10.0',
      );

      expect(result.commands).toEqual([]);
      expect(result.skills).toEqual([]);
    });

    it('should handle partial results (only commands)', async () => {
      setupFetchMock({
        directoryEntries: {
          commands: mockCommandEntries,
        },
      });

      const result = await fetchAssetFiles(
        mockRepoInfo,
        'docs/claude',
        '@canard/schema-form@0.10.0',
      );

      expect(result.commands).toHaveLength(1);
      expect(result.skills).toEqual([]);
    });

    it('should handle partial results (only skills)', async () => {
      setupFetchMock({
        directoryEntries: {
          skills: mockSkillEntries,
        },
      });

      const result = await fetchAssetFiles(
        mockRepoInfo,
        'docs/claude',
        '@canard/schema-form@0.10.0',
      );

      expect(result.commands).toEqual([]);
      expect(result.skills).toHaveLength(2);
    });
  });

  describe('downloadFile', () => {
    it('should download file content successfully', async () => {
      setupFetchMock({
        fileContents: {
          'schema-form.md': mockCommandContent,
        },
      });

      const content = await downloadFile(
        mockRepoInfo,
        'packages/canard/schema-form/docs/claude/commands/schema-form.md',
        '@canard/schema-form@0.10.0',
      );

      expect(content).toBe(mockCommandContent);
    });

    it('should throw NotFoundError for non-existent file', async () => {
      setupFetchMock({ notFound: true });

      await expect(
        downloadFile(mockRepoInfo, 'non/existent/file.md', '@pkg@1.0.0'),
      ).rejects.toThrow(NotFoundError);
    });

    it('should throw error for other HTTP errors', async () => {
      vi.stubGlobal(
        'fetch',
        vi.fn().mockResolvedValue(
          new Response('Server error', { status: 500 }),
        ),
      );

      await expect(
        downloadFile(mockRepoInfo, 'some/file.md', '@pkg@1.0.0'),
      ).rejects.toThrow('Failed to download file: 500');
    });
  });

  describe('downloadAssetFiles', () => {
    it('should download multiple files and return as Map', async () => {
      setupFetchMock({
        fileContents: {
          'schema-form-expert.md': mockSkillContent,
          'validation.md': '# Validation Guide\n',
        },
      });

      const result = await downloadAssetFiles(
        mockRepoInfo,
        'docs/claude',
        'skills',
        mockSkillEntries,
        '@canard/schema-form@0.10.0',
      );

      expect(result.size).toBe(2);
      expect(result.get('schema-form-expert.md')).toBe(mockSkillContent);
      expect(result.get('validation.md')).toBe('# Validation Guide\n');
    });

    it('should handle empty entries array', async () => {
      setupFetchMock({});

      const result = await downloadAssetFiles(
        mockRepoInfo,
        'docs/claude',
        'commands',
        [],
        '@canard/schema-form@0.10.0',
      );

      expect(result.size).toBe(0);
    });

    it('should work without repository directory', async () => {
      const repoInfoWithoutDir: GitHubRepoInfo = {
        owner: 'owner',
        repo: 'repo',
      };

      setupFetchMock({
        fileContents: {
          'command.md': '# Command\n',
        },
      });

      const result = await downloadAssetFiles(
        repoInfoWithoutDir,
        'docs/claude',
        'commands',
        [
          {
            name: 'command.md',
            path: 'docs/claude/commands/command.md',
            type: 'file',
            download_url: 'https://example.com/command.md',
            sha: 'abc',
          },
        ],
        'pkg@1.0.0',
      );

      expect(result.size).toBe(1);
    });
  });
});
