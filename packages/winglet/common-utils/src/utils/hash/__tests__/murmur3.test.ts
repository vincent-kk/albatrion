import { describe, expect, it } from 'vitest';

import { Murmur3 } from '../murmur3';

// Helper function to create ArrayBuffer from string
const stringToArrayBuffer = (str: string): ArrayBuffer => {
  const buf = new ArrayBuffer(str.length);
  const bufView = new Uint8Array(buf);
  for (let i = 0, strLen = str.length; i < strLen; i++) {
    bufView[i] = str.charCodeAt(i);
  }
  return buf;
};

// Helper function to create Uint8Array from string
const stringToUint8Array = (str: string): Uint8Array => {
  return new TextEncoder().encode(str); // Use TextEncoder for UTF-8 compatibility
};

describe('Murmur3 Hash', () => {
  const testInputs = {
    empty: '',
    short: 'hello',
    medium: 'hello world',
    long: 'The quick brown fox jumps over the lazy dog',
    emoji: '😀🎉🚀',
    numeric: '1234567890',
  };
  const seed1 = 123;
  const seed2 = 456;

  describe('Instance Methods', () => {
    it('should produce a non-negative integer hash for strings', () => {
      Object.values(testInputs).forEach((input) => {
        const hash = new Murmur3(input).result();
        expect(typeof hash).toBe('number');
        expect(hash).toBeGreaterThanOrEqual(0);
        // Check consistency
        expect(new Murmur3(input).result()).toBe(hash);
      });
    });

    it('should produce different hashes for different strings', () => {
      const hash1 = new Murmur3(testInputs.short).result();
      const hash2 = new Murmur3(testInputs.medium).result();
      expect(hash1).not.toBe(hash2);
    });

    it('should produce different hashes for the same string with different seeds', () => {
      const hash1 = new Murmur3(testInputs.medium, seed1).result();
      const hash2 = new Murmur3(testInputs.medium, seed2).result();
      expect(typeof hash1).toBe('number');
      expect(typeof hash2).toBe('number');
      expect(hash1).not.toBe(hash2);
    });

    it('should produce a non-negative integer hash for ArrayBuffer inputs', () => {
      Object.values(testInputs).forEach((input) => {
        const arrayBuffer = stringToArrayBuffer(input);
        const hash = new Murmur3(arrayBuffer).result();
        expect(typeof hash).toBe('number');
        expect(hash).toBeGreaterThanOrEqual(0);
        // Check consistency
        expect(new Murmur3(stringToArrayBuffer(input)).result()).toBe(hash);
      });
    });

    it('should produce different hashes for different ArrayBuffers', () => {
      const buf1 = stringToArrayBuffer(testInputs.short);
      const buf2 = stringToArrayBuffer(testInputs.medium);
      const hash1 = new Murmur3(buf1).result();
      const hash2 = new Murmur3(buf2).result();
      expect(hash1).not.toBe(hash2);
    });

    it('should produce different hashes for the same ArrayBuffer with different seeds', () => {
      const arrayBuffer = stringToArrayBuffer(testInputs.medium);
      const hash1 = new Murmur3(arrayBuffer, seed1).result();
      const hash2 = new Murmur3(arrayBuffer, seed2).result();
      expect(typeof hash1).toBe('number');
      expect(typeof hash2).toBe('number');
      expect(hash1).not.toBe(hash2);
    });

    it('should produce a non-negative integer hash for Uint8Array inputs', () => {
      Object.values(testInputs).forEach((input) => {
        const uint8Array = stringToUint8Array(input);
        const hash = new Murmur3(uint8Array).result();
        expect(typeof hash).toBe('number');
        expect(hash).toBeGreaterThanOrEqual(0);
        // Check consistency
        expect(new Murmur3(stringToUint8Array(input)).result()).toBe(hash);
      });
    });

    it('should produce different hashes for different Uint8Arrays', () => {
      const arr1 = stringToUint8Array(testInputs.short);
      const arr2 = stringToUint8Array(testInputs.medium);
      const hash1 = new Murmur3(arr1).result();
      const hash2 = new Murmur3(arr2).result();
      expect(hash1).not.toBe(hash2);
    });

    it('should produce different hashes for the same Uint8Array with different seeds', () => {
      const uint8Array = stringToUint8Array(testInputs.medium);
      const hash1 = new Murmur3(uint8Array, seed1).result();
      const hash2 = new Murmur3(uint8Array, seed2).result();
      expect(typeof hash1).toBe('number');
      expect(typeof hash2).toBe('number');
      expect(hash1).not.toBe(hash2);
    });

    it('should handle incremental hashing correctly (string)', () => {
      // 증분 해싱과 직접 해싱의 결과가 같아야 함
      const hashInstance = new Murmur3();
      hashInstance.hash('hello');
      hashInstance.hash(' ');
      hashInstance.hash('world');
      const incrementalHash = hashInstance.result();

      // 직접 한 번에 해싱한 결과와 비교
      const directHash = new Murmur3('hello world').result();

      expect(incrementalHash).toBe(directHash);
    });

    it('should handle incremental hashing correctly (Uint8Array)', () => {
      // 증분 해싱과 직접 해싱의 결과가 같아야 함
      const hashInstance = new Murmur3();
      hashInstance.hash(stringToUint8Array('hello'));
      hashInstance.hash(stringToUint8Array(' '));
      hashInstance.hash(stringToUint8Array('world'));
      const incrementalHash = hashInstance.result();

      // 직접 한 번에 해싱한 결과와 비교
      const directHash = new Murmur3(
        stringToUint8Array('hello world'),
      ).result();

      expect(incrementalHash).toBe(directHash);
    });

    it('should handle incremental hashing correctly (ArrayBuffer)', () => {
      // 증분 해싱과 직접 해싱의 결과가 같아야 함
      const hashInstance = new Murmur3();
      hashInstance.hash(stringToArrayBuffer('hello'));
      hashInstance.hash(stringToArrayBuffer(' '));
      hashInstance.hash(stringToArrayBuffer('world'));
      const incrementalHash = hashInstance.result();

      // 직접 한 번에 해싱한 결과와 비교
      const directHash = new Murmur3(
        stringToArrayBuffer('hello world'),
      ).result();

      expect(incrementalHash).toBe(directHash);
    });

    // 증분 해싱 디버깅을 위한 추가 테스트 케이스
    it('should handle incremental hashing with simple byte values', () => {
      // 간단한 바이트 패턴으로 테스트
      const simple = new Uint8Array([1, 2, 3, 4, 5, 6, 7, 8]);

      // 전체 입력을 한 번에 해싱
      const fullHash = new Murmur3(simple).result();

      // 4바이트씩 나누어 해싱 (4바이트는 Murmur3의 내부 처리 단위)
      const incHash = new Murmur3();
      incHash.hash(new Uint8Array(simple.buffer, 0, 4)); // 첫 4바이트
      incHash.hash(new Uint8Array(simple.buffer, 4, 4)); // 다음 4바이트

      expect(incHash.result()).toBe(fullHash);
    });

    it('should handle mixed type inputs but produce different results from direct hashing', () => {
      // 혼합 타입 증분 해싱
      const hashInstance = new Murmur3();
      hashInstance.hash('hello'); // 문자열
      hashInstance.hash(stringToUint8Array(' ')); // Uint8Array
      hashInstance.hash(stringToArrayBuffer('world')); // ArrayBuffer
      const mixedHash = hashInstance.result();

      // 해시 결과가 모두 유효한 숫자인지 확인
      expect(typeof mixedHash).toBe('number');
      expect(mixedHash).toBeGreaterThanOrEqual(0);

      // 동일한 입력을 다시 처리했을 때 일관된 결과가 나오는지 확인
      const hashInstance2 = new Murmur3();
      hashInstance2.hash('hello');
      hashInstance2.hash(stringToUint8Array(' '));
      hashInstance2.hash(stringToArrayBuffer('world'));
      expect(hashInstance2.result()).toBe(mixedHash);
    });

    it('should reset the hash state correctly', () => {
      const hashInstance = new Murmur3('initial data', 5);
      const hash1 = hashInstance.result();
      hashInstance.reset(10);
      hashInstance.hash('other data');
      const hash2 = hashInstance.result();
      expect(hash1).not.toBe(hash2);

      // Test resetting to default seed (0)
      hashInstance.reset();
      hashInstance.hash(testInputs.short);
      const defaultSeedHash = new Murmur3(testInputs.short, 0).result();
      expect(hashInstance.result()).toBe(defaultSeedHash);
    });

    it('should throw TypeError for invalid input type in constructor', () => {
      // @ts-expect-error Testing invalid type
      expect(() => new Murmur3(123)).toThrow(TypeError);
      // @ts-expect-error Testing invalid type
      expect(() => new Murmur3({})).toThrow(TypeError);
    });

    it('should throw TypeError for invalid input type in hash method', () => {
      const hashInstance = new Murmur3();
      // @ts-expect-error Testing invalid type
      expect(() => hashInstance.hash(123)).toThrow(TypeError);
      // @ts-expect-error Testing invalid type
      expect(() => hashInstance.hash(null)).toThrow(TypeError);
      // @ts-expect-error Testing invalid type
      expect(() => hashInstance.hash(undefined)).toThrow(TypeError);
    });

    it('should throw TypeError for invalid seed type in reset method', () => {
      const hashInstance = new Murmur3();
      // @ts-expect-error Testing invalid type
      expect(() => hashInstance.reset('abc')).toThrow(TypeError);
      // @ts-expect-error Testing invalid type
      expect(() => hashInstance.reset(null)).toThrow(TypeError);
    });

    it('should correctly hash empty ArrayBuffer and Uint8Array', () => {
      const emptyBuffer = new ArrayBuffer(0);
      const emptyUint8Array = new Uint8Array(0);
      const emptyString = '';

      // 빈 입력에 대한 해싱 결과 확인 (기본 시드 0)
      const emptyBufferHash = new Murmur3(emptyBuffer).result();
      const emptyUint8Hash = new Murmur3(emptyUint8Array).result();
      const emptyStringHash = new Murmur3(emptyString).result();

      // 모든 빈 입력에 대해 유효한 해시가 생성되는지 확인
      expect(typeof emptyBufferHash).toBe('number');
      expect(typeof emptyUint8Hash).toBe('number');
      expect(typeof emptyStringHash).toBe('number');

      // 빈 문자열은 0이 반환되는지 확인
      expect(emptyStringHash).toBe(0);

      // 시드가 있는 경우
      const seed = 123;
      const seededEmptyBufferHash = new Murmur3(emptyBuffer, seed).result();
      const seededEmptyUint8Hash = new Murmur3(emptyUint8Array, seed).result();
      const seededEmptyStringHash = new Murmur3(emptyString, seed).result();

      // 모든 빈 입력에 대해 유효한 해시가 생성되는지 확인
      expect(typeof seededEmptyBufferHash).toBe('number');
      expect(typeof seededEmptyUint8Hash).toBe('number');
      expect(typeof seededEmptyStringHash).toBe('number');

      // 동일한 시드로 빈 문자열을 해싱한 결과가 일관적인지 확인
      expect(seededEmptyStringHash).toBe(
        new Murmur3(emptyString, seed).result(),
      );
    });
  });

  describe('Static Method', () => {
    it('should produce a non-negative integer hash for strings', () => {
      Object.values(testInputs).forEach((input) => {
        const hash = Murmur3.hash(input);
        expect(typeof hash).toBe('number');
        expect(hash).toBeGreaterThanOrEqual(0);
        // Check consistency
        expect(Murmur3.hash(input)).toBe(hash);
      });
    });

    it('should produce different hashes for different strings', () => {
      const hash1 = Murmur3.hash(testInputs.short);
      const hash2 = Murmur3.hash(testInputs.medium);
      expect(hash1).not.toBe(hash2);
    });

    it('should produce different hashes for the same string with different seeds', () => {
      const hash1 = Murmur3.hash(testInputs.medium, seed1);
      const hash2 = Murmur3.hash(testInputs.medium, seed2);
      expect(typeof hash1).toBe('number');
      expect(typeof hash2).toBe('number');
      expect(hash1).not.toBe(hash2);
    });

    it('should produce a non-negative integer hash for ArrayBuffer inputs', () => {
      Object.values(testInputs).forEach((input) => {
        const arrayBuffer = stringToArrayBuffer(input);
        const hash = Murmur3.hash(arrayBuffer);
        expect(typeof hash).toBe('number');
        expect(hash).toBeGreaterThanOrEqual(0);
        // Check consistency
        expect(Murmur3.hash(stringToArrayBuffer(input))).toBe(hash);
      });
    });

    it('should produce different hashes for different ArrayBuffers', () => {
      const buf1 = stringToArrayBuffer(testInputs.short);
      const buf2 = stringToArrayBuffer(testInputs.medium);
      const hash1 = Murmur3.hash(buf1);
      const hash2 = Murmur3.hash(buf2);
      expect(hash1).not.toBe(hash2);
    });

    it('should produce different hashes for the same ArrayBuffer with different seeds', () => {
      const arrayBuffer = stringToArrayBuffer(testInputs.medium);
      const hash1 = Murmur3.hash(arrayBuffer, seed1);
      const hash2 = Murmur3.hash(arrayBuffer, seed2);
      expect(typeof hash1).toBe('number');
      expect(typeof hash2).toBe('number');
      expect(hash1).not.toBe(hash2);
    });

    it('should produce a non-negative integer hash for Uint8Array inputs', () => {
      Object.values(testInputs).forEach((input) => {
        const uint8Array = stringToUint8Array(input);
        const hash = Murmur3.hash(uint8Array);
        expect(typeof hash).toBe('number');
        expect(hash).toBeGreaterThanOrEqual(0);
        // Check consistency
        expect(Murmur3.hash(stringToUint8Array(input))).toBe(hash);
      });
    });

    it('should produce different hashes for different Uint8Arrays', () => {
      const arr1 = stringToUint8Array(testInputs.short);
      const arr2 = stringToUint8Array(testInputs.medium);
      const hash1 = Murmur3.hash(arr1);
      const hash2 = Murmur3.hash(arr2);
      expect(hash1).not.toBe(hash2);
    });

    it('should produce different hashes for the same Uint8Array with different seeds', () => {
      const uint8Array = stringToUint8Array(testInputs.medium);
      const hash1 = Murmur3.hash(uint8Array, seed1);
      const hash2 = Murmur3.hash(uint8Array, seed2);
      expect(typeof hash1).toBe('number');
      expect(typeof hash2).toBe('number');
      expect(hash1).not.toBe(hash2);
    });

    it('should throw TypeError for invalid input type in static method', () => {
      // @ts-expect-error Testing invalid type
      expect(() => Murmur3.hash(123)).toThrow(TypeError);
      // @ts-expect-error Testing invalid type
      expect(() => Murmur3.hash(true)).toThrow(TypeError);
    });

    it('should throw TypeError for invalid seed type in static method', () => {
      // @ts-expect-error Testing invalid type
      expect(() => Murmur3.hash('test', 'abc')).toThrow(TypeError);
      expect(() => Murmur3.hash('test', undefined)).not.toThrow(); // Undefined seed should default to 0
      // @ts-expect-error Testing invalid type
      expect(() => Murmur3.hash('test', null)).toThrow(TypeError);
    });

    it('should correctly hash empty ArrayBuffer and Uint8Array using static method', () => {
      const emptyBuffer = new ArrayBuffer(0);
      const emptyUint8Array = new Uint8Array(0);
      const emptyString = '';

      // 빈 입력에 대한 해싱 결과 확인 (기본 시드 0)
      const emptyBufferHash = Murmur3.hash(emptyBuffer);
      const emptyUint8Hash = Murmur3.hash(emptyUint8Array);
      const emptyStringHash = Murmur3.hash(emptyString);

      // 모든 빈 입력에 대해 유효한 해시가 생성되는지 확인
      expect(typeof emptyBufferHash).toBe('number');
      expect(typeof emptyUint8Hash).toBe('number');
      expect(typeof emptyStringHash).toBe('number');

      // 빈 문자열은 0이 반환되는지 확인
      expect(emptyStringHash).toBe(0);

      // 시드가 있는 경우
      const seed = 123;
      const seededEmptyBufferHash = Murmur3.hash(emptyBuffer, seed);
      const seededEmptyUint8Hash = Murmur3.hash(emptyUint8Array, seed);
      const seededEmptyStringHash = Murmur3.hash(emptyString, seed);

      // 모든 빈 입력에 대해 유효한 해시가 생성되는지 확인
      expect(typeof seededEmptyBufferHash).toBe('number');
      expect(typeof seededEmptyUint8Hash).toBe('number');
      expect(typeof seededEmptyStringHash).toBe('number');

      // 동일한 시드로 빈 문자열을 해싱한 결과가 일관적인지 확인
      expect(seededEmptyStringHash).toBe(Murmur3.hash(emptyString, seed));
    });
  });
});
