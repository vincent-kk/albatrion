import { expect, it, onTestFinished } from 'vitest';

import { makeFieldNodeTree } from '@/schema-form/core/__tests__/makeFieldNodeTree';
import { engineModes } from '@/schema-form/core/engine';

it.each(['off', 'on', 'verify'] as const)(
  '%s preserves the wildcard query exclusion for an inactive literal star field',
  (mode) => {
    const previous = engineModes.slots;
    engineModes.setMode('slots', mode);
    onTestFinished(() => engineModes.setMode('slots', previous));
    const { root } = makeFieldNodeTree({
      type: 'object',
      properties: {
        open: { type: 'boolean' },
        '*': { type: 'string', controls: { active: '../open' } },
      },
    });
    root.setValue({ open: true, '*': 'retained' });
    const empty = root.inactiveValues;
    root.find('/open')!.setValue(false);
    expect(root.inactiveValues).toEqual([]);
    expect(root.inactiveValues).toBe(empty);
  },
);

it.each(['off', 'on', 'verify'] as const)(
  '%s preserves an unread publication when a fresh external wildcard match enters',
  (mode) => {
    const previous = engineModes.slots;
    engineModes.setMode('slots', mode);
    onTestFinished(() => engineModes.setMode('slots', previous));
    const { root } = makeFieldNodeTree({
      type: 'object',
      properties: {
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
          properties: { x: { type: 'string', default: 'new match' } },
        },
      },
    });
    root.setValue({ xOpen: false, otherOpen: false, '*': { x: 'held' } });
    root.find('/otherOpen')!.setValue(true);
    const star = root.children!.find((node) => node.name === '*')!;
    expect(star.inactiveValues).toEqual([]);
  },
);

it.each(['off', 'on', 'verify'] as const)(
  '%s keeps an unread detached host query result when its live wildcard match later leaves',
  (mode) => {
    const previous = engineModes.slots;
    engineModes.setMode('slots', mode);
    onTestFinished(() => engineModes.setMode('slots', previous));
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
          properties: { x: { type: 'string' } },
        },
      },
    });
    root.setValue({
      starOpen: true,
      xOpen: true,
      otherOpen: true,
      '*': { x: 'held' },
      other: { x: 'live match' },
    });
    const held = root.children!.find((node) => node.name === '*')!;
    root.find('/xOpen')!.setValue(false);
    root.find('/starOpen')!.setValue(false);
    root.find('/otherOpen')!.setValue(false);
    expect(held.inactiveValues).toEqual([]);
    expect(held.inactiveValues).toBe(held.inactiveValues);
  },
);
