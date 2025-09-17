import { describe, expect, it } from 'vitest';

import { getErrorMessage } from '../getErrorMessage';

describe('getErrorMessage', () => {
  describe('문자열 errorMessage', () => {
    it('keyword에 해당하는 문자열 메시지를 반환해야 합니다', () => {
      const keyword = 'required';
      const errorMessages = {
        required: 'This field is required',
        minLength: 'Too short',
      };
      const context = {};

      expect(getErrorMessage(keyword, errorMessages, context)).toBe(
        'This field is required',
      );
    });

    it('keyword가 없으면 default 메시지를 반환해야 합니다', () => {
      const keyword = 'unknown';
      const errorMessages = {
        required: 'Required',
        default: 'Default error message',
      };
      const context = {};

      expect(getErrorMessage(keyword, errorMessages, context)).toBe(
        'Default error message',
      );
    });

    it('keyword도 default도 없으면 null을 반환해야 합니다', () => {
      const keyword = 'unknown';
      const errorMessages = {
        required: 'Required',
      };
      const context = {};

      expect(getErrorMessage(keyword, errorMessages, context)).toBe(null);
    });
  });

  describe('다국어 errorMessage', () => {
    it('context.locale에 해당하는 메시지를 반환해야 합니다', () => {
      const keyword = 'required';
      const errorMessages = {
        required: {
          en: 'This field is required',
          ko: '필수 입력 항목입니다',
          ja: '必須項目です',
        },
      };
      const context = { locale: 'ko' };

      expect(getErrorMessage(keyword, errorMessages, context)).toBe(
        '필수 입력 항목입니다',
      );
    });

    it('다른 locale을 지정하면 해당 메시지를 반환해야 합니다', () => {
      const keyword = 'minLength';
      const errorMessages = {
        minLength: {
          en: 'Too short',
          ko: '너무 짧습니다',
          ja: '短すぎます',
        },
      };

      expect(getErrorMessage(keyword, errorMessages, { locale: 'en' })).toBe(
        'Too short',
      );
      expect(getErrorMessage(keyword, errorMessages, { locale: 'ja' })).toBe(
        '短すぎます',
      );
    });

    it('locale이 없는 경우 null을 반환해야 합니다', () => {
      const keyword = 'required';
      const errorMessages = {
        required: {
          en: 'Required',
          ko: '필수',
        },
      };
      const context = {};

      expect(getErrorMessage(keyword, errorMessages, context)).toBe(null);
    });

    it('해당 locale의 메시지가 없으면 null을 반환해야 합니다', () => {
      const keyword = 'required';
      const errorMessages = {
        required: {
          en: 'Required',
          ko: '필수',
        },
      };
      const context = { locale: 'fr' };

      expect(getErrorMessage(keyword, errorMessages, context)).toBe(null);
    });

    it('default가 다국어 객체인 경우도 처리해야 합니다', () => {
      const keyword = 'unknown';
      const errorMessages = {
        required: 'Required',
        default: {
          en: 'Default error',
          ko: '기본 오류',
        },
      };
      const context = { locale: 'ko' };

      expect(getErrorMessage(keyword, errorMessages, context)).toBe(
        '기본 오류',
      );
    });

    it('default가 문자열인 경우 locale과 상관없이 반환해야 합니다', () => {
      const keyword = 'unknown';
      const errorMessages = {
        required: 'Required',
        default: 'Default error message',
      };
      const context = { locale: 'ko' };

      expect(getErrorMessage(keyword, errorMessages, context)).toBe(
        'Default error message',
      );
    });
  });

  describe('혼합된 errorMessage 타입', () => {
    it('일부는 문자열, 일부는 다국어 객체를 처리해야 합니다', () => {
      const errorMessages = {
        required: 'This is required',
        minLength: {
          en: 'Too short',
          ko: '너무 짧습니다',
        },
        maxLength: {
          en: 'Too long',
          ko: '너무 깁니다',
        },
        default: 'Something went wrong',
      };

      expect(getErrorMessage('required', errorMessages, {})).toBe(
        'This is required',
      );
      expect(
        getErrorMessage('minLength', errorMessages, { locale: 'ko' }),
      ).toBe('너무 짧습니다');
      expect(
        getErrorMessage('maxLength', errorMessages, { locale: 'en' }),
      ).toBe('Too long');
      expect(getErrorMessage('unknown', errorMessages, {})).toBe(
        'Something went wrong',
      );
    });
  });

  describe('특수 케이스', () => {
    it('빈 errorMessages 객체를 처리해야 합니다', () => {
      const keyword = 'required';
      const errorMessages = {};
      const context = {};

      expect(getErrorMessage(keyword, errorMessages, context)).toBe(null);
    });

    it('errorMessage 값이 null이나 undefined인 경우 null을 반환해야 합니다', () => {
      const errorMessages = {
        required: null as any,
        minLength: undefined as any,
      };
      const context = {};

      expect(getErrorMessage('required', errorMessages, context)).toBe(null);
      expect(getErrorMessage('minLength', errorMessages, context)).toBe(null);
    });

    it('errorMessage 값이 숫자나 boolean인 경우 null을 반환해야 합니다', () => {
      const errorMessages = {
        required: 123 as any,
        minLength: true as any,
      };
      const context = {};

      expect(getErrorMessage('required', errorMessages, context)).toBe(null);
      expect(getErrorMessage('minLength', errorMessages, context)).toBe(null);
    });

    it('context에 다른 속성이 있어도 locale만 확인해야 합니다', () => {
      const keyword = 'required';
      const errorMessages = {
        required: {
          en: 'Required',
          ko: '필수',
        },
      };
      const context = {
        locale: 'en',
        user: 'test',
        timestamp: Date.now(),
      };

      expect(getErrorMessage(keyword, errorMessages, context)).toBe('Required');
    });

    it('다국어 객체에서 locale 값이 문자열이 아니면 null을 반환해야 합니다', () => {
      const keyword = 'required';
      const errorMessages = {
        required: {
          en: 'Required',
          ko: 123 as any,
        },
      };
      const context = { locale: 'ko' };

      expect(getErrorMessage(keyword, errorMessages, context)).toBe(null);
    });

    it('빈 문자열은 null을 반환해야 합니다', () => {
      const keyword = 'required';
      const errorMessages = {
        required: '',
      };
      const context = {};

      expect(getErrorMessage(keyword, errorMessages, context)).toBe(null);
    });

    it('다국어 객체에서 빈 문자열도 유효한 메시지로 반환해야 합니다', () => {
      const keyword = 'required';
      const errorMessages = {
        required: {
          en: '',
          ko: '필수',
        },
      };
      const context = { locale: 'en' };

      expect(getErrorMessage(keyword, errorMessages, context)).toBe('');
    });
  });
});
