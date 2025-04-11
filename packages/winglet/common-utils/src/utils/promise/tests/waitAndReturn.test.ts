import { describe, expect, it, vi } from 'vitest';

import { waitAndReturn } from '../waitAndReturn';

describe('waitAndReturn', () => {
  it('should execute the function and wait before returning the result', async () => {
    const fn = vi.fn().mockReturnValue('result');
    const startTime = Date.now();

    const result = await waitAndReturn(fn, 100);

    expect(result).toBe('result');
    expect(fn).toHaveBeenCalledTimes(1);
    expect(Date.now() - startTime).toBeGreaterThanOrEqual(100);
  });

  it('should use default delay of 0 if not specified', async () => {
    const fn = vi.fn().mockReturnValue('result');

    const result = await waitAndReturn(fn);

    expect(result).toBe('result');
    expect(fn).toHaveBeenCalledTimes(1);
  });

  it('should handle undefined function', async () => {
    const result = await waitAndReturn(undefined, 100);

    expect(result).toBeUndefined();
  });

  it('should handle async functions', async () => {
    const fn = vi.fn().mockResolvedValue('async result');

    const result = await waitAndReturn(fn, 100);

    expect(result).toBe('async result');
    expect(fn).toHaveBeenCalledTimes(1);
  });

  it('should handle functions that throw errors', async () => {
    const error = new Error('Test error');
    const fn = vi.fn().mockImplementation(() => {
      throw error;
    });

    await expect(waitAndReturn(fn, 100)).rejects.toThrow('Test error');
    expect(fn).toHaveBeenCalledTimes(1);
  });

  it('should execute the function immediately but delay the return', async () => {
    const fn = vi.fn().mockReturnValue('result');
    const executionTime = Date.now();

    const result = await waitAndReturn(fn, 100);
    const returnTime = Date.now();

    expect(result).toBe('result');
    expect(fn).toHaveBeenCalledTimes(1);
    expect(returnTime - executionTime).toBeGreaterThanOrEqual(100);
  });
});
