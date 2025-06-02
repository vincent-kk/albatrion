import { describe, expect, it } from 'vitest';

import { mergePatchRecursive } from '../mergePatchRecursive';

describe('mergePatchRecursive', () => {
  describe('기본 기능 테스트', () => {
    it('undefined patch가 주어지면 source를 그대로 반환한다', () => {
      const source = { a: 1, b: 2 };
      const result = mergePatchRecursive(source, undefined);

      expect(result).toBe(source); // 동일한 참조
      expect(result).toEqual({ a: 1, b: 2 });
    });

    it('undefined source가 주어지면 빈 객체로 처리한다', () => {
      const patch = { a: 1, b: 2 };
      const result = mergePatchRecursive(undefined, patch);

      expect(result).toEqual({ a: 1, b: 2 });
    });

    it('non-object patch가 주어지면 patch 값을 그대로 반환한다', () => {
      const source = { a: 1, b: 2 };
      const patch = 'string patch';
      const result = mergePatchRecursive(source, patch as any);

      expect(result).toBe(patch);
    });

    it('null patch가 주어지면 null을 반환한다', () => {
      const source = { a: 1, b: 2 };
      const result = mergePatchRecursive(source, null as any);

      expect(result).toBe(null);
    });
  });

  describe('원본 객체 변경 (Mutation) 테스트', () => {
    it('source 객체를 직접 변경한다 (깊은 복사 최소화)', () => {
      const source = { a: 1, b: 2 };
      const patch = { b: 3, c: 4 };
      const result = mergePatchRecursive(source, patch);

      expect(result).toBe(source); // 동일한 참조
      expect(source).toEqual({ a: 1, b: 3, c: 4 }); // 원본이 변경됨
    });

    it('중첩 객체의 경우 기존 객체 참조를 유지한다', () => {
      const innerObject = { x: 1, y: 2 };
      const source = { a: 1, nested: innerObject };
      const patch = { nested: { y: 3, z: 4 } };

      const result = mergePatchRecursive(source, patch);

      expect(result).toBe(source); // 최상위 객체 참조 유지
      expect(result.nested).toBe(innerObject); // 중첩 객체 참조도 유지
      expect(innerObject).toEqual({ x: 1, y: 3, z: 4 }); // 중첩 객체가 변경됨
    });

    it('새로운 중첩 객체를 추가할 때 재귀적으로 병합한다', () => {
      const source = { a: 1 };
      const patchValue = { x: 1, y: 2 };
      const patch = { b: patchValue };

      const result = mergePatchRecursive(source, patch);

      expect(result).toBe(source); // 최상위 객체 참조 유지
      expect(result.b).toEqual({ x: 1, y: 2 }); // 새 중첩 객체가 추가됨
      expect(result.a).toBe(1); // 기존 속성 유지

      // mergePatchRecursive(undefined, patchValue)가 호출되어
      // undefined는 {}로 기본값 처리되고, patchValue와 병합하여 새로운 객체가 생성됨
      expect(typeof result.b).toBe('object');
      expect(result.b).not.toBeNull();
    });
  });

  describe('null 값으로 속성 삭제 테스트', () => {
    it('null 값이 있는 속성을 삭제한다', () => {
      const source = { a: 1, b: 2, c: 3 };
      const patch = { b: null, d: 4 };

      const result = mergePatchRecursive(source, patch);

      expect(result).toEqual({ a: 1, c: 3, d: 4 });
      expect(result).not.toHaveProperty('b');
    });

    it('중첩 객체에서 null 값으로 속성 삭제', () => {
      const source = {
        level1: {
          a: 1,
          b: 2,
          level2: { x: 1, y: 2, z: 3 },
        },
      };
      const patch = {
        level1: {
          b: null,
          level2: { y: null, w: 4 },
        },
      };

      const result = mergePatchRecursive(source, patch);

      expect(result.level1).not.toHaveProperty('b');
      expect(result.level1.level2).not.toHaveProperty('y');
      expect(result.level1.level2).toEqual({ x: 1, z: 3, w: 4 });
    });

    it('존재하지 않는 속성에 null을 설정해도 에러가 발생하지 않는다', () => {
      const source = { a: 1 };
      const patch = { nonexistent: null };

      expect(() => mergePatchRecursive(source, patch)).not.toThrow();
      expect(source).toEqual({ a: 1 });
    });
  });

  describe('깊은 재귀 테스트', () => {
    it('여러 레벨의 중첩 객체를 올바르게 병합한다', () => {
      const source = {
        level1: {
          level2: {
            level3: {
              level4: {
                a: 1,
                b: 2,
              },
              c: 3,
            },
            d: 4,
          },
          e: 5,
        },
        f: 6,
      };

      const patch = {
        level1: {
          level2: {
            level3: {
              level4: {
                b: 'changed',
                new: 'added',
              },
            },
          },
        },
      };

      const result = mergePatchRecursive(source, patch);

      expect(result.level1.level2.level3.level4).toEqual({
        a: 1,
        b: 'changed',
        new: 'added',
      });
      expect(result.level1.level2.level3.c).toBe(3);
      expect(result.level1.level2.d).toBe(4);
      expect(result.level1.e).toBe(5);
      expect(result.f).toBe(6);
    });

    it('깊은 중첩에서도 객체 참조를 유지한다', () => {
      const level4 = { a: 1, b: 2 };
      const level3 = { level4, c: 3 };
      const level2 = { level3, d: 4 };
      const level1 = { level2, e: 5 };
      const source = { level1, f: 6 };

      const patch = {
        level1: {
          level2: {
            level3: {
              level4: {
                b: 'modified',
              },
            },
          },
        },
      };

      const result = mergePatchRecursive(source, patch);

      // 모든 객체 참조가 유지되어야 함
      expect(result).toBe(source);
      expect(result.level1).toBe(level1);
      expect(result.level1.level2).toBe(level2);
      expect(result.level1.level2.level3).toBe(level3);
      expect(result.level1.level2.level3.level4).toBe(level4);

      // 값은 올바르게 변경되어야 함
      expect(level4.b).toBe('modified');
    });
  });

  describe('복잡한 데이터 타입 테스트', () => {
    it('배열 값을 올바르게 처리한다', () => {
      const source = {
        numbers: [1, 2, 3],
        objects: [{ a: 1 }, { b: 2 }],
      };
      const patch = {
        numbers: [4, 5],
        objects: [{ c: 3 }],
      };

      const result = mergePatchRecursive(source, patch);

      expect(result.numbers).toEqual([4, 5]);
      expect(result.objects).toEqual([{ c: 3 }]);
      expect(result.numbers).toBe(patch.numbers); // 참조가 patch에서 가져온 것
    });

    it('함수 값을 올바르게 처리한다', () => {
      const originalFn = () => 'original';
      const newFn = () => 'new';

      const source = { fn: originalFn, other: 'value' };
      const patch = { fn: newFn };

      const result = mergePatchRecursive(source, patch);

      expect(result.fn).toBe(newFn);
      expect(result.fn()).toBe('new');
      expect(result.other).toBe('value');
    });

    it('Date 객체를 올바르게 처리한다', () => {
      const originalDate = new Date('2024-01-01');
      const newDate = new Date('2024-12-31');

      const source = { created: originalDate, count: 1 };
      const patch = { created: newDate };

      const result = mergePatchRecursive(source, patch);

      expect(result.created).toBe(newDate);
      expect(result.count).toBe(1);
    });
  });

  describe('성능 및 메모리 최적화 테스트', () => {
    it('대용량 객체에서 필요한 부분만 처리한다', () => {
      // 대용량 객체 생성
      const largeSource: Record<string, any> = {};
      for (let i = 0; i < 1000; i++) {
        largeSource[`key${i}`] = {
          data: new Array(100).fill(i),
          nested: { value: i * 2 },
        };
      }

      // 작은 패치
      const patch = {
        key0: { data: [999], nested: { value: 999 } },
        key999: null,
      };

      const result = mergePatchRecursive(largeSource, patch);

      expect(result).toBe(largeSource); // 원본 객체 참조 유지
      expect(result.key0.data).toEqual([999]);
      expect(result.key0.nested.value).toBe(999);
      expect(result).not.toHaveProperty('key999');

      // 변경되지 않은 키들은 원본 참조 유지
      for (let i = 1; i < 999; i++) {
        expect(result[`key${i}`]).toBe(largeSource[`key${i}`]);
      }
    });

    it('깊은 중첩에서 변경되지 않은 브랜치는 참조를 유지한다', () => {
      const unchangedBranch = {
        deep: {
          nested: {
            data: new Array(1000).fill('unchanged'),
          },
        },
      };

      const source = {
        branch1: unchangedBranch,
        branch2: { value: 'original' },
      };

      const patch = {
        branch2: { value: 'modified' },
      };

      const result = mergePatchRecursive(source, patch);

      expect(result.branch1).toBe(unchangedBranch); // 변경되지 않은 브랜치는 참조 유지
      expect(result.branch1.deep).toBe(unchangedBranch.deep);
      expect(result.branch1.deep.nested).toBe(unchangedBranch.deep.nested);
      expect(result.branch2.value).toBe('modified');
    });
  });

  describe('엣지 케이스 테스트', () => {
    it('빈 객체들을 올바르게 처리한다', () => {
      const source = {};
      const patch = {};
      const result = mergePatchRecursive(source, patch);

      expect(result).toBe(source);
      expect(result).toEqual({});
    });

    it('순환 참조가 있는 객체를 안전하게 처리한다', () => {
      const source: any = { a: 1 };
      source.self = source; // 순환 참조

      const patch = { b: 2 };

      expect(() => mergePatchRecursive(source, patch)).not.toThrow();
      expect(source.b).toBe(2);
      expect(source.self).toBe(source); // 순환 참조 유지
    });

    it('prototype 오염을 방지한다', () => {
      const source = { a: 1 };
      const maliciousPatch = {
        __proto__: { polluted: true },
        constructor: { prototype: { polluted: true } },
      };

      mergePatchRecursive(source, maliciousPatch);

      expect((Object.prototype as any).polluted).toBeUndefined();
      expect(source.constructor).toBeDefined(); // constructor가 변경됨
    });

    it('Symbol 키를 올바르게 처리한다', () => {
      const symbolKey = Symbol('test');
      const source: any = { normal: 'value' };
      source[symbolKey] = 'original';
      const patch = { normal: 'modified' };

      const result = mergePatchRecursive(source, patch);

      expect((result as any)[symbolKey]).toBe('original'); // Symbol 키는 유지
      expect(result.normal).toBe('modified');
    });
  });

  describe('타입 안전성 테스트', () => {
    it('잘못된 타입의 patch도 안전하게 처리한다', () => {
      const source = { a: 1, b: { c: 2 } };

      // 다양한 잘못된 타입들
      const invalidPatches = [123, 'string', true, [], new Date(), () => {}];

      invalidPatches.forEach((invalidPatch) => {
        expect(() =>
          mergePatchRecursive(source, invalidPatch as any),
        ).not.toThrow();
        const result = mergePatchRecursive({ ...source }, invalidPatch as any);
        expect(result).toBe(invalidPatch);
      });
    });

    it('undefined와 null 값들을 구분해서 처리한다', () => {
      const source = {
        shouldDelete: 'will be deleted',
        shouldKeep: 'will be kept',
        nested: {
          shouldDelete: 'will be deleted',
          shouldKeep: 'will be kept',
        },
      };

      const patch = {
        shouldDelete: null, // 삭제됨
        shouldKeep: undefined, // 유지됨 (패치에서 제외)
        nested: {
          shouldDelete: null, // 삭제됨
          shouldKeep: undefined, // 유지됨
          newField: 'added',
        },
      };

      const result = mergePatchRecursive(source, patch);

      expect(result).not.toHaveProperty('shouldDelete');
      expect(result.shouldKeep).toBe('will be kept');
      expect(result.nested).not.toHaveProperty('shouldDelete');
      expect(result.nested.shouldKeep).toBe('will be kept');
      expect(result.nested.newField).toBe('added');
    });
  });
});
