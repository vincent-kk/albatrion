import { afterEach, describe, expect, it } from 'vitest';

import { getValue } from '../manipulator/getValue';
import { setValue } from '../manipulator/setValue';
import { applyPatch } from '../patch/applyPatch/applyPatch';
import { mergePatch } from '../patch/mergePatch/mergePatch';

/**
 * RC-5 — 세 공개 쓰기 API(setValue / applyPatch / mergePatch)가 동일한 예약
 * 멤버 입력에 동일하게 관측되는 결과를 내는지 검사하는 정합 스위트.
 * 예약 멤버는 own 데이터 속성으로 기록되고, 프로토타입은 교체되지 않으며,
 * 에러가 발생하지 않고, Object.prototype 은 오염되지 않아야 한다.
 */
describe('reserved member consistency across pointer APIs', () => {
  const prototype = Object.prototype as Record<string, unknown>;

  afterEach(() => {
    delete prototype.x;
  });

  const readOwn = (target: object, key: string) =>
    Object.getOwnPropertyDescriptor(target, key)?.value;

  it.each([['__proto__'], ['constructor'], ['prototype']])(
    'setValue writes %s as an own data property',
    (name) => {
      const document: Record<string, unknown> = { keep: 1 };
      const result = setValue(document, `/${name}`, { x: 1 }) as Record<
        string,
        unknown
      >;

      expect(readOwn(result, name)).toEqual({ x: 1 });
      expect(result.keep).toBe(1);
      expect(Object.getPrototypeOf(result)).toBe(Object.prototype);
      expect(prototype.x).toBeUndefined();
    },
  );

  it.each([['__proto__'], ['constructor'], ['prototype']])(
    'applyPatch add writes %s as an own data property without throwing',
    (name) => {
      const result = applyPatch<Record<string, unknown>>({ keep: 1 }, [
        { op: 'add', path: `/${name}`, value: { x: 1 } },
      ]);

      expect(readOwn(result, name)).toEqual({ x: 1 });
      expect(result.keep).toBe(1);
      expect(Object.getPrototypeOf(result)).toBe(Object.prototype);
      expect(prototype.x).toBeUndefined();
    },
  );

  it.each([['__proto__'], ['constructor'], ['prototype']])(
    'mergePatch merges %s as an own data property',
    (name) => {
      const result = mergePatch<Record<string, unknown>>(
        { keep: 1 },
        JSON.parse(`{"${name}":{"x":1}}`),
      );

      expect(readOwn(result, name)).toEqual({ x: 1 });
      expect(result.keep).toBe(1);
      expect(Object.getPrototypeOf(result)).toBe(Object.prototype);
      expect(prototype.x).toBeUndefined();
    },
  );

  it.each([['__proto__'], ['constructor'], ['prototype']])(
    'the three APIs observe identically for %s (RC-5)',
    (name) => {
      const bySetValue = setValue({ keep: 1 }, `/${name}`, { x: 1 }) as Record<
        string,
        unknown
      >;
      const byApplyPatch = applyPatch<Record<string, unknown>>({ keep: 1 }, [
        { op: 'add', path: `/${name}`, value: { x: 1 } },
      ]);
      const byMergePatch = mergePatch<Record<string, unknown>>(
        { keep: 1 },
        JSON.parse(`{"${name}":{"x":1}}`),
      );

      const observe = (result: Record<string, unknown>) => ({
        ownKeys: Object.keys(result).sort(),
        value: readOwn(result, name),
        prototypeUnchanged: Object.getPrototypeOf(result) === Object.prototype,
      });

      expect(observe(byApplyPatch)).toEqual(observe(bySetValue));
      expect(observe(byMergePatch)).toEqual(observe(bySetValue));
      expect(prototype.x).toBeUndefined();
    },
  );

  it('the three APIs observe identically at nested positions', () => {
    const bySetValue = setValue(
      { a: { keep: 1 } },
      '/a/__proto__',
      { x: 1 },
    ) as Record<string, Record<string, unknown>>;
    const byApplyPatch = applyPatch<Record<string, Record<string, unknown>>>(
      { a: { keep: 1 } },
      [{ op: 'add', path: '/a/__proto__', value: { x: 1 } }],
    );
    const byMergePatch = mergePatch<Record<string, Record<string, unknown>>>(
      { a: { keep: 1 } },
      JSON.parse('{"a":{"__proto__":{"x":1}}}'),
    );

    for (const result of [bySetValue, byApplyPatch, byMergePatch]) {
      expect(readOwn(result.a, '__proto__')).toEqual({ x: 1 });
      expect(result.a.keep).toBe(1);
      expect(Object.getPrototypeOf(result.a)).toBe(Object.prototype);
    }
    expect(prototype.x).toBeUndefined();
  });

  describe('read side stays on own data', () => {
    it('getValue returns own reserved member data, never the prototype chain', () => {
      const withOwn = JSON.parse('{"__proto__":{"x":1}}');

      expect(getValue(withOwn, '/__proto__')).toEqual({ x: 1 });
      expect(getValue({}, '/__proto__')).toBeUndefined();
      expect(getValue({}, '/constructor')).toBeUndefined();
    });
  });
});
