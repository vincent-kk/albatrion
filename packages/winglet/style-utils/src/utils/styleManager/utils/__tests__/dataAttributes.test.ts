import { describe, it, expect } from 'vitest';
import { dataAttributes } from '../dataAttributes';

describe('dataAttributes', () => {
  it('빈 객체에 대해 빈 객체를 반환해야 합니다', () => {
    const result = dataAttributes({});
    expect(result).toEqual({});
  });

  it('모든 값이 true인 경우 모든 키를 포함해야 합니다', () => {
    const input = {
      'data-active': true,
      'data-visible': true,
      'data-disabled': true,
    };
    const result = dataAttributes(input);
    expect(result).toEqual({
      'data-active': true,
      'data-visible': true,
      'data-disabled': true,
    });
  });

  it('false 값들은 제외하고 true 값들만 포함해야 합니다', () => {
    const input = {
      'data-active': true,
      'data-visible': false,
      'data-disabled': true,
      'data-hidden': false,
    };
    const result = dataAttributes(input);
    expect(result).toEqual({
      'data-active': true,
      'data-disabled': true,
    });
  });

  it('모든 값이 false인 경우 빈 객체를 반환해야 합니다', () => {
    const input = {
      'data-active': false,
      'data-visible': false,
      'data-disabled': false,
    };
    const result = dataAttributes(input);
    expect(result).toEqual({});
  });

  it('키 이름이 다양한 형태일 때도 올바르게 처리해야 합니다', () => {
    const input = {
      'data-test': true,
      'aria-hidden': false,
      'className': true,
      'id': false,
      'data-component-name': true,
    };
    const result = dataAttributes(input);
    expect(result).toEqual({
      'data-test': true,
      'className': true,
      'data-component-name': true,
    });
  });

  it('원본 객체를 변경하지 않아야 합니다', () => {
    const input = {
      'data-active': true,
      'data-visible': false,
    };
    const originalInput = { ...input };
    dataAttributes(input);
    expect(input).toEqual(originalInput);
  });
});
