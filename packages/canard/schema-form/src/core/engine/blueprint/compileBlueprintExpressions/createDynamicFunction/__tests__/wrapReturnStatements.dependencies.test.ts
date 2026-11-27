import { expectBooleanBody } from './fixtures/expectBooleanBody';
import { describe, it } from 'vitest';

import { wrapReturnStatements } from '../utils/wrapReturnStatements';

describe('wrapReturnStatements', () => {
  describe('dependencies array access patterns', () => {
    it('should wrap dependencies array access', () => {
      expectBooleanBody('return dependencies[0];', wrapReturnStatements('return dependencies[0];'));
    });

    it('should wrap multiple dependencies access', () => {
      expectBooleanBody('return dependencies[0] && dependencies[1];', wrapReturnStatements('return dependencies[0] && dependencies[1];'));
    });

    it('should wrap dependencies comparison', () => {
      expectBooleanBody('return dependencies[0] > 10;', wrapReturnStatements('return dependencies[0] > 10;'));
    });

    it('should wrap complex dependencies expression', () => {
      expectBooleanBody('return dependencies[0] === "active" && dependencies[1] > 0;', wrapReturnStatements('return dependencies[0] === "active" && dependencies[1] > 0;'));
    });

    it('should handle conditional with dependencies', () => {
      const input =
        'if (dependencies[0]) return dependencies[1]; return dependencies[2];';
      expectBooleanBody(input, wrapReturnStatements(input));
    });
  });
});
