import { describe, expect, it } from 'vitest';

import { Murmur3 } from '../murmur3';

describe('Murmur3', () => {
  // 기본 기능 테스트
  describe('기본 해싱 기능', () => {
    it('동일한 입력에 대해 일관된 해시를 생성해야 함', () => {
      const hash1 = new Murmur3('hello').result();
      const hash2 = new Murmur3('hello').result();
      expect(hash2).toBe(hash1);
    });

    it('다른 입력에 대해 다른 해시를 생성해야 함', () => {
      const hash1 = new Murmur3('hello').result();
      const hash2 = new Murmur3('world').result();
      expect(hash2).not.toBe(hash1);
    });

    it('빈 문자열도 해싱할 수 있어야 함', () => {
      const hash = new Murmur3('').result();
      expect(typeof hash).toBe('number');
      expect(hash).toBeGreaterThanOrEqual(0);
    });
  });

  // 시드 값 테스트
  describe('시드 값 테스트', () => {
    it('같은 입력이라도 다른 시드 값으로 다른 해시를 생성해야 함', () => {
      const hash1 = new Murmur3('test', 1).result();
      const hash2 = new Murmur3('test', 2).result();
      expect(hash2).not.toBe(hash1);
    });

    it('시드 값 0은 기본값으로 동작해야 함', () => {
      const hash1 = new Murmur3('test').result();
      const hash2 = new Murmur3('test', 0).result();
      expect(hash2).toBe(hash1);
    });
  });

  // 메서드 체이닝 테스트
  describe('메서드 체이닝', () => {
    it('hash 메서드는 체이닝을 지원해야 함', () => {
      const murmur = new Murmur3();
      const result = murmur.hash('hello').hash('world').result();
      expect(typeof result).toBe('number');
    });

    it('reset 메서드는 체이닝을 지원해야 함', () => {
      const murmur = new Murmur3('test');
      const result = murmur.reset().hash('hello').result();
      expect(typeof result).toBe('number');
    });

    it('reset 후 다시 해싱이 가능해야 함', () => {
      const murmur = new Murmur3('test');
      const hash1 = murmur.result();
      murmur.reset();
      const hash2 = murmur.hash('different').result();
      expect(hash2).not.toBe(hash1);
    });
  });

  // 다양한 길이의 입력 테스트
  describe('다양한 길이의 입력', () => {
    it('1바이트 입력에 대한 해싱', () => {
      const hash = new Murmur3('a').result();
      expect(typeof hash).toBe('number');
    });

    it('2바이트 입력에 대한 해싱', () => {
      const hash = new Murmur3('ab').result();
      expect(typeof hash).toBe('number');
    });

    it('3바이트 입력에 대한 해싱', () => {
      const hash = new Murmur3('abc').result();
      expect(typeof hash).toBe('number');
    });

    it('4바이트 입력에 대한 해싱', () => {
      const hash = new Murmur3('abcd').result();
      expect(typeof hash).toBe('number');
    });

    it('5바이트 입력에 대한 해싱', () => {
      const hash = new Murmur3('abcde').result();
      expect(typeof hash).toBe('number');
    });

    it('긴 문자열에 대한 해싱', () => {
      const longString = 'a'.repeat(1000);
      const hash = new Murmur3(longString).result();
      expect(typeof hash).toBe('number');
    });
  });

  // 특수 케이스 테스트
  describe('특수 케이스', () => {
    it('Unicode 문자에 대한 해싱', () => {
      const hash = new Murmur3('안녕하세요').result();
      expect(typeof hash).toBe('number');
    });

    it('이모지에 대한 해싱', () => {
      const hash = new Murmur3('😀🎉🚀').result();
      expect(typeof hash).toBe('number');
    });

    it('연속 호출에서 일관된 결과를 반환해야 함', () => {
      const murmur = new Murmur3('test');
      const hash1 = murmur.result();
      const hash2 = murmur.result();
      expect(hash2).toBe(hash1);
    });
  });

  // 예외 처리 테스트
  describe('예외 처리', () => {
    it('hash 메서드는 문자열이 아닌 입력에 대해 예외를 발생시켜야 함', () => {
      const murmur = new Murmur3();
      // @ts-expect-error 일부러 잘못된 타입을 전달
      expect(() => murmur.hash(123)).toThrow(TypeError);
    });

    it('reset 메서드는 숫자가 아닌 시드에 대해 예외를 발생시켜야 함', () => {
      const murmur = new Murmur3();
      // @ts-expect-error 일부러 잘못된 타입을 전달
      expect(() => murmur.reset('not a number')).toThrow(TypeError);
    });
  });

  // 알려진 해시 값 테스트 (다른 구현체와의 일관성을 위해)

  // 기본 충돌 저항성 테스트
  describe('기본 충돌 저항성', () => {
    it('아주 약간 다른 입력에 대해 다른 해시를 생성해야 함', () => {
      const hash1 = new Murmur3('test_string_1').result();
      const hash2 = new Murmur3('test_string_2').result();
      const hash3 = new Murmur3('test_string_1a').result();
      const hash4 = new Murmur3('test_string_1b').result();

      expect(hash1).not.toBe(hash2);
      expect(hash1).not.toBe(hash3);
      expect(hash1).not.toBe(hash4);
      expect(hash2).not.toBe(hash3);
      expect(hash2).not.toBe(hash4);
      expect(hash3).not.toBe(hash4);
    });

    it('매우 유사한 입력에 대해 다른 해시를 생성해야 함', () => {
      const hash1 = new Murmur3('aaaaaaaaaa').result();
      const hash2 = new Murmur3('aaaaaaaaab').result();
      const hash3 = new Murmur3('baaaaaaaaa').result();

      expect(hash1).not.toBe(hash2);
      expect(hash1).not.toBe(hash3);
      expect(hash2).not.toBe(hash3);
    });
  });

  // 기본 분포 균일성 테스트 (간단한 검증)
  describe('기본 분포 균일성', () => {
    it('연속된 숫자 입력에 대해 해시 값이 특정 패턴을 보이지 않아야 함', () => {
      const hashes = new Set<number>();
      const iterations = 100; // 테스트 반복 횟수
      let collisions = 0;

      for (let i = 0; i < iterations; i++) {
        const input = `input_${i}`;
        const hash = new Murmur3(input).result();

        if (hashes.has(hash)) {
          collisions++;
        }
        hashes.add(hash);
      }

      // 충돌이 너무 많으면 문제가 있을 수 있음 (엄격한 기준은 아님)
      // 여기서는 충돌 횟수가 입력 개수의 10% 미만인지 확인
      expect(collisions).toBeLessThan(iterations * 0.1);

      // 해시 값의 범위가 어느 정도 넓게 분포하는지 확인 (단순 검사)
      // 모든 해시가 동일한 값으로 쏠리지 않았는지 확인하기 위함
      expect(hashes.size).toBeGreaterThan(iterations * 0.8); // 80% 이상 다른 해시 값 기대
    });
  });
});
