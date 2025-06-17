import { describe, expect, it } from 'vitest';

import { classNames } from '../classNames';
import type { ClassNamesOptions } from '../type';

describe('classNames', () => {
  describe('기본 사용법', () => {
    it('문자열 배열을 올바르게 결합해야 함', () => {
      expect(classNames(['btn', 'btn-primary'])).toBe('btn btn-primary');
      expect(classNames(['header', 'navbar', 'fixed-top'])).toBe(
        'header navbar fixed-top',
      );
    });

    it('빈 배열에 대해 빈 문자열을 반환해야 함', () => {
      expect(classNames([])).toBe('');
    });

    it('단일 클래스명을 올바르게 처리해야 함', () => {
      expect(classNames(['btn'])).toBe('btn');
    });
  });

  describe('조건부 클래스 처리', () => {
    it('객체 형태의 조건부 클래스를 올바르게 처리해야 함', () => {
      expect(
        classNames([
          'btn',
          {
            'btn-active': true,
            'btn-disabled': false,
            'btn-loading': true,
          },
        ]),
      ).toBe('btn btn-active btn-loading');
    });

    it('falsy 값들을 올바르게 필터링해야 함', () => {
      expect(
        classNames([
          'btn',
          null,
          undefined,
          false,
          '',
          0,
          'btn-primary',
          { active: true, disabled: false },
        ]),
      ).toBe('btn 0 btn-primary active');
    });

    it('중첩된 배열을 올바르게 처리해야 함', () => {
      expect(
        classNames([
          'btn',
          ['btn-primary', ['btn-large', 'shadow']],
          'rounded',
        ]),
      ).toBe('btn btn-primary btn-large shadow rounded');
    });
  });

  describe('숫자 처리', () => {
    it('숫자를 문자열로 변환해야 함', () => {
      expect(classNames(['btn', 123, 'primary'])).toBe('btn 123 primary');
      expect(classNames([0, 1, 2])).toBe('0 1 2');
    });

    it('음수와 소수를 올바르게 처리해야 함', () => {
      expect(classNames([-1, 3.14, 'class'])).toBe('-1 3.14 class');
    });
  });

  describe('복잡한 중첩 구조', () => {
    it('깊게 중첩된 구조를 올바르게 처리해야 함', () => {
      expect(
        classNames([
          'base',
          [
            'level1',
            [
              'level2',
              {
                active: true,
                disabled: false,
              },
              ['level3', 'deep'],
            ],
          ],
          'end',
        ]),
      ).toBe('base level1 level2 active level3 deep end');
    });

    it('React 컴포넌트 스타일의 복잡한 사용 사례를 처리해야 함', () => {
      const variant = 'primary';
      const size = 'large';
      const isActive = true;
      const isDisabled = false;
      const customClass = 'my-button';

      expect(
        classNames([
          'btn',
          `btn-${variant}`,
          size && `btn-${size}`,
          {
            'btn-active': isActive,
            'btn-disabled': isDisabled,
          },
          customClass,
        ]),
      ).toBe('btn btn-primary btn-large btn-active my-button');
    });
  });

  describe('옵션 처리', () => {
    describe('removeDuplicates 옵션', () => {
      it('기본적으로 중복을 제거해야 함', () => {
        expect(classNames(['btn', 'btn', 'primary', 'btn'])).toBe(
          'btn primary',
        );
      });

      it('removeDuplicates: false일 때 중복을 유지해야 함', () => {
        const options: ClassNamesOptions = { removeDuplicates: false };
        expect(classNames(['btn', 'btn', 'primary', 'btn'], options)).toBe(
          'btn btn primary btn',
        );
      });

      it('removeDuplicates: true일 때 중복을 제거해야 함', () => {
        const options: ClassNamesOptions = { removeDuplicates: true };
        expect(classNames(['btn', 'btn', 'primary', 'btn'], options)).toBe(
          'btn primary',
        );
      });

      it('복잡한 구조에서 중복 제거를 올바르게 처리해야 함', () => {
        expect(
          classNames([
            'btn',
            ['btn', 'primary'],
            { btn: true, active: true },
            'primary',
          ]),
        ).toBe('btn primary active');
      });
    });

    describe('normalizeWhitespace 옵션', () => {
      it('기본적으로 공백을 정규화해야 함', () => {
        expect(classNames(['btn   primary', 'large\t\nactive'])).toBe(
          'btn primary large active',
        );
      });

      it('normalizeWhitespace: false일 때 공백 정규화를 건너뛰어야 함', () => {
        const options: ClassNamesOptions = {
          normalizeWhitespace: false,
          removeDuplicates: false,
        };
        expect(classNames(['btn   primary'], options)).toBe('btn primary');
      });

      it('normalizeWhitespace: true일 때 공백을 정규화해야 함', () => {
        const options: ClassNamesOptions = {
          normalizeWhitespace: true,
          removeDuplicates: false,
        };
        expect(classNames(['btn   primary\t\nactive'], options)).toBe(
          'btn primary active',
        );
      });
    });

    describe('filterEmpty 옵션', () => {
      it('기본적으로 빈 값을 필터링해야 함', () => {
        expect(classNames(['btn', '', 'primary', null, undefined])).toBe(
          'btn primary',
        );
      });

      it('filterEmpty: false일 때 빈 문자열 결과도 반환해야 함', () => {
        const options: ClassNamesOptions = { filterEmpty: false };
        expect(classNames(['', null, undefined, false], options)).toBe('');
      });

      it('filterEmpty: true일 때 빈 값을 필터링해야 함', () => {
        const options: ClassNamesOptions = { filterEmpty: true };
        expect(classNames(['', null, undefined, false], options)).toBe('');
      });
    });

    describe('옵션 조합', () => {
      it('모든 옵션이 false일 때 원시 처리를 해야 함', () => {
        const options: ClassNamesOptions = {
          removeDuplicates: false,
          normalizeWhitespace: false,
          filterEmpty: false,
        };
        expect(classNames(['btn', 'btn', ''], options)).toBe('btn btn');
      });

      it('모든 옵션이 true일 때 완전한 처리를 해야 함', () => {
        const options: ClassNamesOptions = {
          removeDuplicates: true,
          normalizeWhitespace: true,
          filterEmpty: true,
        };
        expect(classNames(['btn   btn', 'primary\t', ''], options)).toBe(
          'btn primary',
        );
      });
    });
  });

  describe('엣지 케이스', () => {
    it('매우 긴 클래스명을 처리해야 함', () => {
      const longClassName = 'a'.repeat(1000);
      expect(classNames([longClassName, 'short'])).toBe(
        `${longClassName} short`,
      );
    });

    it('특수 문자가 포함된 클래스명을 처리해야 함', () => {
      expect(classNames(['btn-primary', 'btn_secondary', 'btn.tertiary'])).toBe(
        'btn-primary btn_secondary btn.tertiary',
      );
    });

    it('유니코드 문자가 포함된 클래스명을 처리해야 함', () => {
      expect(classNames(['버튼', 'btn-한글', '🎨'])).toBe('버튼 btn-한글 🎨');
    });

    it('깊게 중첩된 빈 배열을 처리해야 함', () => {
      expect(classNames([[], [[]], [[[]]]])).toBe('');
    });

    it('매우 많은 중복 클래스를 효율적으로 처리해야 함', () => {
      const manyDuplicates = Array(100).fill('btn');
      expect(classNames(manyDuplicates)).toBe('btn');
    });
  });

  describe('실제 사용 사례', () => {
    it('CSS 모듈과 함께 사용하는 경우', () => {
      const styles = {
        button: 'button_abc123',
        primary: 'primary_def456',
        large: 'large_ghi789',
      };

      expect(
        classNames([styles.button, styles.primary, { [styles.large]: true }]),
      ).toBe('button_abc123 primary_def456 large_ghi789');
    });

    it('Tailwind CSS 클래스 조합', () => {
      const isActive = true;
      const size = 'lg';

      expect(
        classNames([
          'px-4 py-2',
          'bg-blue-500 hover:bg-blue-600',
          'text-white font-semibold',
          'rounded-lg shadow-md',
          {
            'ring-2 ring-blue-300': isActive,
            'opacity-50 cursor-not-allowed': false,
          },
          size === 'lg' && 'px-6 py-3 text-lg',
        ]),
      ).toBe(
        'px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white font-semibold rounded-lg shadow-md ring-2 ring-blue-300 px-6 py-3 text-lg',
      );
    });

    it('반응형 디자인 클래스', () => {
      expect(
        classNames([
          'w-full',
          'sm:w-1/2',
          'md:w-1/3',
          'lg:w-1/4',
          'xl:w-1/5',
          {
            'hidden sm:block': true,
            'block sm:hidden': false,
          },
        ]),
      ).toBe('w-full sm:w-1/2 md:w-1/3 lg:w-1/4 xl:w-1/5 hidden sm:block');
    });

    it('상태 기반 클래스 조합', () => {
      const state: any = 'loading';
      const variant = 'primary';
      const disabled = false;

      expect(
        classNames([
          'btn',
          `btn-${variant}`,
          {
            'btn-loading': state === 'loading',
            'btn-success': state === 'success',
            'btn-error': state === 'error',
            'btn-disabled': disabled,
          },
          state === 'loading' && 'pointer-events-none',
        ]),
      ).toBe('btn btn-primary btn-loading pointer-events-none');
    });
  });

  describe('성능 테스트', () => {
    it('대량의 클래스를 효율적으로 처리해야 함', () => {
      const largeClassArray = Array.from(
        { length: 1000 },
        (_, i) => `class-${i}`,
      );
      const result = classNames(largeClassArray);
      expect(result).toContain('class-0');
      expect(result).toContain('class-999');
      expect(result.split(' ')).toHaveLength(1000);
    });

    it('복잡한 중첩 구조를 효율적으로 처리해야 함', () => {
      const complexStructure = Array.from({ length: 100 }, (_, i) => [
        `outer-${i}`,
        [`inner-${i}`, { [`conditional-${i}`]: i % 2 === 0 }],
      ]);
      const result = classNames(complexStructure);
      expect(result).toContain('outer-0');
      expect(result).toContain('inner-99');
      expect(result).toContain('conditional-0');
      expect(result).not.toContain('conditional-1 ');
    });
  });
});
