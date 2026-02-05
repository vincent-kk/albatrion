import { vi } from 'vitest';

import type { GitHubEntry } from '../../utils/types';

interface MockFetchOptions {
  /** Directory entries for GitHub API calls - dynamic asset types */
  directoryEntries?: Record<string, GitHubEntry[]>;
  /** File contents keyed by path */
  fileContents?: Record<string, string>;
  /** Simulate rate limit */
  rateLimited?: boolean;
  /** Simulate not found */
  notFound?: boolean;
  /** Simulate network error */
  networkError?: boolean;
}

/**
 * Create a mock fetch function for testing GitHub API calls
 */
export const createMockFetch = (options: MockFetchOptions = {}) =>
  vi.fn(async (url: string, _init?: RequestInit): Promise<Response> => {
    // Simulate network error
    if (options.networkError) {
      throw new Error('Network error');
    }

    // Simulate rate limit
    if (options.rateLimited) {
      return new Response('Rate limit exceeded', {
        status: 403,
        headers: {
          'x-ratelimit-remaining': '0',
        },
      });
    }

    // Simulate not found
    if (options.notFound) {
      return new Response('Not found', { status: 404 });
    }

    // Handle GitHub API directory listing - DYNAMIC VERSION
    if (url.includes('api.github.com/repos') && url.includes('/contents/')) {
      const entries = options.directoryEntries;

      if (entries) {
        // Dynamic: check all configured asset types
        // Match asset type at the END of the path to avoid false matches
        // (e.g., /docs/claude/commands should match 'commands', not 'docs')
        for (const [assetType, assetEntries] of Object.entries(entries)) {
          if (url.endsWith(`/${assetType}`) || url.includes(`/${assetType}?`)) {
            return new Response(JSON.stringify(assetEntries), {
              status: 200,
              headers: { 'content-type': 'application/json' },
            });
          }
        }
      }

      return new Response('Not found', { status: 404 });
    }

    // Handle raw.githubusercontent.com file downloads
    if (url.includes('raw.githubusercontent.com')) {
      const fileContents = options.fileContents || {};

      // Extract file path from URL
      for (const [path, content] of Object.entries(fileContents)) {
        if (url.includes(path)) {
          return new Response(content, {
            status: 200,
            headers: { 'content-type': 'text/plain' },
          });
        }
      }

      return new Response('Not found', { status: 404 });
    }

    // Default: not found
    return new Response('Not found', { status: 404 });
  });

/**
 * Setup global fetch mock
 */
export const setupFetchMock = (options: MockFetchOptions = {}) => {
  const mockFetch = createMockFetch(options);
  vi.stubGlobal('fetch', mockFetch);
  return mockFetch;
};

/**
 * Restore global fetch
 */
export const restoreFetchMock = () => {
  vi.unstubAllGlobals();
};
