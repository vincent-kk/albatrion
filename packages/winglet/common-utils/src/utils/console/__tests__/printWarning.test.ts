import { afterEach, describe, expect, it, vi } from 'vitest';

import { printWarning } from '../printWarning';

describe('printWarning', () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('should call console.warn with default options', () => {
    const consoleWarnSpy = vi
      .spyOn(console, 'warn')
      .mockImplementation(() => {});

    printWarning('Test Warning', ['Warning message 1', 'Warning message 2']);

    expect(consoleWarnSpy).toHaveBeenCalledTimes(1);
    expect(consoleWarnSpy.mock.calls[0][0]).toContain('⚠️ Test Warning ⚠️');
    expect(consoleWarnSpy.mock.calls[0][0]).toContain('Warning message 1');
    expect(consoleWarnSpy.mock.calls[0][1]).toBe('color: #666;');
    expect(consoleWarnSpy.mock.calls[0][2]).toBe(
      'color: #f59e0b; font-weight: bold; font-size: 1.25em;',
    );
    expect(consoleWarnSpy.mock.calls[0][3]).toBe('color: #d97706');
    expect(consoleWarnSpy.mock.calls[0][4]).toBe('color: #d97706');
  });

  it('should append structured details', () => {
    const consoleWarnSpy = vi
      .spyOn(console, 'warn')
      .mockImplementation(() => {});
    const details = { keyword: 'if' };

    printWarning('Test Warning', ['Warning message'], { details });

    const call = consoleWarnSpy.mock.calls[0];
    expect(call[call.length - 1]).toBe(details);
  });
});
