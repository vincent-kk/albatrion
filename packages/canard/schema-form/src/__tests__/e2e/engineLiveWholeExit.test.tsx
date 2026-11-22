import { expect, it } from 'vitest';

import type { JSONSchema } from '../../index';
import { mountEngineForm } from './fixtures/mountEngineForm';

it.each([
  { name: 'keep', controls: {}, expected: 'latest' },
  { name: 'unset', controls: { unsetOnInactive: true }, expected: undefined },
  {
    name: 'replace',
    controls: { inactiveValue: 'resolved' },
    expected: 'resolved',
  },
])(
  'applies the $name exit policy to a named live write',
  ({ controls, expected }) => {
    const root = mountEngineForm({
      jsonSchema: {
        type: 'object',
        properties: {
          on: { type: 'boolean' },
          source: {
            type: 'boolean',
            controls: {
              injectTo: (value) =>
                value ? { '../on': false, '../o': { y: 'latest' } } : {},
            },
          },
          o: {
            type: 'object',
            controls: { active: '/on === true' },
            properties: { y: { type: 'string', controls } },
          },
        },
      },
      defaultValue: { on: true, o: { y: 'y0' } },
    });
    root.find('/source')!.setValue(true);
    expect(root.find('/o')).toBeNull();
    expect(root.inactiveValues).toEqual(
      expected === undefined ? [] : [{ path: '/o/y', value: expected }],
    );
  },
);

it.each([false, true])(
  'the last named write determines the exit after an omission (name last=%s)',
  (nameLast) => {
    const root = mountEngineForm({
      jsonSchema: {
        type: 'object',
        properties: {
          on: { type: 'boolean' },
          source: {
            type: 'boolean',
            controls: {
              injectTo: (value) =>
                value
                  ? {
                      '../o': nameLast
                        ? { z: 'mid' }
                        : { y: 'latest', z: 'z0' },
                    }
                  : {},
            },
          },
          o: {
            type: 'object',
            controls: { active: '/on === true' },
            properties: { y: { type: 'string' }, z: { type: 'string' } },
          },
          end: {
            type: 'boolean',
            controls: {
              derived: nameLast ? '/o/z === "mid"' : '/o/y === "latest"',
              injectTo: (value) =>
                value
                  ? {
                      '../on': false,
                      ...(nameLast
                        ? { '../o/y': 'latest' }
                        : { '../o': { z: 'mid' } }),
                    }
                  : {},
            },
          },
        },
      },
      defaultValue: { on: true, source: false, o: { y: 'y0', z: 'z0' } },
    });
    root.batch(() => root.find('/source')!.setValue(true));
    expect(root.find('/o')).toBeNull();
    expect(root.inactiveValues).toEqual([
      { path: '/o/y', value: nameLast ? 'latest' : 'y0' },
      { path: '/o/z', value: 'mid' },
    ]);
  },
);

it.each([
  { shape: 'array', named: false },
  { shape: 'object', named: false },
  { shape: 'object', named: true },
] as const)(
  'keeps a new named descendant and its slot through a $shape exit (held named=$named)',
  ({ shape, named }) => {
    const isArray = shape === 'array';
    const address = isArray ? '/o/0' : '/o';
    const row: JSONSchema = {
      type: 'object',
      properties: {
        z: { type: 'string' },
        n: {
          type: 'object',
          properties: {
            y: { type: 'string' },
            held: { type: 'string', controls: { active: '/hold === true' } },
          },
        },
      },
    };
    const value = {
      z: 'z0',
      n: { y: 'y0', ...(isArray ? {} : { held: 'held0' }) },
    };
    const root = mountEngineForm({
      jsonSchema: {
        type: 'object',
        properties: {
          on: { type: 'boolean' },
          hold: { type: 'boolean' },
          source: {
            type: 'boolean',
            controls: {
              injectTo: (value) =>
                value
                  ? { '../o': isArray ? [{ z: 'mid' }] : { z: 'mid' } }
                  : {},
            },
          },
          o: isArray
            ? {
                type: 'array',
                items: row,
                controls: { active: '/on === true' },
              }
            : { ...row, controls: { active: '/on === true' } },
          end: {
            type: 'string',
            controls: {
              derived: `${address}/z === "mid" ? "closed" : /end`,
              injectTo: (value) =>
                value === 'closed'
                  ? {
                      '../on': false,
                      ['..' + address + '/n/y']: 'latest',
                      ...(named ? { '../o/n/held': 'held1' } : {}),
                    }
                  : {},
            },
          },
        },
      },
      defaultValue: { on: true, o: isArray ? [value] : value },
    });
    root.find('/source')!.setValue(true);
    expect(root.find('/o')).toBeNull();
    expect(
      Object.fromEntries(
        root.inactiveValues.map(({ path, value }) => [path, value]),
      ),
    ).toEqual(
      isArray
        ? { '/o': [{ z: 'mid', n: { y: 'latest' } }] }
        : {
            '/o/z': 'mid',
            '/o/n/y': 'latest',
            '/o/n/held': named ? 'held1' : 'held0',
          },
    );
  },
);
