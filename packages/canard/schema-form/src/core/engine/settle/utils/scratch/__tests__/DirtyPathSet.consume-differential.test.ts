// (a) 매 단계 dirty 집합 동일, (b) 소비된 생존 자식을 포함하는 조회는 새 구현에서 S6 위반으로 검출됨을 확인,
// (c) 그 밖의 허용된 조회는 구성원·순서 동일, (d) 재등록 장면은 다시 허용된 조회가 된 시점에 순서 동일.
// 임의 consume은 자식 선소비 전제를 만족하는 경로에만 적용하고 나머지는 delete를 적용합니다.
import { expect, it } from 'vitest';

import { createDispatchTree } from '../../../../__tests__/fixtures/createDispatchTree';
import type { PlainNode } from '../../../../__tests__/fixtures/createPlainNode';
import { engineModes } from '../../../../utils/cache/engineModes';
import { dispatchMount } from '../../../../write';
import type { SettlementContext } from '../../../types/settlement';
import { dirtyChildren } from '../../compute/dirtyChildren';
import { gateSelectionTable } from '../../gates/gateSelectionTable';
import { DirtyPathSet } from '../DirtyPathSet';

/** Frozen pre-change add/beginPostOrder/delete algorithms, independent of consume. */
class ReferenceDirtyPaths extends Set<string> {
  readonly childrenByParent = new Map<string, Map<string, string>>();
  isPostOrder = false;

  beginPostOrder(): void {
    if (this.isPostOrder) return;
    this.isPostOrder = true;
    this.childrenByParent.clear();
    const linked = new Set<string>();
    for (const path of this) {
      let current = path;
      while (current && !linked.has(current)) {
        linked.add(current);
        const slash = current.lastIndexOf('/');
        const parent = current.slice(0, slash);
        super.add(parent);
        let children = this.childrenByParent.get(parent);
        if (!children)
          this.childrenByParent.set(parent, (children = new Map()));
        children.set(current, current.slice(slash + 1));
        current = parent;
      }
    }
  }

  override add(path: string): this {
    if (this.has(path)) return this;
    if (this.isPostOrder) {
      let current = path;
      while (!this.has(current)) {
        super.add(current);
        if (!current) break;
        const slash = current.lastIndexOf('/');
        const parent = current.slice(0, slash);
        let children = this.childrenByParent.get(parent);
        if (!children)
          this.childrenByParent.set(parent, (children = new Map()));
        children.set(current, current.slice(slash + 1));
        current = parent;
      }
      return this;
    }
    super.add(path);
    let start = 1;
    while (start <= path.length) {
      const slash = path.indexOf('/', start);
      const end = slash < 0 ? path.length : slash;
      const parent = path.slice(0, start - 1);
      let children = this.childrenByParent.get(parent);
      if (!children) this.childrenByParent.set(parent, (children = new Map()));
      children.set(path, path.slice(start, end));
      if (slash < 0) break;
      start = slash + 1;
    }
    return this;
  }

  override delete(path: string): boolean {
    if (!super.delete(path)) return false;
    if (this.isPostOrder) {
      if (path) {
        const parent = path.slice(0, path.lastIndexOf('/'));
        const children = this.childrenByParent.get(parent);
        children?.delete(path);
        if (children?.size === 0) this.childrenByParent.delete(parent);
      }
      return true;
    }
    let start = 1;
    while (start <= path.length) {
      const slash = path.indexOf('/', start);
      const parent = path.slice(0, start - 1);
      const children = this.childrenByParent.get(parent);
      children?.delete(path);
      if (children?.size === 0) this.childrenByParent.delete(parent);
      if (slash < 0) break;
      start = slash + 1;
    }
    return true;
  }
}

it('300 seeded mutation histories preserve every permitted live-child query', () => {
  const previousMode = engineModes.gateSelection;
  const previous = { ...gateSelectionTable };
  engineModes.setMode('gateSelection', 'verify');
  const { root } = createDispatchTree({
    type: 'object',
    properties: {
      h: {
        type: 'object',
        properties: {
          a: { type: 'string' },
          b: { type: 'string' },
          'a/b': { type: 'string' },
        },
      },
      other: {
        type: 'object',
        properties: {
          a: { type: 'string' },
          b: { type: 'string' },
        },
      },
    },
  });
  dispatchMount(root, undefined);
  const parents = [root, root.structure!.h, root.structure!.other];
  const paths = [
    '',
    '/h',
    '/other',
    '/h/a',
    '/h/b',
    '/h/a~1b',
    '/other/a',
    '/other/b',
  ];
  let seed = 442;
  const random = () => (seed = (Math.imul(seed, 1664525) + 1013904223) >>> 0);
  let permitted = 0;
  let rejected = 0;
  try {
    for (let history = 0; history < 300; history++) {
      const actual = new DirtyPathSet(new Map());
      const reference = new ReferenceDirtyPaths();
      for (let step = 0; step < 60; step++) {
        const operation = (random() >>> 16) % 4;
        const path = paths[(random() >>> 8) % paths.length];
        if (operation === 0) {
          actual.add(path);
          reference.add(path);
        } else if (operation === 3) {
          actual.beginPostOrder();
          reference.beginPostOrder();
        } else if (
          operation === 2 &&
          ![...(actual.childrenByParent.get(path)?.keys() ?? [])].some(
            (child) => actual.has(child),
          )
        ) {
          expect(actual.consume(path)).toBe(reference.delete(path));
        } else expect(actual.delete(path)).toBe(reference.delete(path));
        expect([...actual], `history ${history}, step ${step}`).toEqual([
          ...reference,
        ]);
        for (const parent of parents) {
          const context = {
            dirtyPaths: actual,
            dirtyChildrenByParent: actual.childrenByParent,
          } as unknown as SettlementContext<PlainNode>;
          const names = [
            ...(actual.childrenByParent.get(parent.path)?.values() ?? []),
          ];
          const consumed =
            actual.isPostOrder &&
            names.some((name) => {
              const child =
                parent.structure?.[
                  name.replace(/~1/g, '/').replace(/~0/g, '~')
                ];
              return child && !actual.has(child.path);
            });
          if (consumed) {
            expect(() => dirtyChildren(parent, context)).toThrow(
              'S6 dirtyChildren returned a consumed child',
            );
            rejected++;
          } else {
            const expected = dirtyChildren(parent, {
              dirtyPaths: reference,
              dirtyChildrenByParent: reference.childrenByParent,
            } as unknown as SettlementContext<PlainNode>);
            expect(
              dirtyChildren(parent, context).map((child) => child.path),
            ).toEqual(expected.map((child) => child.path));
            permitted++;
          }
        }
      }
    }
    expect(permitted).toBeGreaterThan(1000);
    expect(rejected).toBeGreaterThan(0);
    console.log(
      'DIRTY_CONSUME_DIFFERENTIAL',
      JSON.stringify({
        seed: 442,
        histories: 300,
        steps: 60,
        permitted,
        rejected,
      }),
    );
  } finally {
    Object.assign(gateSelectionTable, previous);
    engineModes.setMode('gateSelection', previousMode);
  }
});
