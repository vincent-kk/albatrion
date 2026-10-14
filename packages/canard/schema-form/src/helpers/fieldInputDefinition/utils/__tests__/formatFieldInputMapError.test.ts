import { describe, expect, it } from 'vitest';

import { formatFieldInputMapError } from '../formatFieldInputMapError';

describe('formatFieldInputMapError', () => {
  it('FieldInputMap 에러 메시지를 포맷해야 합니다', () => {
    const result = formatFieldInputMapError(
      '/invalid[pattern',
      new SyntaxError('Invalid regular expression'),
    );

    expect(result).toContain('FieldInputMap');
    expect(result).toContain('/invalid[pattern');
    expect(result).toContain('How to fix');
  });

  describe('에러 메시지 일관성 테스트', () => {
    it('모든 포맷터가 "How to fix" 섹션을 포함해야 합니다', () => {
      const formatters = [formatFieldInputMapError('/path', new Error())];

      for (const message of formatters) {
        expect(message).toContain('How to fix');
      }
    });
  });

  describe('에러 메시지 스냅샷', () => {
    it('formatFieldInputMapError 스냅샷', () => {
      const result = formatFieldInputMapError(
        '/users/*/profile/[invalid',
        new SyntaxError(
          'Invalid regular expression: /\\/users\\/.*\\/profile\\/[invalid/: Unterminated character class',
        ),
      );
      expect(result).toMatchSnapshot();
    });
  });
});
