import { describe, expect, it } from 'vitest';

import { FieldNodeEventType, FieldNodeState } from '@/schema-form';

import { build, diag } from './probeHelpers';

const schema = {
  type: 'object',
  properties: {
    on: { type: 'boolean' },
    gated: { type: 'string', controls: { active: '../on === true' } },
    list: { type: 'array', items: { type: 'string' } },
  },
} as const;

const touched = (root: any) => !!root.globalState?.[FieldNodeState.Touched];

describe('global interaction aggregate follows the nodes that leave', () => {
  const cases: [string, (root: any) => void, string][] = [
    ['G1 remove the touched item', (root) => root.find('/list').remove(0), '/list/0'],
    ['G2 clear the list', (root) => root.find('/list').clear(), '/list/0'],
    ['G3 overwrite the list shorter', (root) => root.find('/list').setValue([]), '/list/0'],
    ['G4 pop the touched last item', (root) => root.find('/list').pop(), '/list/1'],
    ['G5 gate exit of the touched field', (root) => root.find('/on').setValue(false), '/gated'],
  ];
  for (const [name, act, path] of cases)
    it(name, () => {
      const { root } = build(schema, { on: true, gated: 'g', list: ['a', 'b'] });
      root.find(path).setState({ [FieldNodeState.Touched]: true });
      expect(touched(root)).toBe(true);
      const types: number[] = [];
      root.subscribe((event: any) => types.push(event.type));
      act(root);
      const anyTouched: string[] = [];
      root.visitSubtree((node: any) => {
        if (node.isTouched) anyTouched.push(node.path);
      });
      diag(name, {
        global: root.globalState,
        anyTouched,
        globalEvent: types.some((t) => t & FieldNodeEventType.UpdateGlobalState),
      });
      expect(touched(root)).toBe(anyTouched.length > 0);
    });
});
