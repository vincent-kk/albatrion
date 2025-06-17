import { describe, expect, it } from 'vitest';

import { cx } from '../cx';

describe('cx', () => {
  describe('기본 사용법', () => {
    it('가변 인수로 클래스를 결합해야 함', () => {
      expect(cx('btn', 'btn-primary')).toBe('btn btn-primary');
      expect(cx('header', 'navbar', 'fixed-top')).toBe(
        'header navbar fixed-top',
      );
    });

    it('인수가 없을 때 빈 문자열을 반환해야 함', () => {
      expect(cx()).toBe('');
    });

    it('단일 클래스명을 올바르게 처리해야 함', () => {
      expect(cx('btn')).toBe('btn');
    });
  });

  describe('조건부 클래스 처리', () => {
    it('조건부 클래스를 올바르게 처리해야 함', () => {
      const isActive = true;
      const isDisabled = false;

      expect(cx('btn', isActive && 'active')).toBe('btn active');
      expect(cx('btn', isDisabled && 'disabled')).toBe('btn');
      expect(cx('btn', isActive && 'active', isDisabled && 'disabled')).toBe(
        'btn active',
      );
    });

    it('객체 형태의 조건부 클래스를 처리해야 함', () => {
      expect(
        cx('btn', {
          'btn-active': true,
          'btn-disabled': false,
          'btn-loading': true,
        }),
      ).toBe('btn btn-active btn-loading');
    });

    it('falsy 값들을 올바르게 필터링해야 함', () => {
      expect(cx('btn', null, undefined, false, '', 'primary')).toBe(
        'btn primary',
      );
    });
  });

  describe('숫자 처리', () => {
    it('숫자를 문자열로 변환해야 함', () => {
      expect(cx('btn', 123, 'primary')).toBe('btn 123 primary');
      expect(cx(0, 1, 2)).toBe('0 1 2');
    });

    it('음수와 소수를 올바르게 처리해야 함', () => {
      expect(cx(-1, 3.14, 'class')).toBe('-1 3.14 class');
    });
  });

  describe('중첩된 배열 처리', () => {
    it('중첩된 배열을 올바르게 처리해야 함', () => {
      expect(cx('btn', ['primary', ['large']])).toBe('btn primary large');
      expect(cx('base', ['level1', ['level2', 'deep']])).toBe(
        'base level1 level2 deep',
      );
    });

    it('복잡한 중첩 구조를 처리해야 함', () => {
      expect(
        cx(
          'btn',
          ['primary', { active: true, disabled: false }],
          ['large', 'shadow'],
        ),
      ).toBe('btn primary active large shadow');
    });
  });

  describe('성능 최적화된 기본 옵션', () => {
    it('중복 클래스를 제거하지 않아야 함 (성능 최적화)', () => {
      expect(cx('btn', 'btn', 'primary')).toBe('btn btn primary');
    });

    it('공백 정규화를 하지 않아야 함 (성능 최적화)', () => {
      expect(cx('btn   primary')).toBe('btn primary');
    });

    it('빈 값은 필터링해야 함', () => {
      expect(cx('btn', '', null, undefined, 'primary')).toBe('btn primary');
    });
  });

  describe('실제 사용 사례', () => {
    it('React 컴포넌트에서 사용하는 경우', () => {
      const Button = ({
        variant = 'default',
        size = 'medium',
        disabled = false,
        className = '',
      }) => {
        return cx(
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

    it('CSS 모듈과 함께 사용하는 경우', () => {
      const styles = {
        button: 'button_abc123',
        primary: 'primary_def456',
        large: 'large_ghi789',
        active: 'active_jkl012',
      };

      expect(
        cx(styles.button, styles.primary, styles.large, true && styles.active),
      ).toBe('button_abc123 primary_def456 large_ghi789 active_jkl012');
    });

    it('Tailwind CSS 클래스 조합', () => {
      const isHovered = true;
      const isPressed = false;

      expect(
        cx(
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

    it('동적 클래스 생성', () => {
      const theme = 'dark';
      const size = 'lg';
      const isLoading = true;

      expect(
        cx('component', `theme-${theme}`, `size-${size}`, {
          loading: isLoading,
          ready: !isLoading,
        }),
      ).toBe('component theme-dark size-lg loading');
    });

    it('폼 입력 필드 스타일링', () => {
      const hasError = true;
      const isFocused = false;
      const isRequired = true;

      expect(
        cx(
          'input',
          'border rounded',
          hasError && 'border-red-500',
          isFocused && 'ring-2 ring-blue-300',
          isRequired && 'required',
          !hasError && !isFocused && 'border-gray-300',
        ),
      ).toBe('input border rounded border-red-500 required');
    });
  });

  describe('엣지 케이스', () => {
    it('매우 긴 클래스명을 처리해야 함', () => {
      const longClassName = 'a'.repeat(1000);
      expect(cx(longClassName, 'short')).toBe(`${longClassName} short`);
    });

    it('특수 문자가 포함된 클래스명을 처리해야 함', () => {
      expect(cx('btn-primary', 'btn_secondary', 'btn.tertiary')).toBe(
        'btn-primary btn_secondary btn.tertiary',
      );
    });

    it('유니코드 문자가 포함된 클래스명을 처리해야 함', () => {
      expect(cx('버튼', 'btn-한글', '🎨')).toBe('버튼 btn-한글 🎨');
    });

    it('깊게 중첩된 빈 배열을 처리해야 함', () => {
      expect(cx([], [[]], [[[]]])).toBe('');
    });

    it('복잡한 조건부 로직을 처리해야 함', () => {
      const status: any = 'success';
      const priority = 'high';
      const isUrgent = priority === 'high';

      expect(
        cx(
          'notification',
          status === 'success' && 'bg-green-100',
          status === 'error' && 'bg-red-100',
          status === 'warning' && 'bg-yellow-100',
          isUrgent && 'border-2 border-red-500',
          !isUrgent && 'border border-gray-200',
        ),
      ).toBe('notification bg-green-100 border-2 border-red-500');
    });
  });

  describe('성능 테스트', () => {
    it('많은 인수를 효율적으로 처리해야 함', () => {
      const manyArgs = Array.from({ length: 100 }, (_, i) => `class-${i}`);
      const result = cx(...manyArgs);
      expect(result).toContain('class-0');
      expect(result).toContain('class-99');
    });

    it('복잡한 중첩과 조건을 효율적으로 처리해야 함', () => {
      const complexArgs = Array.from({ length: 50 }, (_, i) => [
        `base-${i}`,
        { [`active-${i}`]: i % 2 === 0 },
        i % 3 === 0 && `special-${i}`,
      ]);
      const result = cx(...complexArgs);
      expect(result).toContain('base-0');
      expect(result).toContain('active-0');
      expect(result).toContain('special-0');
      expect(result).not.toContain('active-1 ');
      expect(result).not.toContain('special-1 ');
    });
  });

  describe('타입 안전성', () => {
    it('다양한 타입의 인수를 안전하게 처리해야 함', () => {
      expect(
        cx('string', 123, true, false, null, undefined, { key: true }),
      ).toBe('string 123 key');
    });

    it('빈 객체를 처리해야 함', () => {
      expect(cx('btn', {})).toBe('btn');
    });

    it('빈 배열을 처리해야 함', () => {
      expect(cx('btn', [])).toBe('btn');
    });
  });
});
