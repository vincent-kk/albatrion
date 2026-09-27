import { describe, expect, it } from 'vitest';

import { wrapReturnStatements } from '../utils/wrapReturnStatements';

describe('wrapReturnStatements', () => {
  describe('multiline complex patterns', () => {
    it('should handle multiline if-else', () => {
      const input = `if (dependencies[0]) {
  return true;
} else {
  return false;
}`;
      const expected = `if (dependencies[0]) {
  return !!(true);
} else {
  return !!(false);
}`;
      expect(wrapReturnStatements(input)).toBe(expected);
    });

    it('should handle multiline with early returns', () => {
      const input = `if (!dependencies[0]) return;
if (!dependencies[1]) return;
return dependencies[0] + dependencies[1];`;
      const expected = `if (!dependencies[0]) return false;
if (!dependencies[1]) return false;
return !!(dependencies[0] + dependencies[1]);`;
      expect(wrapReturnStatements(input)).toBe(expected);
    });

    it('should handle complex business logic', () => {
      const input = `{const value = dependencies[0];
const threshold = dependencies[1];
if (value == null) return;
if (value < threshold) return false;
return value >= threshold;}`;
      const expected = `{const value = dependencies[0];
const threshold = dependencies[1];
if (value == null) return false;
if (value < threshold) return !!(false);
return !!(value >= threshold);}`;
      expect(wrapReturnStatements(input)).toBe(expected);
    });
  });
});
