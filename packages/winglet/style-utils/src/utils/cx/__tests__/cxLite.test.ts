import { describe, expect, it } from 'vitest';

import { cx } from '../cx';
import { cxLite } from '../cxLite';

describe('cxLite', () => {
  describe('기본 사용법', () => {
    it('가변 인수로 클래스를 결합해야 함', () => {
      expect(cxLite('btn', 'btn-primary')).toBe('btn btn-primary');
      expect(cxLite('header', 'navbar', 'fixed-top')).toBe(
        'header navbar fixed-top',
      );
    });

    it('인수가 없을 때 빈 문자열을 반환해야 함', () => {
      expect(cxLite()).toBe('');
    });

    it('단일 클래스명을 올바르게 처리해야 함', () => {
      expect(cxLite('btn')).toBe('btn');
    });
  });

  describe('Lite 버전 특성', () => {
    it('문자열과 숫자만 처리해야 함', () => {
      expect(cxLite('btn', 123, 'primary')).toBe('btn 123 primary');
      expect(cxLite(0, 1, 2)).toBe('1 2'); // 0은 falsy이므로 필터링됨
    });

    it('falsy 값들을 올바르게 필터링해야 함', () => {
      expect(cxLite('btn', null, undefined, false, '', 'primary')).toBe(
        'btn primary',
      );
      expect(cxLite('', 0, false, 'btn', 'active')).toBe('btn active');
    });

    it('조건부 클래스를 간단하게 처리해야 함', () => {
      const isActive = true;
      const isDisabled = false;

      expect(cxLite('btn', isActive && 'active')).toBe('btn active');
      expect(cxLite('btn', isDisabled && 'disabled')).toBe('btn');
      expect(
        cxLite('btn', isActive && 'active', isDisabled && 'disabled'),
      ).toBe('btn active');
    });

    it('객체나 배열은 처리하지 않아야 함', () => {
      // cxLite는 객체나 배열을 처리하지 않고 truthy로만 판단
      expect(cxLite('btn', { active: true })).toBe('btn [object Object]');
      expect(cxLite('btn', ['primary', 'large'])).toBe('btn primary,large');
    });
  });

  describe('성능 최적화', () => {
    it('중복 클래스를 제거하지 않아야 함', () => {
      expect(cxLite('btn', 'btn', 'primary')).toBe('btn btn primary');
    });

    it('많은 인수를 효율적으로 처리해야 함', () => {
      const manyArgs = Array.from({ length: 100 }, (_, i) => `class-${i}`);
      const result = cxLite(...manyArgs);
      expect(result).toContain('class-0');
      expect(result).toContain('class-99');
      expect(result.split(' ')).toHaveLength(100);
    });
  });

  describe('실제 사용 사례', () => {
    it('React 컴포넌트에서 간단한 클래스 조합', () => {
      const Button = ({
        variant = 'default',
        size = 'medium',
        disabled = false,
        className = '',
      }) => {
        return cxLite(
          'btn',
          `btn-${variant}`,
          `btn-${size}`,
          disabled && 'btn-disabled',
          className,
        );
      };

      expect(Button({ variant: 'primary', size: 'large' })).toBe(
        'btn btn-primary btn-large',
      );
      expect(
        Button({
          variant: 'secondary',
          disabled: true,
          className: 'my-custom-class',
        }),
      ).toBe('btn btn-secondary btn-medium btn-disabled my-custom-class');
    });

    it('Tailwind CSS 클래스 조합', () => {
      const isHovered = true;
      const isPressed = false;

      expect(
        cxLite(
          'px-4 py-2',
          'bg-blue-500',
          'text-white font-semibold',
          'rounded-lg',
          isHovered && 'hover:bg-blue-600',
          isPressed && 'bg-blue-700',
        ),
      ).toBe(
        'px-4 py-2 bg-blue-500 text-white font-semibold rounded-lg hover:bg-blue-600',
      );
    });

    it('CSS 모듈과 함께 사용하는 경우', () => {
      const styles = {
        button: 'button_abc123',
        primary: 'primary_def456',
        large: 'large_ghi789',
        active: 'active_jkl012',
      };

      expect(
        cxLite(
          styles.button,
          styles.primary,
          styles.large,
          true && styles.active,
        ),
      ).toBe('button_abc123 primary_def456 large_ghi789 active_jkl012');
    });
  });

  describe('엣지 케이스', () => {
    it('매우 긴 클래스명을 처리해야 함', () => {
      const longClassName = 'a'.repeat(1000);
      expect(cxLite(longClassName, 'short')).toBe(`${longClassName} short`);
    });

    it('특수 문자가 포함된 클래스명을 처리해야 함', () => {
      expect(cxLite('btn-primary', 'btn_secondary', 'btn.tertiary')).toBe(
        'btn-primary btn_secondary btn.tertiary',
      );
    });

    it('유니코드 문자가 포함된 클래스명을 처리해야 함', () => {
      expect(cxLite('버튼', 'btn-한글', '🎨')).toBe('버튼 btn-한글 🎨');
    });

    it('다양한 타입의 truthy/falsy 값들을 처리해야 함', () => {
      expect(cxLite('btn', 0, '', null, undefined, false, NaN)).toBe('btn');
      expect(cxLite('btn', 1, 'active', ' ', true)).toBe('btn 1 active   true');
    });
  });

  describe('cx와 cxLite 비교', () => {
    it('기본 문자열 처리는 동일해야 함', () => {
      const args = ['btn', 'primary', 'large'];
      expect(cx(...args)).toBe(cxLite(...args));
    });

    it('조건부 클래스 처리는 동일해야 함', () => {
      const isActive = true;
      const isDisabled = false;
      const args = ['btn', isActive && 'active', isDisabled && 'disabled'];
      expect(cx(...args)).toBe(cxLite(...args));
    });

    it('객체 처리에서는 다르게 동작해야 함', () => {
      const objectArg = { active: true, disabled: false };
      expect(cx('btn', objectArg)).toBe('btn active');
      expect(cxLite('btn', objectArg)).toBe('btn [object Object]');
    });

    it('배열 처리에서는 다르게 동작해야 함', () => {
      const arrayArg = ['primary', 'large'];
      expect(cx('btn', arrayArg)).toBe('btn primary large');
      expect(cxLite('btn', arrayArg)).toBe('btn primary,large');
    });

    it('중첩 배열 처리에서는 다르게 동작해야 함', () => {
      const nestedArray = ['primary', ['large', 'shadow']];
      expect(cx('btn', nestedArray)).toBe('btn primary large shadow');
      expect(cxLite('btn', nestedArray)).toBe('btn primary,large,shadow');
    });
  });

  describe('타입 안전성', () => {
    it('다양한 타입의 인수를 안전하게 처리해야 함', () => {
      expect(cxLite('string', 123, true, false, null, undefined)).toBe(
        'string 123 true',
      );
    });

    it('빈 문자열과 공백 문자열을 구분해야 함', () => {
      expect(cxLite('btn', '', ' ', 'primary')).toBe('btn   primary');
    });
  });
});
