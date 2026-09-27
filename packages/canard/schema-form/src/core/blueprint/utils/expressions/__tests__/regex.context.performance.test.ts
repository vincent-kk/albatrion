import { describe, expect, test } from 'vitest';

import { JSON_POINTER_PATH_REGEX } from '../regex';

describe('Context Symbol (@) - JSON_POINTER_REGEX', () => {

  // 헬퍼 함수: 매칭된 결과 추출
  const extractMatches = (input: string): string[] => {
    JSON_POINTER_PATH_REGEX.lastIndex = 0;
    const matches: string[] = [];
    let match;
    while ((match = JSON_POINTER_PATH_REGEX.exec(input)) !== null) {
      matches.push(match[0]);
    }
    return matches;
  };

  describe('Performance - repeated @ characters (ReDoS prevention)', () => {
    test('many repeated @ characters should not cause catastrophic backtracking', () => {
      // Various @ repetitions - none should match
      expect(extractMatches('@@@@@@@')).toEqual([]);
      expect(extractMatches('@@@@@@@@@@')).toEqual([]);
      expect(extractMatches('@'.repeat(50))).toEqual([]);
      expect(extractMatches('@'.repeat(100))).toEqual([]);
    });

    test('@ followed by many repeated characters should not match', () => {
      expect(extractMatches('@' + 'a'.repeat(100))).toEqual([]);
      expect(extractMatches('@' + 'a'.repeat(1000))).toEqual([]);
    });

    test('alternating @ and other characters', () => {
      expect(extractMatches('@a@b@c@d@e')).toEqual([]);
      expect(extractMatches('a@b@c@d@e@')).toEqual([]);
    });

    test('@ in various problematic positions should complete quickly', () => {
      // All should complete quickly without hanging
      const start = performance.now();
      extractMatches('@'.repeat(1000));
      extractMatches('@/'.repeat(100));
      extractMatches('@..'.repeat(100));
      const elapsed = performance.now() - start;
      expect(elapsed).toBeLessThan(100); // Should complete in < 100ms
    });

    test('pathological patterns with @ should not cause ReDoS', () => {
      const start = performance.now();

      // Test various pathological patterns
      extractMatches('user' + '@'.repeat(100));
      extractMatches('@'.repeat(50) + 'domain');
      extractMatches(('@/' + 'path').repeat(50));
      extractMatches(('@.' + 'prop').repeat(50));

      const elapsed = performance.now() - start;
      expect(elapsed).toBeLessThan(100); // Should complete in < 100ms
    });
  });
});
