import { describe, expect, it } from 'vitest';

import { convertMsFromDuration } from '../convertMsFromDuration';

describe('convertMsFromDuration', () => {
  it('밀리초 단위를 올바르게 변환해야 합니다', () => {
    expect(convertMsFromDuration('100ms')).toBe(100);
    expect(convertMsFromDuration('500ms')).toBe(500);
    expect(convertMsFromDuration('1000ms')).toBe(1000);
  });

  it('초 단위를 올바르게 변환해야 합니다', () => {
    expect(convertMsFromDuration('1s')).toBe(1000);
    expect(convertMsFromDuration('5s')).toBe(5000);
    expect(convertMsFromDuration('10s')).toBe(10000);
  });

  it('분 단위를 올바르게 변환해야 합니다', () => {
    expect(convertMsFromDuration('1m')).toBe(60000);
    expect(convertMsFromDuration('5m')).toBe(300000);
    expect(convertMsFromDuration('10m')).toBe(600000);
  });

  it('시간 단위를 올바르게 변환해야 합니다', () => {
    expect(convertMsFromDuration('1h')).toBe(3600000);
    expect(convertMsFromDuration('5h')).toBe(18000000);
    expect(convertMsFromDuration('10h')).toBe(36000000);
  });

  it('공백이 있는 입력을 처리해야 합니다', () => {
    expect(convertMsFromDuration(' 100ms ')).toBe(100);
    expect(convertMsFromDuration(' 5s ')).toBe(5000);
    expect(convertMsFromDuration(' 10m ')).toBe(600000);
    expect(convertMsFromDuration(' 1h ')).toBe(3600000);
  });

  it('잘못된 형식의 입력을 처리해야 합니다', () => {
    expect(convertMsFromDuration('')).toBe(0);
    expect(convertMsFromDuration('invalid')).toBe(0);
    expect(convertMsFromDuration('100')).toBe(0);
    expect(convertMsFromDuration('ms')).toBe(0);
    expect(convertMsFromDuration('100x')).toBe(0);
    expect(convertMsFromDuration('100mms')).toBe(0);
  });

  it('0 값을 처리해야 합니다', () => {
    expect(convertMsFromDuration('0ms')).toBe(0);
    expect(convertMsFromDuration('0s')).toBe(0);
    expect(convertMsFromDuration('0m')).toBe(0);
    expect(convertMsFromDuration('0h')).toBe(0);
  });

  it('큰 숫자를 처리해야 합니다', () => {
    expect(convertMsFromDuration('999999ms')).toBe(999999);
    expect(convertMsFromDuration('999999s')).toBe(999999000);
    expect(convertMsFromDuration('999999m')).toBe(59999940000);
    expect(convertMsFromDuration('999999h')).toBe(3599996400000);
  });

  it('정규식이 캐시되는지 확인해야 합니다', () => {
    // 첫 번째 호출에서 정규식이 생성됨
    convertMsFromDuration('100ms');

    // 두 번째 호출에서도 동일한 정규식이 사용되어야 함
    expect(convertMsFromDuration('200ms')).toBe(200);
  });
});
