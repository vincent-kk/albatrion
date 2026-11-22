import { format } from 'node:util';

import { afterEach, describe, expect, it, vi } from 'vitest';

import { printError } from '../printError';
import { printWarning } from '../printWarning';

// Console format specifiers (WHATWG Console Standard, "Formatter"; Node util.format)
// are expanded in the first argument only. User text must reach the output verbatim.
const render = (args: unknown[]) => format(...args);

afterEach(() => {
  vi.restoreAllMocks();
});

describe('printWarning and printError print the given text verbatim', () => {
  it('a title containing "%o" is printed as written', () => {
    const warn = vi.spyOn(console, 'warn').mockImplementation(() => {});
    printWarning('Discount must be 100%off or less', ['check the value']);
    const output = render(warn.mock.calls[0]);
    expect(output).toContain('Discount must be 100%off or less');
  });

  it('a message line containing "%s" is printed as written and details still follow', () => {
    const error = vi.spyOn(console, 'error').mockImplementation(() => {});
    printError('Invalid pattern', ['pattern "%s" is not allowed'], {
      details: { path: '/a' },
    });
    const output = render(error.mock.calls[0]);
    expect(output).toContain('pattern "%s" is not allowed');
    expect(output).toContain("path: '/a'");
  });

  it('control: plain text and details are printed', () => {
    const warn = vi.spyOn(console, 'warn').mockImplementation(() => {});
    printWarning('Title', ['line one'], { details: { path: '/a' } });
    const output = render(warn.mock.calls[0]);
    expect(output).toContain('Title');
    expect(output).toContain('line one');
    expect(output).toContain("path: '/a'");
  });
});
