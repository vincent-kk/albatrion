import { describe, expect, it } from 'vitest';

import { generateHash } from '../generateHash';

describe('generateHash', () => {
  it('should generate a hash for a string', () => {
    const input = 'test string';
    const hash = generateHash(input);

    expect(typeof hash).toBe('number');
    expect(hash).not.toBe(0);
  });

  it('should generate consistent hashes for the same input', () => {
    const input = 'test string';
    const hash1 = generateHash(input);
    const hash2 = generateHash(input);

    expect(hash1).toBe(hash2);
  });

  it('should generate different hashes for different inputs', () => {
    const input1 = 'test string 1';
    const input2 = 'test string 2';

    const hash1 = generateHash(input1);
    const hash2 = generateHash(input2);

    expect(hash1).not.toBe(hash2);
  });

  it('should handle empty string', () => {
    const input = '';
    const hash = generateHash(input);

    expect(typeof hash).toBe('number');
    expect(hash).toBe(0);
  });

  it('should handle special characters', () => {
    const input = '!@#$%^&*()_+-=[]{}|;:,.<>?';
    const hash = generateHash(input);

    expect(typeof hash).toBe('number');
    expect(hash).not.toBe(0);
  });
});
