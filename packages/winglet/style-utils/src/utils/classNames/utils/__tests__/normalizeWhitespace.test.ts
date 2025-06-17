import { describe, expect, it } from 'vitest';

import { normalizeWhitespace } from '../normalizeWhitespace';

describe('normalizeWhitespace', () => {
  describe('기본 기능', () => {
    it('다중 공백을 단일 공백으로 변환해야 함', () => {
      expect(normalizeWhitespace('btn   primary')).toBe('btn primary');
      expect(normalizeWhitespace('a    b    c')).toBe('a b c');
      expect(normalizeWhitespace('hello     world')).toBe('hello world');
    });

    it('탭을 공백으로 변환해야 함', () => {
      expect(normalizeWhitespace('btn\tprimary')).toBe('btn primary');
      expect(normalizeWhitespace('a\t\tb\tc')).toBe('a b c');
      expect(normalizeWhitespace('hello\t\t\tworld')).toBe('hello world');
    });

    it('줄바꿈을 공백으로 변환해야 함', () => {
      expect(normalizeWhitespace('btn\nprimary')).toBe('btn primary');
      expect(normalizeWhitespace('a\n\nb\nc')).toBe('a b c');
      expect(normalizeWhitespace('hello\n\n\nworld')).toBe('hello world');
    });

    it('캐리지 리턴을 공백으로 변환해야 함', () => {
      expect(normalizeWhitespace('btn\rprimary')).toBe('btn primary');
      expect(normalizeWhitespace('a\r\rb\rc')).toBe('a b c');
      expect(normalizeWhitespace('hello\r\r\rworld')).toBe('hello world');
    });
  });

  describe('혼합 공백 문자 처리', () => {
    it('다양한 공백 문자를 혼합해서 처리해야 함', () => {
      expect(normalizeWhitespace('btn \t\n\r primary')).toBe('btn primary');
      expect(normalizeWhitespace('a\t \n\r b \t\n\r c')).toBe('a b c');
      expect(normalizeWhitespace('hello\t\n  \r\n\tworld')).toBe('hello world');
    });

    it('복잡한 공백 패턴을 처리해야 함', () => {
      expect(normalizeWhitespace('  \t\n  btn  \t\n  primary  \t\n  ')).toBe(
        'btn primary',
      );
      expect(
        normalizeWhitespace('\t\n\r   class1   \t\n\r   class2   \t\n\r'),
      ).toBe('class1 class2');
    });
  });

  describe('앞뒤 공백 제거', () => {
    it('앞쪽 공백을 제거해야 함', () => {
      expect(normalizeWhitespace('   btn primary')).toBe('btn primary');
      expect(normalizeWhitespace('\t\n\rbtn primary')).toBe('btn primary');
      expect(normalizeWhitespace('     hello world')).toBe('hello world');
    });

    it('뒤쪽 공백을 제거해야 함', () => {
      expect(normalizeWhitespace('btn primary   ')).toBe('btn primary');
      expect(normalizeWhitespace('btn primary\t\n\r')).toBe('btn primary');
      expect(normalizeWhitespace('hello world     ')).toBe('hello world');
    });

    it('앞뒤 공백을 모두 제거해야 함', () => {
      expect(normalizeWhitespace('   btn primary   ')).toBe('btn primary');
      expect(normalizeWhitespace('\t\n\rbtn primary\t\n\r')).toBe(
        'btn primary',
      );
      expect(normalizeWhitespace('     hello world     ')).toBe('hello world');
    });
  });

  describe('엣지 케이스', () => {
    it('빈 문자열을 처리해야 함', () => {
      expect(normalizeWhitespace('')).toBe('');
    });

    it('null이나 undefined에 대해 빈 문자열을 반환해야 함', () => {
      expect(normalizeWhitespace(null as any)).toBe('');
      expect(normalizeWhitespace(undefined as any)).toBe('');
    });

    it('공백만 있는 문자열을 처리해야 함', () => {
      expect(normalizeWhitespace('   ')).toBe('');
      expect(normalizeWhitespace('\t\n\r')).toBe('');
      expect(normalizeWhitespace('  \t\n\r  ')).toBe('');
    });

    it('단일 문자를 처리해야 함', () => {
      expect(normalizeWhitespace('a')).toBe('a');
      expect(normalizeWhitespace('1')).toBe('1');
      expect(normalizeWhitespace('!')).toBe('!');
    });

    it('이미 정규화된 문자열을 처리해야 함', () => {
      expect(normalizeWhitespace('btn primary')).toBe('btn primary');
      expect(normalizeWhitespace('hello world')).toBe('hello world');
      expect(normalizeWhitespace('a b c d e')).toBe('a b c d e');
    });
  });

  describe('특수 문자 처리', () => {
    it('특수 문자가 포함된 클래스명을 처리해야 함', () => {
      expect(normalizeWhitespace('btn-primary   btn_secondary')).toBe(
        'btn-primary btn_secondary',
      );
      expect(normalizeWhitespace('btn.large\t\tbtn:hover')).toBe(
        'btn.large btn:hover',
      );
    });

    it('숫자가 포함된 클래스명을 처리해야 함', () => {
      expect(normalizeWhitespace('col-12   row-6')).toBe('col-12 row-6');
      expect(normalizeWhitespace('text-2xl\t\ttext-3xl')).toBe(
        'text-2xl text-3xl',
      );
    });

    it('유니코드 문자를 처리해야 함', () => {
      expect(normalizeWhitespace('버튼   기본')).toBe('버튼 기본');
      expect(normalizeWhitespace('🎨\t\t🚀')).toBe('🎨 🚀');
      expect(normalizeWhitespace('α\n\nβ')).toBe('α β');
    });
  });

  describe('성능 테스트', () => {
    it('긴 문자열을 효율적으로 처리해야 함', () => {
      const longString = 'class'.repeat(1000).split('').join('   ');
      const result = normalizeWhitespace(longString);
      expect(result).toBe('class'.repeat(1000).split('').join(' '));
    });

    it('많은 공백이 있는 문자열을 처리해야 함', () => {
      const manySpaces = 'a' + ' '.repeat(1000) + 'b';
      expect(normalizeWhitespace(manySpaces)).toBe('a b');
    });

    it('복잡한 패턴을 효율적으로 처리해야 함', () => {
      const complexPattern = Array.from(
        { length: 100 },
        (_, i) => `class-${i}`,
      ).join('   \t\n\r   ');
      const result = normalizeWhitespace(complexPattern);
      const expected = Array.from({ length: 100 }, (_, i) => `class-${i}`).join(
        ' ',
      );
      expect(result).toBe(expected);
    });
  });

  describe('실제 사용 사례', () => {
    it('템플릿 리터럴에서 생성된 공백을 처리해야 함', () => {
      const className = `btn
        btn-primary
        btn-large`;
      expect(normalizeWhitespace(className)).toBe('btn btn-primary btn-large');
    });

    it('조건부로 생성된 클래스 문자열을 처리해야 함', () => {
      const isActive = true;
      const size = 'large';
      const className = `btn ${isActive ? 'active' : ''} ${size ? `size-${size}` : ''}`;
      expect(normalizeWhitespace(className)).toBe('btn active size-large');
    });

    it('CSS 프레임워크 클래스를 처리해야 함', () => {
      const tailwindClasses = `px-4 py-2
        bg-blue-500 hover:bg-blue-600
        text-white font-semibold
        rounded-lg shadow-md`;
      expect(normalizeWhitespace(tailwindClasses)).toBe(
        'px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white font-semibold rounded-lg shadow-md',
      );
    });

    it('동적으로 생성된 클래스를 처리해야 함', () => {
      const baseClass = 'component   ';
      const modifierClass = '   modifier   ';
      const stateClass = '   state   ';
      const combined = baseClass + modifierClass + stateClass;
      expect(normalizeWhitespace(combined)).toBe('component modifier state');
    });
  });

  describe('Unicode 문자 코드 처리', () => {
    it('정확한 Unicode 문자 코드를 사용해야 함', () => {
      // 스페이스(32), 탭(9), 줄바꿈(10), 캐리지 리턴(13)
      const testString = String.fromCharCode(
        32,
        32,
        97,
        32,
        9,
        98,
        10,
        99,
        13,
        100,
      );
      expect(normalizeWhitespace(testString)).toBe('a b c d');
    });

    it('다른 공백 유사 문자는 변환하지 않아야 함', () => {
      // Non-breaking space (160), em space (8195) 등
      const nonBreakingSpace = String.fromCharCode(160);
      const emSpace = String.fromCharCode(8195);
      expect(normalizeWhitespace(`a${nonBreakingSpace}b${emSpace}c`)).toBe(
        `a${nonBreakingSpace}b${emSpace}c`,
      );
    });
  });
});
