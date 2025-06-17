import { describe, expect, it } from 'vitest';

import { polynomialHash31 } from '../polynomialHash31';

describe('polynomialHash31', () => {
  describe('기본 동작', () => {
    it('문자열을 base36 해시로 변환해야 함', () => {
      const result = polynomialHash31('hello');
      expect(typeof result).toBe('string');
      expect(result).toMatch(/^[0-9a-z]+$/);
      expect(result).toBe('01n1e4y'); // 실제 반환값
    });

    it('기본 길이 7으로 해시를 생성해야 함', () => {
      const result = polynomialHash31('test');
      expect(result.length).toBe(7);
      expect(result).toBe('002487m'); // 실제 반환값
    });

    it('지정된 길이로 해시를 생성해야 함', () => {
      const result1 = polynomialHash31('test', 3);
      const result2 = polynomialHash31('test', 8);
      const result3 = polynomialHash31('test', 10);

      expect(result1.length).toBe(3);
      expect(result1).toBe('248'); // 실제 반환값
      
      expect(result2.length).toBe(8);
      expect(result2).toBe('0002487m'); // 실제 반환값
      
      expect(result3.length).toBe(10);
      expect(result3).toBe('000002487m'); // 실제 반환값
    });
  });

  describe('결정성 (Deterministic)', () => {
    it('동일한 입력에 대해 항상 동일한 해시를 반환해야 함', () => {
      const input = 'consistent-test';
      const expectedHash = '084wgdp'; // 실제 반환값
      
      const hash1 = polynomialHash31(input);
      const hash2 = polynomialHash31(input);
      const hash3 = polynomialHash31(input);

      expect(hash1).toBe(expectedHash);
      expect(hash2).toBe(expectedHash);
      expect(hash3).toBe(expectedHash);
      expect(hash1).toBe(hash2);
      expect(hash2).toBe(hash3);
    });

    it('동일한 입력과 길이에 대해 항상 동일한 해시를 반환해야 함', () => {
      const input = 'deterministic-test';
      const length = 8;
      const expectedHash = '01jas8rx'; // 실제 반환값
      
      const hash1 = polynomialHash31(input, length);
      const hash2 = polynomialHash31(input, length);
      
      expect(hash1).toBe(expectedHash);
      expect(hash2).toBe(expectedHash);
      expect(hash1).toBe(hash2);
      expect(hash1.length).toBe(length);
    });
  });

  describe('다양한 입력에 대한 동작', () => {
    it('빈 문자열을 처리해야 함', () => {
      const result = polynomialHash31('');
      expect(typeof result).toBe('string');
      expect(result.length).toBe(7);
      expect(result).toBe('0000000'); // 실제 반환값
    });

    it('단일 문자를 처리해야 함', () => {
      const result = polynomialHash31('a');
      expect(typeof result).toBe('string');
      expect(result.length).toBe(7);
      expect(result).toBe('000002p'); // 실제 반환값
    });

    it('긴 문자열을 처리해야 함', () => {
      const longString = 'a'.repeat(1000);
      const result = polynomialHash31(longString);
      expect(typeof result).toBe('string');
      expect(result.length).toBe(7);
      expect(result).toBe('0ey89z4'); // 실제 반환값
    });

    it('특수 문자를 포함한 문자열을 처리해야 함', () => {
      const specialChars = '!@#$%^&*()';
      const result = polynomialHash31(specialChars);
      expect(typeof result).toBe('string');
      expect(result.length).toBe(7);
      expect(result).toBe('0x1uqda'); // 실제 반환값
    });

    it('유니코드 문자를 처리해야 함', () => {
      const unicode = '🚀🎉💡🔥⭐';
      const result = polynomialHash31(unicode);
      expect(typeof result).toBe('string');
      expect(result.length).toBe(7);
      expect(result).toBe('1d0kuhg'); // 실제 반환값
    });
  });

  describe('해시 분포', () => {
    it('서로 다른 입력에 대해 서로 다른 해시를 생성해야 함', () => {
      const testCases = [
        { input: 'test1', expected: '01tn2lb' },
        { input: 'test2', expected: '01tn2lc' },
        { input: 'test3', expected: '01tn2ld' },
        { input: 'hello', expected: '01n1e4y' },
        { input: 'world', expected: '01vgtci' },
        { input: 'hash', expected: '001whe6' }
      ];
      
      testCases.forEach(({ input, expected }) => {
        const result = polynomialHash31(input);
        expect(result).toBe(expected);
      });
      
      // 모든 해시가 고유한지 확인
      const hashes = testCases.map(({ expected }) => expected);
      const uniqueHashes = new Set(hashes);
      expect(uniqueHashes.size).toBe(hashes.length);
    });

    it('유사한 문자열에 대해서도 서로 다른 해시를 생성해야 함', () => {
      const testCases = [
        { input: 'abcdef', expected: '0001bh2iqr' },
        { input: 'abcdeg', expected: '0001bh2iqs' },
        { input: 'abcdfg', expected: '0001bh2irn' },
        { input: 'bacdef', expected: '0001bxkcjl' },
        { input: 'acbdef', expected: '0001bhlocl' }
      ];
      
      testCases.forEach(({ input, expected }) => {
        const result = polynomialHash31(input, 10);
        expect(result).toBe(expected);
      });
      
      // 모든 해시가 고유한지 확인
      const hashes = testCases.map(({ expected }) => expected);
      const uniqueHashes = new Set(hashes);
      expect(uniqueHashes.size).toBe(hashes.length);
    });
  });

  describe('길이 매개변수', () => {
    it('길이가 0일 때 빈 문자열을 반환해야 함', () => {
      const result = polynomialHash31('test', 0);
      expect(result).toBe(''); // 실제 반환값
    });

    it('길이가 1일 때 1자리 해시를 반환해야 함', () => {
      const result = polynomialHash31('test', 1);
      expect(result.length).toBe(1);
      expect(result).toMatch(/^[0-9a-z]$/);
      expect(result).toBe('2'); // 실제 반환값
    });

    it('매우 큰 길이 요청 시 가능한 최대 길이까지 반환해야 함', () => {
      const result = polynomialHash31('test', 100);
      expect(result.length).toBeLessThanOrEqual(100);
      expect(result).toMatch(/^[0-9a-z]*$/);
      // padStart로 인해 요청한 길이만큼 0으로 패딩됨
      expect(result.length).toBe(100);
    });
  });

  describe('Java String.hashCode() 호환성', () => {
    it('알려진 값들에 대해 예상되는 패턴을 따라야 함', () => {
      // Java의 String.hashCode()와 동일한 알고리즘을 사용하므로
      // 동일한 입력에 대해 일관된 결과를 생성해야 함
      const testCases = [
        { input: 'hello', expected: '01n1e4y' },
        { input: 'world', expected: '01vgtci' },
        { input: 'java', expected: '001xrfm' },
        { input: 'javascript', expected: '034iu7h' },
        { input: 'typescript', expected: '1qe5nk5' }
      ];

      testCases.forEach(({ input, expected }) => {
        const hash1 = polynomialHash31(input);
        const hash2 = polynomialHash31(input);
        expect(hash1).toBe(hash2);
        expect(hash1).toBe(expected);
      });
    });
  });

  describe('성능 특성', () => {
    it('빈 문자열과 긴 문자열 모두 합리적인 시간 내에 처리해야 함', () => {
      const start = performance.now();
      
      // 다양한 길이의 문자열 테스트
      polynomialHash31('');
      polynomialHash31('short');
      polynomialHash31('a'.repeat(10000));
      
      const end = performance.now();
      const duration = end - start;
      
      // 10ms 이내에 완료되어야 함 (성능 기준)
      expect(duration).toBeLessThan(10);
    });
  });

  describe('예외 상황', () => {
    it('음수 길이에 대해 slice 결과를 반환해야 함', () => {
      const result = polynomialHash31('test', -1);
      // slice(0, -1)의 결과로 마지막 문자가 제거됨
      expect(result).toBe('2487'); // 실제 반환값
    });

    it('소수점이 포함된 길이는 정수로 처리되어야 함', () => {
      const result = polynomialHash31('test', 3.7);
      expect(result.length).toBe(3);
      expect(result).toBe('248'); // 실제 반환값
    });
  });
});
