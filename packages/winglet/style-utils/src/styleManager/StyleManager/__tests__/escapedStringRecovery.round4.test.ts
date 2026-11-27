import { describe, expect, it } from 'vitest';

import { RuleScoper } from '../utils/RuleScoper';

describe('hexadecimal string escape consumes its newline', () => {
  for (const newline of ['\n', '\r', '\r\n', '\f']) {
    for (const escape of ['22', '000022']) {
      it(`${escape} with ${JSON.stringify(newline)}`, () => {
        const body = `{content:"\\${escape}${newline}abc";content:"a;b}";}`;
        expect(new RuleScoper('.a' + body + '.b{}', '.s').scopeSheet()).toBe('.s .a' + body + '.s .b{}');
      });
    }
  }
});
