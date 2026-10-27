import { expect, it } from 'vitest';

import { makeFieldNodeTree } from '@/schema-form/core/__tests__/makeFieldNodeTree';

import { SetValueOption } from '../type';

{
  for (const readHidden of [true, false])
    it(`renews a wildcard entry after a ${readHidden ? 'read' : 'unread'} hidden commit`, () => {
      const { root } = makeFieldNodeTree({
        type: 'object',
        properties: {
          tick: { type: 'number' },
          xOpen: { type: 'boolean' },
          otherOpen: { type: 'boolean' },
          '*': {
            type: 'object',
            properties: {
              x: { type: 'string', controls: { active: '../../xOpen' } },
            },
          },
          other: {
            type: 'object',
            controls: { active: '../otherOpen' },
            properties: { x: { type: 'string', default: 'match' } },
          },
        },
      });
      root.setValue({
        tick: 0,
        xOpen: false,
        otherOpen: false,
        '*': { x: 'held' },
      });
      const first = root.inactiveValues;
      const entry = first.find((item) => item.path === '/*/x')!;
      expect(entry).toEqual({ path: '/*/x', value: 'held' });
      expect(Object.isFrozen(first)).toBe(true);
      expect(Object.isFrozen(entry)).toBe(true);
      root.find('/tick')!.setValue(1);
      expect(root.inactiveValues).toBe(first);
      root.find('/otherOpen')!.setValue(true);
      if (readHidden)
        expect(root.inactiveValues.some((item) => item.path === '/*/x')).toBe(
          false,
        );
      root.find('/otherOpen')!.setValue(false);
      const next = root.inactiveValues.find((item) => item.path === '/*/x')!;
      expect(next).toEqual(entry);
      expect(next).not.toBe(entry);
      expect(first).toEqual([{ path: '/*/x', value: 'held' }]);
      expect(root.inactiveValues).toBe(root.inactiveValues);
    });

  it(`preserves an unread detached wildcard host's ancestor-published entry after an overlay changes`, () => {
    const { root } = makeFieldNodeTree({
      type: 'object',
      properties: {
        starOpen: { type: 'boolean' },
        xOpen: { type: 'boolean' },
        otherOpen: { type: 'boolean' },
        '*': {
          type: 'object',
          controls: { active: '../starOpen' },
          properties: {
            x: { type: 'string', controls: { active: '../../xOpen' } },
          },
        },
        other: {
          type: 'object',
          controls: { active: '../otherOpen' },
          properties: { x: { type: 'string', default: 'match' } },
        },
      },
    });
    root.setValue({
      starOpen: true,
      xOpen: true,
      otherOpen: false,
      '*': { x: 'held' },
    });
    const host = root.children!.find((node) => node.name === '*')!;
    root.find('/xOpen')!.setValue(false);
    const entry = root.inactiveValues.find((item) => item.path === '/*/x')!;
    root.find('/starOpen')!.setValue(false);
    root.setValue({ '*': { x: 'overlay' } }, SetValueOption.Merge);
    expect(root.inactiveValues.find((item) => item.path === '/*/x')).toEqual({
      path: '/*/x',
      value: 'overlay',
    });
    root.find('/otherOpen')!.setValue(true);
    expect(root.inactiveValues.some((item) => item.path === '/*/x')).toBe(
      false,
    );
    expect(host.inactiveValues).toEqual([{ path: '/*/x', value: 'held' }]);
    expect(host.inactiveValues[0]).toBe(entry);
    expect(host.inactiveValues).toBe(host.inactiveValues);
    expect(Object.isFrozen(host.inactiveValues[0])).toBe(true);
  });

  it(`preserves ancestor-star entry identity in an unread detached descendant`, () => {
    const { root } = makeFieldNodeTree({
      type: 'object',
      properties: {
        groupOpen: { type: 'boolean' },
        xOpen: { type: 'boolean' },
        '*': {
          type: 'object',
          properties: {
            group: {
              type: 'object',
              controls: { active: '../../groupOpen' },
              properties: {
                x: { type: 'string', controls: { active: '../../../xOpen' } },
              },
            },
          },
        },
      },
    });
    root.setValue({
      groupOpen: true,
      xOpen: true,
      '*': { group: { x: 'held' } },
    });
    const star = root.children!.find((node) => node.name === '*')!;
    const host = star.children!.find((node) => node.name === 'group')!;
    root.find('/xOpen')!.setValue(false);
    const entry = root.inactiveValues.find(
      (item) => item.path === '/*/group/x',
    )!;
    root.find('/groupOpen')!.setValue(false);
    root.setValue({ '*': { group: { x: 'overlay' } } }, SetValueOption.Merge);
    expect(
      root.inactiveValues.find((item) => item.path === '/*/group/x'),
    ).toEqual({ path: '/*/group/x', value: 'overlay' });
    expect(host.inactiveValues).toEqual([
      { path: '/*/group/x', value: 'held' },
    ]);
    expect(host.inactiveValues[0]).toBe(entry);
  });

  it(`keeps an unread detached host's entry when live wildcard visibility starts a new lifetime`, () => {
    const { root } = makeFieldNodeTree({
      type: 'object',
      properties: {
        starOpen: { type: 'boolean' },
        xOpen: { type: 'boolean' },
        otherOpen: { type: 'boolean' },
        '*': {
          type: 'object',
          controls: { active: '../starOpen' },
          properties: {
            x: { type: 'string', controls: { active: '../../xOpen' } },
          },
        },
        other: {
          type: 'object',
          controls: { active: '../otherOpen' },
          properties: { x: { type: 'string', default: 'match' } },
        },
      },
    });
    root.setValue({
      starOpen: true,
      xOpen: true,
      otherOpen: false,
      '*': { x: 'held' },
    });
    const host = root.children!.find((node) => node.name === '*')!;
    root.find('/xOpen')!.setValue(false);
    const entry = root.inactiveValues.find((item) => item.path === '/*/x')!;
    root.find('/starOpen')!.setValue(false);
    root.find('/otherOpen')!.setValue(true);
    expect(root.inactiveValues.some((item) => item.path === '/*/x')).toBe(
      false,
    );
    root.find('/otherOpen')!.setValue(false);
    const next = root.inactiveValues.find((item) => item.path === '/*/x')!;
    expect(host.inactiveValues).toEqual([{ path: '/*/x', value: 'held' }]);
    expect(host.inactiveValues[0]).toBe(entry);
    expect(next).toEqual(entry);
    expect(next).not.toBe(entry);
  });
}
