import { describe, expect, it } from 'vitest';

import { SIMPLE_EQUALITY_REGEX } from '../regex';

describe('SIMPLE_EQUALITY_REGEX', () => {
  describe('valid patterns', () => {
    it('should match basic equality with double quotes', () => {
      const input = 'dependencies[0] === "email"';
      const matches = input.match(SIMPLE_EQUALITY_REGEX);

      expect(matches).toBeTruthy();
      expect(matches?.[1]).toBe('0');
      expect(matches?.[2]).toBe('"');
      expect(matches?.[3]).toBe('email');
    });

    it('should match basic equality with single quotes', () => {
      const input = "dependencies[1] === 'phone'";
      const matches = input.match(SIMPLE_EQUALITY_REGEX);

      expect(matches).toBeTruthy();
      expect(matches?.[1]).toBe('1');
      expect(matches?.[2]).toBe("'");
      expect(matches?.[3]).toBe('phone');
    });

    it('should match with parentheses around dependency', () => {
      const input = '(dependencies[2]) === "admin"';
      const matches = input.match(SIMPLE_EQUALITY_REGEX);

      expect(matches).toBeTruthy();
      expect(matches?.[1]).toBe('2');
      expect(matches?.[3]).toBe('admin');
    });

    it('should match with spaces around parentheses', () => {
      const input = ' ( dependencies[3] ) === "user"';
      const matches = input.match(SIMPLE_EQUALITY_REGEX);

      expect(matches).toBeTruthy();
      expect(matches?.[1]).toBe('3');
      expect(matches?.[3]).toBe('user');
    });

    it('should match without any spaces', () => {
      const input = 'dependencies[0]==="value"';
      const matches = input.match(SIMPLE_EQUALITY_REGEX);

      expect(matches).toBeTruthy();
      expect(matches?.[1]).toBe('0');
      expect(matches?.[3]).toBe('value');
    });

    it('should match with multiple spaces', () => {
      const input = '  dependencies[5]   ===   "test"  ';
      const matches = input.match(SIMPLE_EQUALITY_REGEX);

      expect(matches).toBeTruthy();
      expect(matches?.[1]).toBe('5');
      expect(matches?.[3]).toBe('test');
    });

    it('should match multi-digit indices', () => {
      const input = 'dependencies[123] === "multi"';
      const matches = input.match(SIMPLE_EQUALITY_REGEX);

      expect(matches).toBeTruthy();
      expect(matches?.[1]).toBe('123');
      expect(matches?.[3]).toBe('multi');
    });

    it('should match values with special characters', () => {
      const input = 'dependencies[0] === "test-value_123"';
      const matches = input.match(SIMPLE_EQUALITY_REGEX);

      expect(matches).toBeTruthy();
      expect(matches?.[3]).toBe('test-value_123');
    });

    it('should match values with spaces', () => {
      const input = 'dependencies[0] === "hello world"';
      const matches = input.match(SIMPLE_EQUALITY_REGEX);

      expect(matches).toBeTruthy();
      expect(matches?.[3]).toBe('hello world');
    });
  });

  describe('invalid patterns', () => {
    it('should not match double equals', () => {
      const input = 'dependencies[0] == "email"';
      const matches = input.match(SIMPLE_EQUALITY_REGEX);

      expect(matches).toBeNull();
    });

    it('should not match loose equality', () => {
      const input = 'dependencies[0] != "email"';
      const matches = input.match(SIMPLE_EQUALITY_REGEX);

      expect(matches).toBeNull();
    });

    it('should not match reversed order', () => {
      const input = '"email" === dependencies[0]';
      const matches = input.match(SIMPLE_EQUALITY_REGEX);

      expect(matches).toBeNull();
    });

    it('should not match mismatched quotes', () => {
      const input = 'dependencies[0] === "email\'';
      const matches = input.match(SIMPLE_EQUALITY_REGEX);

      expect(matches).toBeNull();
    });

    it('should not match without quotes', () => {
      const input = 'dependencies[0] === email';
      const matches = input.match(SIMPLE_EQUALITY_REGEX);

      expect(matches).toBeNull();
    });

    it('should not match with nested brackets', () => {
      const input = 'dependencies[[0]] === "email"';
      const matches = input.match(SIMPLE_EQUALITY_REGEX);

      expect(matches).toBeNull();
    });

    it('should not match non-numeric indices', () => {
      const input = 'dependencies[index] === "email"';
      const matches = input.match(SIMPLE_EQUALITY_REGEX);

      expect(matches).toBeNull();
    });

    it('should not match with additional text', () => {
      const input = 'if (dependencies[0] === "email")';
      const matches = input.match(SIMPLE_EQUALITY_REGEX);

      expect(matches).toBeNull();
    });

    it('should not match complex expressions', () => {
      const input =
        'dependencies[0] === "email" && dependencies[1] === "phone"';
      const matches = input.match(SIMPLE_EQUALITY_REGEX);

      expect(matches).toBeNull();
    });

    it('should not match array includes patterns', () => {
      const input = '["email", "phone"].includes(dependencies[0])';
      const matches = input.match(SIMPLE_EQUALITY_REGEX);

      expect(matches).toBeNull();
    });
  });

  describe('capture groups', () => {
    it('should correctly capture all groups', () => {
      const input = '(dependencies[42]) === "test-value"';
      const matches = input.match(SIMPLE_EQUALITY_REGEX);

      expect(matches).toBeTruthy();
      expect(matches?.[0]).toBe(input); // Full match
      expect(matches?.[1]).toBe('42'); // Dependency index
      expect(matches?.[2]).toBe('"'); // Quote character
      expect(matches?.[3]).toBe('test-value'); // Value
    });

    it('should maintain consistent group indices with parentheses', () => {
      const withParens = '(dependencies[1]) === "value"';
      const withoutParens = 'dependencies[1] === "value"';

      const matchesWithParens = withParens.match(SIMPLE_EQUALITY_REGEX);
      const matchesWithoutParens = withoutParens.match(SIMPLE_EQUALITY_REGEX);

      expect(matchesWithParens?.[1]).toBe('1');
      expect(matchesWithoutParens?.[1]).toBe('1');
      expect(matchesWithParens?.[3]).toBe('value');
      expect(matchesWithoutParens?.[3]).toBe('value');
    });
  });
});
