import { describe, expect, it } from 'vitest';

import { processClassValues } from '../processClassValues';

describe('processClassValues', () => {
  describe('기본 기능', () => {
    it('문자열 배열을 올바르게 처리해야 함', () => {
      expect(processClassValues(['btn', 'primary'], false)).toBe('btn primary');
      expect(processClassValues(['header', 'navbar', 'fixed'], false)).toBe(
        'header navbar fixed',
      );
    });

    it('빈 배열을 처리해야 함', () => {
      expect(processClassValues([], false)).toBe('');
      expect(processClassValues([], true)).toBe('');
    });

    it('단일 요소 배열을 처리해야 함', () => {
      expect(processClassValues(['btn'], false)).toBe('btn');
      expect(processClassValues(['btn'], true)).toBe('btn');
    });
  });

  describe('중복 제거 기능', () => {
    it('removeDuplicates가 true일 때 중복을 제거해야 함', () => {
      expect(processClassValues(['btn', 'btn', 'primary'], true)).toBe(
        'btn primary',
      );
      expect(processClassValues(['a', 'b', 'a', 'c', 'b'], true)).toBe('a b c');
    });

    it('removeDuplicates가 false일 때 중복을 유지해야 함', () => {
      expect(processClassValues(['btn', 'btn', 'primary'], false)).toBe(
        'btn btn primary',
      );
      expect(processClassValues(['a', 'b', 'a', 'c', 'b'], false)).toBe(
        'a b a c b',
      );
    });

    it('복잡한 중복 패턴을 처리해야 함', () => {
      expect(
        processClassValues(['btn', 'primary', 'btn', 'large', 'primary'], true),
      ).toBe('btn primary large');
    });
  });

  describe('문자열 처리', () => {
    it('공백이 포함된 문자열을 올바르게 분할해야 함', () => {
      expect(processClassValues(['btn primary large'], false)).toBe(
        'btn primary large',
      );
      expect(processClassValues(['btn   primary   large'], false)).toBe(
        'btn primary large',
      );
    });

    it('탭과 줄바꿈이 포함된 문자열을 처리해야 함', () => {
      expect(processClassValues(['btn\tprimary\nlarge'], false)).toBe(
        'btn primary large',
      );
      expect(processClassValues(['btn\r\nprimary\t\tlarge'], false)).toBe(
        'btn primary large',
      );
    });

    it('혼합된 공백 문자를 처리해야 함', () => {
      expect(
        processClassValues(['btn \t\n\r primary \t\n\r large'], false),
      ).toBe('btn primary large');
    });

    it('빈 문자열을 필터링해야 함', () => {
      expect(processClassValues(['btn', '', 'primary'], false)).toBe(
        'btn primary',
      );
      expect(processClassValues(['', 'btn', '', 'primary', ''], false)).toBe(
        'btn primary',
      );
    });
  });

  describe('숫자 처리', () => {
    it('숫자를 문자열로 변환해야 함', () => {
      expect(processClassValues([123, 456], false)).toBe('123 456');
      expect(processClassValues(['btn', 123, 'primary'], false)).toBe(
        'btn 123 primary',
      );
    });

    it('0을 올바르게 처리해야 함', () => {
      expect(processClassValues([0, 1, 2], false)).toBe('0 1 2');
      expect(processClassValues(['btn', 0, 'primary'], false)).toBe(
        'btn 0 primary',
      );
    });

    it('음수와 소수를 처리해야 함', () => {
      expect(processClassValues([-1, 3.14, -2.5], false)).toBe('-1 3.14 -2.5');
    });
  });

  describe('객체 처리', () => {
    it('조건부 객체를 올바르게 처리해야 함', () => {
      expect(
        processClassValues(
          [{ active: true, disabled: false, loading: true }],
          false,
        ),
      ).toBe('active loading');
    });

    it('빈 객체를 처리해야 함', () => {
      expect(processClassValues([{}], false)).toBe('');
      expect(processClassValues(['btn', {}, 'primary'], false)).toBe(
        'btn primary',
      );
    });

    it('모든 값이 false인 객체를 처리해야 함', () => {
      expect(
        processClassValues([{ active: false, disabled: false }], false),
      ).toBe('');
    });

    it('복잡한 키를 가진 객체를 처리해야 함', () => {
      expect(
        processClassValues(
          [{ 'btn-primary': true, 'btn-large': false, 'btn:hover': true }],
          false,
        ),
      ).toBe('btn-primary btn:hover');
    });
  });

  describe('배열 처리', () => {
    it('중첩된 배열을 올바르게 처리해야 함', () => {
      expect(processClassValues([['btn', 'primary']], false)).toBe(
        'btn primary',
      );
      expect(processClassValues([['btn', ['primary', 'large']]], false)).toBe(
        'btn primary large',
      );
    });

    it('깊게 중첩된 배열을 처리해야 함', () => {
      expect(
        processClassValues(
          [['btn', [['primary'], ['large', 'shadow']]]],
          false,
        ),
      ).toBe('btn primary large shadow');
    });

    it('빈 배열을 필터링해야 함', () => {
      expect(processClassValues([[], ['btn'], []], false)).toBe('btn');
      expect(processClassValues([['btn', [], 'primary']], false)).toBe(
        'btn primary',
      );
    });
  });

  describe('혼합 타입 처리', () => {
    it('모든 타입을 혼합해서 처리해야 함', () => {
      expect(
        processClassValues(
          [
            'btn',
            123,
            { active: true, disabled: false },
            ['primary', 'large'],
            'shadow',
          ],
          false,
        ),
      ).toBe('btn 123 active primary large shadow');
    });

    it('복잡한 중첩 구조를 처리해야 함', () => {
      expect(
        processClassValues(
          [
            'base',
            [
              'level1',
              {
                active: true,
                disabled: false,
              },
              ['level2', 'deep'],
            ],
            456,
          ],
          false,
        ),
      ).toBe('base level1 active level2 deep 456');
    });
  });

  describe('falsy 값 처리', () => {
    it('falsy 값들을 올바르게 필터링해야 함', () => {
      expect(
        processClassValues(['btn', null, undefined, false, 'primary'], false),
      ).toBe('btn primary');
    });

    it('0은 포함해야 함 (falsy이지만 유효한 값)', () => {
      expect(processClassValues(['btn', 0, 'primary'], false)).toBe(
        'btn 0 primary',
      );
    });

    it('빈 문자열은 제외해야 함', () => {
      expect(processClassValues(['btn', '', 'primary'], false)).toBe(
        'btn primary',
      );
    });
  });

  describe('중복 제거와 복잡한 구조', () => {
    it('중첩 구조에서 중복 제거를 올바르게 처리해야 함', () => {
      expect(
        processClassValues(
          ['btn', ['btn', 'primary'], { btn: true, primary: false }, 'btn'],
          true,
        ),
      ).toBe('btn primary');
    });

    it('객체와 배열이 혼합된 중복을 처리해야 함', () => {
      expect(
        processClassValues(
          [{ active: true }, ['active', 'btn'], 'active', { btn: true }],
          true,
        ),
      ).toBe('active btn');
    });
  });

  describe('성능 테스트', () => {
    it('대량의 클래스를 효율적으로 처리해야 함', () => {
      const largeArray = Array.from({ length: 1000 }, (_, i) => `class-${i}`);
      const result = processClassValues(largeArray, false);
      expect(result).toContain('class-0');
      expect(result).toContain('class-999');
      expect(result.split(' ')).toHaveLength(1000);
    });

    it('많은 중복을 효율적으로 처리해야 함', () => {
      const manyDuplicates = Array(1000).fill('btn');
      const result = processClassValues(manyDuplicates, true);
      expect(result).toBe('btn');
    });

    it('복잡한 중첩 구조를 효율적으로 처리해야 함', () => {
      const complexStructure = Array.from({ length: 100 }, (_, i) => [
        `outer-${i}`,
        { [`inner-${i}`]: i % 2 === 0 },
        [`nested-${i}`],
      ]);
      const result = processClassValues(complexStructure, false);
      expect(result).toContain('outer-0');
      expect(result).toContain('inner-0');
      expect(result).toContain('nested-99');
      expect(result).not.toContain('inner-1 ');
    });
  });

  describe('실제 사용 사례', () => {
    it('React 컴포넌트 스타일의 입력을 처리해야 함', () => {
      const variant = 'primary';
      const size = 'large';
      const isActive = true;
      const isDisabled = false;

      expect(
        processClassValues(
          [
            'btn',
            `btn-${variant}`,
            size && `btn-${size}`,
            {
              'btn-active': isActive,
              'btn-disabled': isDisabled,
            },
          ],
          true,
        ),
      ).toBe('btn btn-primary btn-large btn-active');
    });

    it('CSS 모듈 스타일의 입력을 처리해야 함', () => {
      const styles = {
        button: 'button_abc123',
        primary: 'primary_def456',
        large: 'large_ghi789',
      };

      expect(
        processClassValues(
          [styles.button, styles.primary, { [styles.large]: true }],
          false,
        ),
      ).toBe('button_abc123 primary_def456 large_ghi789');
    });

    it('Tailwind CSS 스타일의 입력을 처리해야 함', () => {
      expect(
        processClassValues(
          [
            'px-4 py-2',
            'bg-blue-500 hover:bg-blue-600',
            'text-white font-semibold',
            { 'ring-2 ring-blue-300': true },
          ],
          false,
        ),
      ).toBe(
        'px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white font-semibold ring-2 ring-blue-300',
      );
    });
  });

  describe('엣지 케이스', () => {
    it('매우 긴 클래스명을 처리해야 함', () => {
      const longClassName = 'a'.repeat(1000);
      expect(processClassValues([longClassName, 'short'], false)).toBe(
        `${longClassName} short`,
      );
    });

    it('특수 문자가 포함된 클래스명을 처리해야 함', () => {
      expect(
        processClassValues(
          ['btn-primary', 'btn_secondary', 'btn.tertiary'],
          false,
        ),
      ).toBe('btn-primary btn_secondary btn.tertiary');
    });

    it('유니코드 문자를 처리해야 함', () => {
      expect(processClassValues(['버튼', 'btn-한글', '🎨'], false)).toBe(
        '버튼 btn-한글 🎨',
      );
    });

    it('순환 참조를 방지해야 함', () => {
      const circular: any = { active: true };
      circular.self = circular;

      // 순환 참조가 있어도 처리 가능한 부분만 처리
      expect(processClassValues([circular], false)).toBe('active self');
    });
  });

  describe('타입별 상세 테스트', () => {
    it('문자열 내 공백 처리의 정확성을 검증해야 함', () => {
      // 연속된 공백들이 단일 공백으로 처리되는지 확인
      expect(processClassValues(['a     b     c'], false)).toBe('a b c');

      // 시작과 끝의 공백이 제거되는지 확인
      expect(processClassValues(['   a b c   '], false)).toBe('a b c');

      // 탭과 줄바꿈이 공백으로 변환되는지 확인
      expect(processClassValues(['a\t\nb\r\nc'], false)).toBe('a b c');
    });

    it('객체 키의 다양한 형태를 처리해야 함', () => {
      expect(
        processClassValues(
          [
            {
              'normal-key': true,
              'key with spaces': true,
              'key:with:colons': true,
              key_with_underscores: true,
              'key.with.dots': true,
              'key-with-dashes': true,
            },
          ],
          false,
        ),
      ).toBe(
        'normal-key key with spaces key:with:colons key_with_underscores key.with.dots key-with-dashes',
      );
    });
  });
});
