import { expect, it, vi } from 'vitest';

import { nodeFromJSONSchema } from '@/schema-form/__tests__/fixtures/nodeFromJSONSchema';

import { FormErrorCode } from '../../../errors';
import { ValidationMode } from '../types/state';
import { WriteOption } from '../types/value';
import { writeRetainedBudgetInputs } from './fixtures/writeRetainedBudgetInputs';

const CASES = [
  ['own', 'merge'],
  ['own', 'batch'],
  ['own', 'nested'],
  ['parent', 'merge'],
  ['parent', 'batch'],
  ['parent', 'nested'],
  ['virtual', 'merge'],
  ['virtual', 'batch'],
  ['virtual', 'nested'],
] as const;

it.each(CASES)(
  'recovers caller sources after revival, partial overwrite and re-exit (%s / %s)',
  (route, call) => {
    const secondRevival = vi.fn();
    const root = nodeFromJSONSchema({
      jsonSchema: {
        type: 'object',
        options: { virtual: { group: { fields: ['o'] } } },
        properties: {
          on: { type: 'boolean' },
          caller: { type: 'string' },
          write: {
            type: 'boolean',
            controls: {
              injectTo: (value) => {
                if (!value) return {};
                if (route === 'own')
                  return {
                    '../o/y': 'revived',
                    '../o/list': ['new', 'extra'],
                    '../o/held': 'held1',
                  };
                const input = {
                  y: 'revived',
                  list: ['new', 'extra'],
                  held: 'held1',
                };
                return route === 'parent'
                  ? { '../o': input }
                  : { '../group': [input] };
              },
            },
          },
          reopen: {
            type: 'boolean',
            controls: {
              injectTo: (value) => (value ? { '../on': true } : {}),
            },
          },
          o: {
            type: 'object',
            controls: { active: '/on === true' },
            properties: {
              y: { type: 'string' },
              list: { type: 'array', items: { type: 'string' } },
              held: { type: 'string', controls: { active: '/hold === true' } },
            },
          },
          hold: { type: 'boolean' },
          closeAgain: {
            type: 'boolean',
            controls: {
              derived: '/o/y === "revived" ? true : /closeAgain',
              injectTo: (value) => (value ? { '../on': false } : {}),
            },
          },
          reopenAgain: {
            type: 'boolean',
            controls: {
              derived:
                '/closeAgain === true && /on === false ? true : /reopenAgain',
              injectTo: (value) => (value ? { '../on': true } : {}),
            },
          },
          startCycle: {
            type: 'boolean',
            controls: {
              derived:
                '/reopenAgain === true && /o/y === "revived" ? true : /startCycle',
              injectTo: (value) => {
                if (!value) return {};
                secondRevival();
                return {
                  '../on': false,
                  '../o/list': [],
                  '../o/held': 'held2',
                };
              },
            },
          },
          startAfterExit: {
            type: 'boolean',
            controls: {
              derived:
                '/startCycle === true && /on === false ? true : /startAfterExit',
              injectTo: (value) => (value ? { '../ping': 'cycle' } : {}),
            },
          },
          ping: {
            type: 'string',
            controls: {
              injectTo: (value) =>
                typeof value === 'string' ? { '../pong': value + '1' } : {},
            },
          },
          pong: {
            type: 'string',
            controls: {
              injectTo: (value) =>
                typeof value === 'string' ? { '../ping': value + '2' } : {},
            },
          },
        },
      },
      defaultValue: {
        on: true,
        o: { y: 'old', list: ['list0'], held: 'held0' },
      },
      validationMode: ValidationMode.None,
    });
    const oldItem = root.find('/o/list/0')!;
    const resolver = vi.fn(() => 'resolved');
    root.find('/o/y')!.onInactive(resolver);
    expect(() => writeRetainedBudgetInputs(root, call)).toThrowError(
      expect.objectContaining({ code: FormErrorCode.BudgetExceeded }),
    );
    expect(secondRevival).toHaveBeenCalledOnce();
    expect(resolver).not.toHaveBeenCalled();
    expect(root.value).toEqual({
      on: false,
      caller: 'kept',
      write: true,
      reopen: true,
    });
    expect(
      Object.fromEntries(
        root.inactiveValues.map(({ path, value }) => [path, value]),
      ),
    ).toEqual({ '/o/y': 'old', '/o/list': ['list0'], '/o/held': 'held0' });
    expect(oldItem.isActive).toBe(false);
    expect(oldItem.path).toBe('/o/list/0');
    expect(oldItem.value).toBe('list0');
    root.setValue({ on: true }, WriteOption.Merge);
    expect(root.find('/o/list/0')?.value).toBe('list0');
    expect(root.find('/o/list/0')).not.toBe(oldItem);
  },
);
