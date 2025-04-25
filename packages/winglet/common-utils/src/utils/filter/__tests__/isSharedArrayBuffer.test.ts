import { describe, expect, it, vi } from 'vitest';

import { isSharedArrayBuffer } from '../isSharedArrayBuffer';

describe('isSharedArrayBuffer', () => {
  it('should return true for SharedArrayBuffer instances', () => {
    const buffer = new SharedArrayBuffer();
    expect(isSharedArrayBuffer(buffer)).toBe(true);

    vi.unstubAllGlobals();
  });

  it('should return false for non-SharedArrayBuffer values', () => {
    expect(isSharedArrayBuffer(null)).toBe(false);
    expect(isSharedArrayBuffer(undefined)).toBe(false);
    expect(isSharedArrayBuffer(42)).toBe(false);
    expect(isSharedArrayBuffer('string')).toBe(false);
    expect(isSharedArrayBuffer({})).toBe(false);
    expect(isSharedArrayBuffer([])).toBe(false);
    expect(isSharedArrayBuffer(new ArrayBuffer(8))).toBe(false);
  });

  it('should handle environments where SharedArrayBuffer is not available', () => {
    // Mock environment where SharedArrayBuffer is not defined
    const originalSharedArrayBuffer = global.SharedArrayBuffer;
    vi.stubGlobal('SharedArrayBuffer', undefined);

    expect(isSharedArrayBuffer({})).toBe(false);

    // Restore original SharedArrayBuffer
    vi.stubGlobal('SharedArrayBuffer', originalSharedArrayBuffer);
  });
});
