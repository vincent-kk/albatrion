import { describe, expect, it, vi } from 'vitest';

import { isBlob } from '../isBlob';

describe('isBlob', () => {
  it('should return true for Blob instances', () => {
    // Mock Blob for testing
    // const mockBlob = new ArrayBuffer(8);
    // vi.stubGlobal(
    //   'Blob',
    //   class Blob {
    //     constructor() {
    //       return mockBlob;
    //     }
    //   },
    // );

    const blob = new Blob();
    expect(isBlob(blob)).toBe(true);

    vi.unstubAllGlobals();
  });

  it('should return false for non-Blob values', () => {
    expect(isBlob(null)).toBe(false);
    expect(isBlob(undefined)).toBe(false);
    expect(isBlob(42)).toBe(false);
    expect(isBlob('string')).toBe(false);
    expect(isBlob({})).toBe(false);
    expect(isBlob([])).toBe(false);
    expect(isBlob(new ArrayBuffer(8))).toBe(false);
  });

  it('should handle environments where Blob is not available', () => {
    // Mock environment where Blob is not defined
    const originalBlob = global.Blob;
    vi.stubGlobal('Blob', undefined);

    expect(isBlob({})).toBe(false);

    // Restore original Blob
    vi.stubGlobal('Blob', originalBlob);
  });
});
