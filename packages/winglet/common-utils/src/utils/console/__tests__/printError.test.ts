import { describe, expect, it, vi } from 'vitest';

import { printError } from '../printError';

describe('printError', () => {
  it('should call console.error with default options', () => {
    const consoleErrorSpy = vi.spyOn(console, 'error');
    const title = 'Test Error';
    const message = ['Error message 1', 'Error message 2'];

    printError(title, message);

    expect(consoleErrorSpy).toHaveBeenCalledTimes(1);
    expect(consoleErrorSpy.mock.calls[0][0]).toContain('⚠️ Test Error ⚠️');
    expect(consoleErrorSpy.mock.calls[0][0]).toContain('Error message 1');
    expect(consoleErrorSpy.mock.calls[0][0]).toContain('Error message 2');
    expect(consoleErrorSpy.mock.calls[0][1]).toBe('color: #666;');
    expect(consoleErrorSpy.mock.calls[0][2]).toBe(
      'color: #ff0000; font-weight: bold; font-size: 1.25em;',
    );
    expect(consoleErrorSpy.mock.calls[0][3]).toBe('color: #ff6b6b');
    expect(consoleErrorSpy.mock.calls[0][4]).toBe('color: #ff6b6b');

    consoleErrorSpy.mockRestore();
  });

  it('should call console.error with custom options', () => {
    const consoleErrorSpy = vi.spyOn(console, 'error');
    const title = 'Custom Error';
    const message = ['Custom error message'];
    const options = {
      info: 'Additional info',
      emoji: '🚨',
      titleColor: '#00ff00' as `#${string}`,
      messageColor: '#0000ff' as `#${string}`,
    };

    printError(title, message, options);

    expect(consoleErrorSpy).toHaveBeenCalledTimes(1);
    expect(consoleErrorSpy.mock.calls[0][0]).toContain('Additional info');
    expect(consoleErrorSpy.mock.calls[0][0]).toContain('🚨 Custom Error 🚨');
    expect(consoleErrorSpy.mock.calls[0][0]).toContain('Custom error message');
    expect(consoleErrorSpy.mock.calls[0][1]).toBe('color: #666;');
    expect(consoleErrorSpy.mock.calls[0][2]).toBe(
      'color: #00ff00; font-weight: bold; font-size: 1.25em;',
    );
    expect(consoleErrorSpy.mock.calls[0][3]).toBe('color: #0000ff');

    consoleErrorSpy.mockRestore();
  });

  it('should handle empty message array', () => {
    const consoleErrorSpy = vi.spyOn(console, 'error');
    const title = 'Empty Message';
    const message: string[] = [];

    printError(title, message);

    expect(consoleErrorSpy).toHaveBeenCalledTimes(1);
    expect(consoleErrorSpy.mock.calls[0][0]).toContain('⚠️ Empty Message ⚠️');
    expect(consoleErrorSpy.mock.calls[0].length).toBe(3); // title, style1, style2

    consoleErrorSpy.mockRestore();
  });
});
