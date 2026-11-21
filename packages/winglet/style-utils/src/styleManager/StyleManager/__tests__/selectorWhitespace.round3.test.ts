import { describe, expect, it } from 'vitest';

import { prefixSelector } from '../utils/prefixSelector';
import { prefixSelectorList } from '../utils/prefixSelectorList';

describe('round-3 escaped selector whitespace characterization', () => {
  it.each([9, 10, 11, 12, 13, 32, 160, 8195, 12288, 65279])(
    'keeps the escaped code unit %s token when trimming a list separator',
    (code) => {
      const prefix = '.r3trim ';
      const selector = '.a\\' + String.fromCharCode(code);
      const single = selector + ' ';
      expect(prefixSelectorList(single, 0, single.length, prefix)).toBe(
        prefixSelector(selector, prefix),
      );
      const list = selector + ' , .b ';
      expect(prefixSelectorList(list, 0, list.length, prefix)).toBe(
        prefixSelector(selector, prefix) + ',' + prefixSelector('.b', prefix),
      );
    },
  );
});
