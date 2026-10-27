import { expect, it, onTestFinished } from 'vitest';

import { makeFieldNodeTree } from '@/schema-form/core/__tests__/makeFieldNodeTree';
import { engineModes } from '@/schema-form/core/engine';

import { SetValueOption } from '../type';

for (const mode of ['off', 'on', 'verify'] as const) {
  for (const keep of [true, false])
    it(`${mode} applies an ordinary parent's clearing policy to an inactive star with keep=${keep}`, () => {
      const previous = engineModes.slots;
      engineModes.setMode('slots', mode);
      onTestFinished(() => engineModes.setMode('slots', previous));
      const { root } = makeFieldNodeTree({
        type: 'object',
        properties: {
          open: { type: 'boolean' },
          starOpen: { type: 'boolean' },
          group: {
            type: 'object',
            controls: { active: '../open', unsetOnInactive: true },
            properties: {
              '*': {
                type: 'object',
                controls: {
                  active: '../../starOpen',
                  ...(keep ? { unsetOnInactive: false } : {}),
                },
                properties: { x: { type: 'string' } },
              },
              plain: { type: 'string' },
            },
          },
        },
      });
      root.setValue({
        open: true,
        starOpen: true,
        group: { '*': { x: 'held' }, plain: 'plain' },
      });
      root.find('/starOpen')!.setValue(false);
      root.find('/open')!.setValue(false);
      expect(root.inactiveValues).toEqual([]);
      root.find('/open')!.setValue(true);
      root.find('/starOpen')!.setValue(true);
      expect(root.find('/group')!.value).toEqual({});
    });

  it(`${mode} resets mixed sources while retaining an unread detached parent's wildcard entry`, () => {
    const previous = engineModes.slots;
    engineModes.setMode('slots', mode);
    onTestFinished(() => engineModes.setMode('slots', previous));
    const snapshot = {
      open: true,
      xOpen: true,
      group: { '*': { x: 'loaded' }, plain: 'plain' },
    };
    const { root } = makeFieldNodeTree(
      {
        type: 'object',
        properties: {
          open: { type: 'boolean' },
          xOpen: { type: 'boolean' },
          group: {
            type: 'object',
            controls: { active: '../open' },
            properties: {
              '*': {
                type: 'object',
                properties: {
                  x: { type: 'string', controls: { active: '../../../xOpen' } },
                },
              },
              plain: { type: 'string' },
            },
          },
        },
      },
      { snapshot },
    );
    root.setValue(snapshot);
    const group = root.find('/group')!;
    root.find('/xOpen')!.setValue(false);
    const entry = root.inactiveValues.find(
      (item) => item.path === '/group/*/x',
    )!;
    root.find('/open')!.setValue(false);
    root.setValue({ group: { '*': { x: 'overlay' } } }, SetValueOption.Merge);
    root.resetSubtree();
    expect(root.value).toEqual(snapshot);
    expect(root.inactiveValues).toEqual([]);
    expect(group.inactiveValues).toEqual([
      { path: '/group/*/x', value: 'loaded' },
    ]);
    expect(group.inactiveValues[0]).toBe(entry);
  });

  it(`${mode} preserves caller Source B after an automatic wildcard fill is withdrawn`, () => {
    const previous = engineModes.slots;
    engineModes.setMode('slots', mode);
    onTestFinished(() => engineModes.setMode('slots', previous));
    const { root } = makeFieldNodeTree({
      type: 'object',
      properties: {
        t: { type: 'boolean' },
        a: {
          type: 'number',
          default: 1,
          controls: { active: '../t === true' },
        },
        c: { type: 'number', default: 2, controls: { active: '../a === 1' } },
        group: {
          type: 'object',
          default: { '*': { leaf: 'automatic' } },
          controls: {
            active: '../a !== 1 || ../c === 2',
            unsetOnInactive: true,
          },
          properties: {
            '*': { type: 'object', properties: { leaf: { type: 'string' } } },
          },
        },
        x: { type: ['string', 'boolean'] },
      },
      allOf: [
        {
          controls: { active: './x === "0"' },
          properties: { x: { type: 'boolean' } },
        },
        {
          controls: { active: './x !== "0"' },
          properties: { x: { type: 'string' } },
        },
      ],
    });
    root.setValue({ x: 'steady' });
    expect(() => root.setValue({ t: true, x: 0 })).toThrow();
    expect(root.diagnostics).toMatchObject({ cause: 'budget' });
    expect(root.inactiveValues.some((item) => item.value === 'automatic')).toBe(
      false,
    );
    expect(root.find('/group')!.value).toEqual({});
  });
}
