import { expect, it, vi } from 'vitest';

import { processCssSheet } from '../processCssSheet/processCssSheet';
import * as tokenReader from '../readCssToken';

it('reads leading comment gaps in empty and populated values at most linearly', () => {
  const read = vi.spyOn(tokenReader, 'readCssToken');
  try {
    for (const suffix of [';}', 'red}']) {
      const count = (length: number) => {
        read.mockClear();
        processCssSheet('.a{--x: ' + '/**/ '.repeat(length) + suffix, true, 'none');
        return read.mock.calls.length;
      };
      const small = count(32), large = count(64);
      expect(large, suffix).toBeLessThanOrEqual(small * 2 + 4);
    }
  } finally { read.mockRestore(); }
});
