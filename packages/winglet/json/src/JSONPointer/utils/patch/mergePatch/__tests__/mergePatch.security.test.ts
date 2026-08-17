import { afterEach, beforeEach, describe, expect, it } from 'vitest';

import { mergePatch } from '../mergePatch';

/**
 * mergePatch 의 예약 멤버 이름(__proto__, constructor, prototype) 차단에 대한
 * 인시던트 스위트. 일반 RFC 7396 동작은 mergePatch.test.ts 담당.
 * 페이로드는 JSON.parse 로 만든다 — 객체 리터럴의 __proto__ 는 own 속성이 아니라
 * 프로토타입 대입이 되어 다른 것을 검사하게 된다.
 */
describe('mergePatch security', () => {
  const prototype = Object.prototype as Record<string, unknown>;

  beforeEach(() => {
    delete prototype.x;
  });

  afterEach(() => {
    delete prototype.x;
  });

  it('RC-1: constructor.prototype 경로가 Object.prototype 에 도달하지 않아야 한다', () => {
    mergePatch({}, JSON.parse('{"constructor":{"prototype":{"x":1}}}'));

    expect(prototype.x).toBeUndefined();
    expect(({} as Record<string, unknown>).x).toBeUndefined();
  });

  it('RC-2: own __proto__ 가 immutable=false 경로에서도 Object.prototype 에 도달하지 않아야 한다', () => {
    mergePatch({ a: 1 }, JSON.parse('{"__proto__":{"x":1}}'), false);

    expect(prototype.x).toBeUndefined();
    expect(({} as Record<string, unknown>).x).toBeUndefined();
  });

  it('RC-3: 중첩 위치의 constructor.prototype 도 동일하게 차단되어야 한다', () => {
    mergePatch({}, JSON.parse('{"p":{"constructor":{"prototype":{"x":1}}}}'));

    expect(prototype.x).toBeUndefined();
    expect(({} as Record<string, unknown>).x).toBeUndefined();
  });
});
