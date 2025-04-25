import { describe, expect, it, vi } from 'vitest';

import { waitAndExecute } from '../waitAndExecute';

describe('waitAndExecute', () => {
  it('should execute the function after the specified delay', async () => {
    const fn = vi.fn().mockReturnValue('result');
    const startTime = Date.now();

    const result = await waitAndExecute(fn, 100);

    expect(result).toBe('result');
    expect(fn).toHaveBeenCalledTimes(1);
    expect(Date.now() - startTime).toBeGreaterThanOrEqual(100);
  });

  it('should use default delay of 0 if not specified', async () => {
    const fn = vi.fn().mockReturnValue('result');

    const result = await waitAndExecute(fn);

    expect(result).toBe('result');
    expect(fn).toHaveBeenCalledTimes(1);
  });

  it('should handle undefined function', async () => {
    const result = await waitAndExecute(undefined, 100);

    expect(result).toBeUndefined();
  });

  it('should handle async functions', async () => {
    const fn = vi.fn().mockResolvedValue('async result');

    const result = await waitAndExecute(fn, 100);

    expect(result).toBe('async result');
    expect(fn).toHaveBeenCalledTimes(1);
  });

  it('should handle functions that throw errors', async () => {
    const error = new Error('Test error');
    const fn = vi.fn().mockImplementation(() => {
      throw error;
    });

    await expect(waitAndExecute(fn, 100)).rejects.toThrow('Test error');
    expect(fn).toHaveBeenCalledTimes(1);
  });
});
