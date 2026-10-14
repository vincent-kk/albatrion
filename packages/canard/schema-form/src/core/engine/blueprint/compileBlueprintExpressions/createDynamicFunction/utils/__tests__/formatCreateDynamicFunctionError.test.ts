import { describe, expect, it } from 'vitest';

import { formatCreateDynamicFunctionError } from '../formatCreateDynamicFunctionError';

describe('formatCreateDynamicFunctionError', () => {
  it('동적 함수 생성 에러 메시지를 포맷해야 합니다', () => {
    const result = formatCreateDynamicFunctionError(
      'visible',
      "./category === 'premium'",
      "return value === 'test'",
      new SyntaxError('Unexpected token'),
    );

    expect(result).toContain('Failed to create dynamic function');
    expect(result).toContain('visible');
    expect(result).toContain('How to fix');
  });

  describe('에러 메시지 일관성 테스트', () => {
    it('모든 포맷터가 "How to fix" 섹션을 포함해야 합니다', () => {
      const formatters = [
        formatCreateDynamicFunctionError(
          'visible',
          'expr',
          'body',
          new Error(),
        ),
      ];

      for (const message of formatters) {
        expect(message).toContain('How to fix');
      }
    });
  });

  describe('에러 메시지 스냅샷', () => {
    it('formatCreateDynamicFunctionError 스냅샷', () => {
      const result = formatCreateDynamicFunctionError(
        'controls.visible',
        "../category === 'premium' && ../price > 100",
        "return values[0] === 'premium' && values[1] > 100",
        new SyntaxError("Unexpected token '>'"),
      );
      expect(result).toMatchSnapshot();
    });
  });
});
