import { describe, expect, it } from 'vitest';

import { Murmur3 } from '../murmur3';

describe('Murmur3', () => {
  it('기본 문자열 해시 생성', () => {
    const murmur = new Murmur3('hello');
    expect(murmur.result()).toBe(613153351);
  });

  it('빈 문자열 해시 생성', () => {
    const murmur = new Murmur3('');
    expect(murmur.result()).toBe(0);
  });

  it('시드값을 사용한 해시 생성', () => {
    const murmur = new Murmur3('hello', 123);
    expect(murmur.result()).toBe(1573043710);
  });

  it('여러 번의 hash 호출', () => {
    const murmur = new Murmur3();
    murmur.hash('hello').hash('world');
    expect(murmur.result()).toBe(2687965642);
  });

  it('문자열 연결 hash 호출', () => {
    const murmur1 = new Murmur3('hello').hash('world');
    const murmur2 = new Murmur3().hash('hello').hash('world');
    expect(murmur1.result()).toBe(murmur2.result());
  });

  it('reset 메서드 테스트', () => {
    const murmur = new Murmur3('hello');
    murmur.reset();
    expect(murmur.result()).toBe(0);
  });

  it('잘못된 입력 타입에 대한 에러 처리', () => {
    const murmur = new Murmur3();
    // @ts-expect-error 의도적으로 잘못된 타입 전달
    expect(() => murmur.hash(123)).toThrow(
      "Murmur3.hash: 'key' must be a string",
    );
  });

  it('잘못된 시드값 타입에 대한 에러 처리', () => {
    // @ts-expect-error 의도적으로 잘못된 타입 전달
    expect(() => new Murmur3('hello', '123')).toThrow(
      "Murmur3.reset: 'seed' must be a number",
    );
  });

  it('긴 문자열 해시 생성', () => {
    const longString = 'a'.repeat(1000);
    const murmur = new Murmur3(longString);
    expect(typeof murmur.result()).toBe('number');
    expect(murmur.result()).toBeGreaterThan(0);
  });

  it('특수 문자 포함 문자열 해시 생성', () => {
    const murmur = new Murmur3('Hello, World! @#$%^&*()');
    expect(typeof murmur.result()).toBe('number');
    expect(murmur.result()).toBeGreaterThan(0);
  });
});
