import { expectBooleanBody } from './fixtures/expectBooleanBody';
import { describe, it } from 'vitest';

import { wrapReturnStatements } from '../utils/wrapReturnStatements';

describe('wrapReturnStatements', () => {
  describe('multiline complex patterns', () => {
    it('should handle multiline if-else', () => {
      const input = `if (dependencies[0]) {
  return true;
} else {
  return false;
}`;
      expectBooleanBody(input, wrapReturnStatements(input));
    });

    it('should handle multiline with early returns', () => {
      const input = `if (!dependencies[0]) return;
if (!dependencies[1]) return;
return dependencies[0] + dependencies[1];`;
      expectBooleanBody(input, wrapReturnStatements(input));
    });

    it('should handle complex business logic', () => {
      const input = `{const value = dependencies[0];
const threshold = dependencies[1];
if (value == null) return;
if (value < threshold) return false;
return value >= threshold;}`;
      expectBooleanBody(input, wrapReturnStatements(input));
    });
  });
});
