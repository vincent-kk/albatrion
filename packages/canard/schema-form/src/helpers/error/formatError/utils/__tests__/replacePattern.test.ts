import { describe, expect, it } from 'vitest';

import { replacePattern } from '../replacePattern';

describe('replacePattern', () => {
  it('details의 값으로 패턴을 대체해야 합니다', () => {
    const errorMessage = 'Value must be at least {min} and at most {max}';
    const details = { min: 5, max: 10 };
    const value = 7;

    expect(replacePattern(errorMessage, details, value)).toBe(
      'Value must be at least 5 and at most 10',
    );
  });

  it('{value} 패턴을 실제 값으로 대체해야 합니다', () => {
    const errorMessage = 'The value {value} is invalid';
    const details = {};
    const value = 'test';

    expect(replacePattern(errorMessage, details, value)).toBe(
      'The value test is invalid',
    );
  });

  it('details와 value를 모두 대체해야 합니다', () => {
    const errorMessage = '{value} must be between {min} and {max}';
    const details = { min: 1, max: 100 };
    const value = 150;

    expect(replacePattern(errorMessage, details, value)).toBe(
      '150 must be between 1 and 100',
    );
  });

  it('details가 undefined일 때도 {value}를 대체해야 합니다', () => {
    const errorMessage = 'Invalid value: {value}';
    const details = undefined;
    const value = 'error';

    expect(replacePattern(errorMessage, details, value)).toBe(
      'Invalid value: error',
    );
  });

  it('details가 null일 때도 {value}를 대체해야 합니다', () => {
    const errorMessage = '{value} is not valid';
    const details = null as any;
    const value = 42;

    expect(replacePattern(errorMessage, details, value)).toBe(
      '42 is not valid',
    );
  });

  it('패턴이 없는 메시지는 그대로 반환해야 합니다', () => {
    const errorMessage = 'This is a simple error message';
    const details = { something: 'value' };
    const value = 'test';

    expect(replacePattern(errorMessage, details, value)).toBe(
      'This is a simple error message',
    );
  });

  it('details에 없는 패턴은 대체하지 않아야 합니다', () => {
    const errorMessage = '{unknown} pattern and {known} pattern';
    const details = { known: 'replaced' };
    const value = 'test';

    expect(replacePattern(errorMessage, details, value)).toBe(
      '{unknown} pattern and replaced pattern',
    );
  });

  it('숫자 값을 문자열로 변환하여 대체해야 합니다', () => {
    const errorMessage = 'Minimum: {min}, Maximum: {max}, Current: {value}';
    const details = { min: 0, max: 255 };
    const value = 128;

    expect(replacePattern(errorMessage, details, value)).toBe(
      'Minimum: 0, Maximum: 255, Current: 128',
    );
  });

  it('boolean 값을 문자열로 변환하여 대체해야 합니다', () => {
    const errorMessage = 'Expected {expected}, got {value}';
    const details = { expected: true };
    const value = false;

    expect(replacePattern(errorMessage, details, value)).toBe(
      'Expected true, got false',
    );
  });

  it('null과 undefined 값을 처리해야 합니다', () => {
    const errorMessage = 'Value is {value}';
    const details = {};

    expect(replacePattern(errorMessage, details, null)).toBe('Value is null');
    expect(replacePattern(errorMessage, details, undefined)).toBe(
      'Value is undefined',
    );
  });

  it('배열과 객체 값을 문자열로 변환해야 합니다', () => {
    const errorMessage = 'Invalid value: {value}';
    const details = {};
    const arrayValue = [1, 2, 3];
    const objectValue = { key: 'value' };

    expect(replacePattern(errorMessage, details, arrayValue)).toBe(
      'Invalid value: 1,2,3',
    );
    expect(replacePattern(errorMessage, details, objectValue)).toBe(
      'Invalid value: [object Object]',
    );
  });

  it('같은 패턴이 여러 번 나타나도 첫 번째만 대체해야 합니다', () => {
    const errorMessage = '{pattern} and {pattern} again';
    const details = { pattern: 'replaced' };
    const value = 'test';

    expect(replacePattern(errorMessage, details, value)).toBe(
      'replaced and {pattern} again',
    );
  });

  it('빈 문자열 details 값도 대체해야 합니다', () => {
    const errorMessage = 'Prefix{empty}Suffix';
    const details = { empty: '' };
    const value = 'test';

    expect(replacePattern(errorMessage, details, value)).toBe('PrefixSuffix');
  });

  it('특수 문자가 포함된 패턴도 처리해야 합니다', () => {
    const errorMessage = '{special-key} and {another_key}';
    const details = { 'special-key': 'value1', another_key: 'value2' };
    const value = 'test';

    expect(replacePattern(errorMessage, details, value)).toBe(
      'value1 and value2',
    );
  });
});
