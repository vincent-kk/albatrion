import { expect, it } from 'vitest';

import { makeFieldNodeTree } from '@/schema-form/core/__tests__/makeFieldNodeTree';

import { SetValueOption } from '../type';

for (const scenario of ['retained', 'input-only', 'replace'] as const)
  it(`preserves starred input under an ordinary ${scenario} slot ancestor`, () => {
    const { root } = makeFieldNodeTree({
      type: 'object',
      properties: {
        open: { type: 'boolean' },
        group: {
          type: 'object',
          controls: { active: '../open' },
          properties: {
            '*': {
              type: 'object',
              properties: { x: { type: 'string' } },
            },
            plain: { type: 'string' },
          },
        },
        sibling: { type: 'string' },
      },
    });
    root.setValue({
      open: scenario !== 'input-only',
      group: { '*': { x: 'original' }, plain: 'plain' },
      sibling: 'live sibling',
    });
    const held = root.find('/group');
    if (held) root.find('/open')!.setValue(false);
    root.setValue(
      { group: { '*': { x: 'overlay' }, plain: 'patched' } },
      SetValueOption.Merge,
    );
    expect(root.inactiveValues).toEqual([
      { path: '/group/%2A/x', value: 'overlay' },
      { path: '/group/plain', value: 'patched' },
    ]);
    if (scenario === 'replace')
      root.setValue({
        open: false,
        group: { plain: 'replacement' },
        sibling: 'live sibling',
      });
    root.find('/open')!.setValue(true);
    expect(root.find('/group')!.value).toEqual(
      scenario === 'replace'
        ? { plain: 'replacement' }
        : { '*': { x: 'overlay' }, plain: 'patched' },
    );
    expect(root.inactiveValues).toEqual([]);
    expect(root.find('/sibling')!.value).toBe('live sibling');
    if (held) {
      expect(held.value).toEqual({ '*': { x: 'original' }, plain: 'plain' });
      expect(held.inactiveValues).toEqual([]);
      expect(root.find('/group')).not.toBe(held);
    }
  });

it('restores a detached star write when its ordinary parent is cloned', () => {
  const { root } = makeFieldNodeTree({
    type: 'object',
    properties: {
      open: { type: 'boolean' },
      group: {
        type: 'object',
        controls: { active: '../open' },
        properties: {
          '*': { type: 'object', properties: { x: { type: 'string' } } },
          plain: { type: 'string' },
        },
      },
    },
  });
  root.setValue({
    open: true,
    group: { '*': { x: 'original' }, plain: 'plain' },
  });
  const group = root.find('/group')!;
  const star = group.children!.find((node) => node.name === '*')!;
  root.find('/open')!.setValue(false);
  star.setValue({ x: 'detached write' });
  root.find('/open')!.setValue(true);
  expect(root.find('/group')!.value).toEqual({
    '*': { x: 'detached write' },
    plain: 'plain',
  });
  expect(star.value).toEqual({ x: 'original' });
  expect(group.value).toEqual({ '*': { x: 'original' }, plain: 'plain' });
  expect(root.find('/group')).not.toBe(group);
});

it('preserves document order for a detached deep ordinary write containing a star', () => {
  const { root } = makeFieldNodeTree({
    type: 'object',
    properties: {
      open: { type: 'boolean' },
      tick: { type: 'number' },
      group: {
        type: 'object',
        controls: { active: '../open' },
        properties: {
          first: { type: 'string' },
          middle: { type: 'string' },
          nested: {
            type: 'object',
            properties: {
              '*': { type: 'object', properties: { x: { type: 'string' } } },
              plain: { type: 'string' },
            },
          },
        },
      },
    },
  });
  root.setValue({
    open: true,
    tick: 0,
    group: {
      first: 'first',
      middle: 'middle',
      nested: { '*': { x: 'original' }, plain: 'deep plain' },
    },
  });
  const nested = root.find('/group/nested')!;
  root.find('/open')!.setValue(false);
  nested.setValue({ '*': { x: 'patched' } }, SetValueOption.Merge);
  root.find('/tick')!.setValue(1);
  expect(root.inactiveValues).toEqual([
    { path: '/group/first', value: 'first' },
    { path: '/group/middle', value: 'middle' },
    { path: '/group/nested/%2A/x', value: 'patched' },
    { path: '/group/nested/plain', value: 'deep plain' },
  ]);
  root.find('/open')!.setValue(true);
  expect(root.find('/group/nested')!.value).toEqual({
    '*': { x: 'patched' },
    plain: 'deep plain',
  });
});
