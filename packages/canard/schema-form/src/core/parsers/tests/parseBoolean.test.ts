import { describe, expect, it } from 'vitest';

import { parseBoolean } from '../parseBoolean';

describe('parseBoolean', () => {
  it('undefined를 입력하면 undefined를 반환해야 합니다', () => {
    expect(parseBoolean(undefined)).toBeUndefined();
  });

  it('문자열 "true"를 입력하면 true를 반환해야 합니다', () => {
    expect(parseBoolean('true')).toBe(true);
  });

  it('문자열 "false"를 입력하면 false를 반환해야 합니다', () => {
    expect(parseBoolean('false')).toBe(false);
  });

  it('대소문자 구분 없이 "TRUE"를 입력하면 true를 반환해야 합니다', () => {
    expect(parseBoolean('TRUE')).toBe(true);
  });

  it('대소문자 구분 없이 "FALSE"를 입력하면 false를 반환해야 합니다', () => {
    expect(parseBoolean('FALSE')).toBe(false);
  });

  it('공백이 포함된 " true "를 입력하면 true를 반환해야 합니다', () => {
    expect(parseBoolean(' true ')).toBe(true);
  });

  it('truthy 값을 입력하면 true를 반환해야 합니다', () => {
    expect(parseBoolean(1)).toBe(true);
    expect(parseBoolean('1')).toBe(true);
    expect(parseBoolean({})).toBe(true);
  });

  it('falsy 값을 입력하면 false를 반환해야 합니다', () => {
    expect(parseBoolean(0)).toBe(false);
    expect(parseBoolean('')).toBe(false);
    expect(parseBoolean(null)).toBe(false);
  });
});
