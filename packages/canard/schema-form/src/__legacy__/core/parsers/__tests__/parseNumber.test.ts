import { describe, expect, it } from 'vitest';

import { parseNumber } from '../parseNumber';

describe('parseNumber', () => {
  describe('정수 변환 (isInteger: true)', () => {
    it('숫자를 입력하면 정수로 변환되어야 합니다', () => {
      expect(parseNumber(3.14, true)).toBe(3);
      expect(parseNumber(-3.14, true)).toBe(-3);
    });

    it('문자열 숫자를 입력하면 정수로 변환되어야 합니다', () => {
      expect(parseNumber('3.14', true)).toBe(3);
      expect(parseNumber('-3.14', true)).toBe(-3);
    });

    it('숫자가 아닌 문자열을 입력하면 NaN를 반환해야 합니다', () => {
      expect(parseNumber('abc', true)).toBeNaN();
    });

    it('NaN을 입력하면 NaN를 반환해야 합니다', () => {
      expect(parseNumber(NaN, true)).toBeNaN();
    });

    it('빈 문자열을 입력하면 NaN를 반환해야 합니다', () => {
      expect(parseNumber('', true)).toBeNaN();
    });
  });

  describe('실수 변환 (isInteger: false)', () => {
    it('숫자를 입력하면 그대로 반환해야 합니다', () => {
      expect(parseNumber(3.14, false)).toBe(3.14);
      expect(parseNumber(-3.14, false)).toBe(-3.14);
    });

    it('문자열 숫자를 입력하면 실수로 변환되어야 합니다', () => {
      expect(parseNumber('3.14', false)).toBe(3.14);
      expect(parseNumber('-3.14', false)).toBe(-3.14);
    });

    it('숫자가 아닌 문자열을 입력하면 NaN를 반환해야 합니다', () => {
      expect(parseNumber('abc', false)).toBeNaN();
    });

    it('NaN을 입력하면 NaN를 반환해야 합니다', () => {
      expect(parseNumber(NaN, false)).toBeNaN();
    });

    it('빈 문자열을 입력하면 NaN를 반환해야 합니다', () => {
      expect(parseNumber('', false)).toBeNaN();
    });
  });

  describe('32비트 정수 오버플로우 처리', () => {
    it('32비트 정수 범위를 초과하는 큰 수를 안전하게 처리해야 합니다', () => {
      const largeNumber = 999999999999; // 32비트 범위 초과
      expect(parseNumber(largeNumber, true)).toBe(999999999999);
      expect(parseNumber(largeNumber.toString(), true)).toBe(999999999999);
    });

    it('32비트 정수 경계값을 정확히 처리해야 합니다', () => {
      const maxInt32 = 2147483647;
      const overflowInt32 = 2147483648;

      expect(parseNumber(maxInt32, true)).toBe(maxInt32);
      expect(parseNumber(overflowInt32, true)).toBe(overflowInt32);
    });
  });

  describe('문자열 파싱 동작과 한계', () => {
    it('통화 형식 문자열을 올바르게 파싱해야 합니다', () => {
      expect(parseNumber('$1,234.56')).toBe(1234.56);
      expect(parseNumber('¥1,000')).toBe(1000);
      expect(parseNumber('€123.45')).toBe(123.45);
    });

    it('문자가 섞인 문자열에서 숫자만 추출해야 합니다', () => {
      expect(parseNumber('abc123def')).toBe(123);
      expect(parseNumber('price: 456 won')).toBe(456);
      expect(parseNumber('123px')).toBe(123);
    });

    it('여러 소수점이 있는 경우 parseFloat 동작을 따라야 합니다', () => {
      // parseFloat("1.2.3") === 1.2
      expect(parseNumber('1.2.3')).toBe(1.2);
      expect(parseNumber('1.23.456')).toBe(1.23);
      expect(parseNumber('0.1.2.3')).toBe(0.1);
    });

    it('여러 마이너스 기호가 있는 경우 parseFloat 동작을 따라야 합니다', () => {
      // parseFloat("1-2-3") === 1
      expect(parseNumber('1-2-3')).toBe(1);
      expect(parseNumber('-1-2-3')).toBe(-1);
      expect(parseNumber('12-34')).toBe(12);
    });

    it('연속된 마이너스 기호는 NaN을 반환해야 합니다', () => {
      // parseFloat("--123") === NaN
      expect(parseNumber('--123')).toBeNaN();
      expect(parseNumber('---456')).toBeNaN();
    });

    it('소수점만 있거나 마이너스만 있는 경우 NaN을 반환해야 합니다', () => {
      expect(parseNumber('.')).toBeNaN();
      expect(parseNumber('-')).toBeNaN();
      expect(parseNumber('.-')).toBeNaN();
      expect(parseNumber('-.')).toBeNaN();
    });

    it('공백 문자열은 NaN을 반환해야 합니다', () => {
      expect(parseNumber('   ')).toBeNaN();
      expect(parseNumber('\t')).toBeNaN();
      expect(parseNumber('\n')).toBeNaN();
    });
  });

  describe('특수 숫자값 처리', () => {
    it('Infinity를 올바르게 처리해야 합니다', () => {
      expect(parseNumber(Infinity)).toBe(Infinity);
      expect(parseNumber(-Infinity)).toBe(-Infinity);
      expect(parseNumber(Infinity, true)).toBe(Infinity); // Math.trunc(Infinity) === Infinity
    });

    it('매우 큰 수나 매우 작은 수를 처리해야 합니다', () => {
      expect(parseNumber(Number.MAX_VALUE)).toBe(Number.MAX_VALUE);
      expect(parseNumber(Number.MIN_VALUE)).toBe(Number.MIN_VALUE);
      expect(parseNumber(-Number.MAX_VALUE)).toBe(-Number.MAX_VALUE);
    });
  });

  describe('다양한 타입 입력 처리', () => {
    it('number가 아닌 타입들은 모두 NaN을 반환해야 합니다', () => {
      expect(parseNumber(null)).toBeNaN();
      expect(parseNumber(undefined)).toBeNaN();
      expect(parseNumber(true)).toBeNaN();
      expect(parseNumber(false)).toBeNaN();
      expect(parseNumber({})).toBeNaN();
      expect(parseNumber([])).toBeNaN();
      expect(parseNumber(Symbol('test'))).toBeNaN();
      expect(parseNumber(() => {})).toBeNaN();
    });
  });

  describe('실제 사용 시나리오에서의 한계', () => {
    it('사용자가 예상하지 못할 수 있는 동작들', () => {
      // 이런 케이스들은 사용자가 예상하지 못할 수 있음
      expect(parseNumber('1.2.3')).toBe(1.2); // 1.23이 아님
      expect(parseNumber('1-2-3')).toBe(1); // 123이 아님
    });

    it('극단적인 입력에 대한 안정성', () => {
      // 매우 긴 문자열
      const longString = 'a'.repeat(1000) + '123' + 'b'.repeat(1000);
      expect(parseNumber(longString)).toBe(123);

      // 많은 특수문자
      expect(parseNumber('!@#$%^&*()123.45[]{}|\\:;"<>?,./`~')).toBe(123.45);
    });
  });
});
