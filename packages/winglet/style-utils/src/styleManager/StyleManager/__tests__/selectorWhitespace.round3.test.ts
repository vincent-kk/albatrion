import { describe, expect, it } from 'vitest';

import { RuleScoper } from '../utils/RuleScoper';

describe('round-3 escaped selector whitespace characterization', () => {
  it.each([9, 10, 11, 12, 13, 32, 160, 8195, 12288, 65279])(
    'keeps the escaped code unit %s token when trimming a list separator',
    (code) => {
      const scope = '.r3trim';
      const selector = '.a\\' + String.fromCharCode(code);
      const block = '{color:red}';
      expect(new RuleScoper(`${selector} ${block}`, scope).scopeSheet()).toBe(
        `${scope} ${selector}${block}`,
      );
      expect(new RuleScoper(`${selector} , .b ${block}`, scope).scopeSheet()).toBe(
        `${scope} ${selector},${scope} .b${block}`,
      );
    },
  );
});
