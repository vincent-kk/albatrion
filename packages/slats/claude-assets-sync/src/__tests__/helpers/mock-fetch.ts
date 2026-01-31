import { vi } from 'vitest';

import type { GitHubEntry } from '../../utils/types';

interface MockFetchOptions {
  /** Directory entries for GitHub API calls */
  directoryEntries?: {
    commands?: GitHubEntry[];
    skills?: GitHubEntry[];
  };
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

    // Handle GitHub API directory listing
    if (url.includes('api.github.com/repos') && url.includes('/contents/')) {
      const entries = options.directoryEntries;

      if (url.includes('/commands')) {
        if (entries?.commands) {
          return new Response(JSON.stringify(entries.commands), {
            status: 200,
            headers: { 'content-type': 'application/json' },
          });
        }
        return new Response('Not found', { status: 404 });
      }

      if (url.includes('/skills')) {
        if (entries?.skills) {
          return new Response(JSON.stringify(entries.skills), {
            status: 200,
            headers: { 'content-type': 'application/json' },
          });
        }
        return new Response('Not found', { status: 404 });
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
