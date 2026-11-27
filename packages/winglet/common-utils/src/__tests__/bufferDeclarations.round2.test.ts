import { execFileSync } from 'node:child_process';
import { createRequire } from 'node:module';
import { describe, expect, it } from 'vitest';

import { isBuffer } from '../index';

const require = createRequire(import.meta.url);
describe('round-2 common-utils 9: browser declarations', () => {
  it('typechecks a browser consumer without Node globals', () => {
    expect(() =>
      execFileSync(
        process.execPath,
        [
          require.resolve('typescript/bin/tsc'),
          '-p',
          'src/__tests__/fixtures/browser-buffer/tsconfig.json',
        ],
        { stdio: 'pipe' },
      ),
    ).not.toThrow();
  });
  it('retains Buffer methods when Node globals are present', () => {
    const value: unknown = Buffer.from('hello');
    if (!isBuffer(value)) throw new Error('Expected Buffer');
    const buffer: Buffer = value;
    expect(buffer.toString('hex')).toBe('68656c6c6f');
  });
});
