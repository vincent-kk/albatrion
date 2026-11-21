import { expect } from 'vitest';

import { nodeFromJSONSchema } from '@/schema-form/__tests__/fixtures/nodeFromJSONSchema';

import type { AuthoredSchema } from '../../types/jsonSchema';
import { ValidationMode } from '../../types/state';
import { WriteOption } from '../../types/value';

const MERGE = WriteOption.Merge;
const OVERWRITE = WriteOption.Overwrite;
const modes = ['key first', 'merge first'] as const;
const emptyings = [
  'identity',
  'empty',
  'undefined',
  'emit then empty',
  'empty merge',
  'merge empty child',
  'then read parent',
] as const;
const virtualWriters = ['host', 'virtual'] as const;
const virtualReaders = ['updater', 'same tuple'] as const;

/** Each class supplies a real schema and invokes the same public calls on two fresh roots. */
export const callerCases = [
  ...[1, 2].flatMap((depth) =>
    modes.map((order) => ({
      name: `inactive depth ${depth}: ${order}`,
      run: (batched: boolean, text: string) => {
        const held = {
          type: 'object',
          controls: { active: '/open === true' },
          properties: { a: { type: 'string' }, b: { type: 'string' } },
        } as const;
        const root = nodeFromJSONSchema({
          jsonSchema: {
            type: 'object',
            properties: {
              open: { type: 'boolean' },
              other: { type: 'boolean' },
              ...(depth === 1
                ? { held }
                : { box: { type: 'object', properties: { held } } }),
            },
          },
          defaultValue: { open: false, other: false },
          validationMode: ValidationMode.None,
        });
        const host = depth === 1 ? root : root.find('/box')!;
        const heldPath = depth === 1 ? '/held' : '/box/held';
        expect(root.find(heldPath)).toBeNull();
        const put = () =>
          host.setValue({ held: { a: text } }, depth === 1 ? MERGE : OVERWRITE);
        const merge = () =>
          root.setValue(
            depth === 1
              ? { held: { b: text + 'b' } }
              : { box: { held: { b: text + 'b' } } },
            MERGE,
          );
        const calls = () => {
          if (order === 'key first') {
            put();
            merge();
          } else {
            merge();
            put();
          }
          root.find('/other')!.setValue(true);
        };
        if (batched) root.batch(calls);
        else calls();
        const retained = root.inactiveValues;
        expect(retained.some(({ path }) => path.startsWith(heldPath))).toBe(
          true,
        );
        root.find('/open')!.setValue(true);
        expect(root.find(heldPath)?.value).toBeDefined();
        return { value: root.value, retained };
      },
    })),
  ),
  ...[null, 'misfit', 17, false].flatMap((source) =>
    emptyings.map((operation) => ({
      name: `ancestor ${String(source)}: ${operation}`,
      run: (batched: boolean, text: string) => {
        const schema = {
          type: 'object',
          properties: {
            other: { type: 'boolean' },
            parent: {
              type: ['object', 'null'],
              properties: { child: { type: 'string' } },
            },
          },
        } as const satisfies AuthoredSchema;
        const root = nodeFromJSONSchema({
          jsonSchema: schema,
          defaultValue: { other: false, parent: { child: 'initial' } },
          validationMode: ValidationMode.None,
        });
        const parent = root.find('/parent')!;
        const child = root.find('/parent/child')!;
        parent.setValue(source);
        expect(parent.outputValue).toBe(source);
        let seen: unknown;
        const calls = () => {
          root.find('/other')!.setValue(true);
          if (operation === 'emit then empty') child.setValue(text);
          if (operation === 'empty merge') parent.setValue({}, MERGE);
          else if (operation === 'merge empty child')
            parent.setValue({ child: '' }, MERGE);
          else
            child.setValue(
              operation === 'identity'
                ? (previous: unknown) => {
                    seen = previous;
                    return previous;
                  }
                : operation === 'empty' || operation === 'then read parent'
                  ? ''
                  : undefined,
            );
          if (operation === 'then read parent')
            parent.setValue((previous: unknown) => {
              seen = previous;
              return {};
            }, MERGE);
        };
        if (batched) root.batch(calls);
        else calls();
        expect(root.find('/other')?.value).toBe(true);
        return { value: root.value, child: child.value, seen };
      },
    })),
  ),
  ...[false, true].map((omitEmpty) => ({
    name: `nested null ancestor with omitEmpty=${omitEmpty}`,
    run: (batched: boolean) => {
      const root = nodeFromJSONSchema({
        jsonSchema: {
          type: 'object',
          properties: {
            other: { type: 'boolean' },
            parent: {
              type: ['object', 'null'],
              properties: {
                inner: {
                  type: 'object',
                  properties: {
                    child: { type: 'string', options: { omitEmpty } },
                  },
                },
              },
            },
          },
        },
        defaultValue: { other: false, parent: null },
        validationMode: ValidationMode.None,
      });
      const parent = root.find('/parent')!;
      const child = root.find('/parent/inner/child')!;
      expect(parent.value).toBeNull();
      const calls = () => {
        root.find('/other')!.setValue(true);
        child.setValue('');
      };
      if (batched) root.batch(calls);
      else calls();
      expect(child.value).toBe('');
      return root.value;
    },
  })),
  {
    name: 'inactive object accepts a Merge without losing its earlier null source',
    run: (batched: boolean) => {
      const root = nodeFromJSONSchema({
        jsonSchema: {
          type: 'object',
          properties: {
            open: { type: 'boolean' },
            box: {
              type: 'object',
              properties: {
                held: {
                  type: ['object', 'null'],
                  controls: { active: '/open === true' },
                  properties: { child: { type: 'string' } },
                },
              },
            },
          },
        },
        defaultValue: { open: false },
        validationMode: ValidationMode.None,
      });
      expect(root.find('/box/held')).toBeNull();
      const calls = () => {
        root.find('/box')!.setValue({ held: null });
        root.setValue({ box: { held: { child: '' } } }, MERGE);
      };
      if (batched) root.batch(calls);
      else calls();
      root.find('/open')!.setValue(true);
      return root.value;
    },
  },
  {
    name: 'an inactive virtual slot does not promote its null host',
    run: (batched: boolean, text: string) => {
      const root = nodeFromJSONSchema({
        jsonSchema: {
          type: 'object',
          properties: {
            open: { type: 'boolean' },
            other: { type: 'boolean' },
            box: {
              type: ['object', 'null'],
              properties: {
                held: {
                  type: 'string',
                  controls: { active: '/open === true' },
                },
              },
              options: { virtual: { group: { fields: ['held'] } } },
            },
          },
        },
        defaultValue: { open: false, other: false, box: null },
        validationMode: ValidationMode.None,
      });
      const group = root.find('/box/group')!;
      expect(group.value).toEqual([undefined]);
      const calls = () => {
        root.find('/other')!.setValue(true);
        group.setValue([text]);
      };
      if (batched) root.batch(calls);
      else calls();
      return { value: root.value, retained: root.inactiveValues };
    },
  },
  ...[false, true].flatMap((absent) =>
    virtualWriters.flatMap((writer) =>
      virtualReaders.map((reader) => ({
        name: `virtual ${absent ? 'absent' : 'inactive'}: ${writer} before ${reader}`,
        run: (batched: boolean, text: string) => {
          const x = { type: 'string' } as const;
          const root = nodeFromJSONSchema({
            jsonSchema: {
              type: 'object',
              properties: {
                open: { type: 'boolean' },
                other: { type: 'boolean' },
                ...(!absent
                  ? { x: { ...x, controls: { active: '/open === true' } } }
                  : {}),
              },
              ...(absent
                ? {
                    allOf: [
                      {
                        controls: { active: './open === true' },
                        properties: { x },
                      },
                    ],
                  }
                : {}),
              options: { virtual: { group: { fields: ['x'] } } },
            },
            defaultValue: { open: false, other: false },
            validationMode: ValidationMode.None,
          });
          const group = root.find('/group')!;
          expect(root.find('/x')).toBeNull();
          expect(group.value).toEqual([undefined]);
          let seen: unknown;
          const calls = () => {
            if (writer === 'host') root.setValue({ x: text }, MERGE);
            else group.setValue([text]);
            root.find('/other')!.setValue(true);
            if (reader === 'updater')
              group.setValue((previous: unknown) => {
                seen = previous;
                return [
                  Array.isArray(previous)
                    ? (previous[0] ?? 'fallback')
                    : 'fallback',
                ];
              });
            else group.setValue([undefined]);
          };
          if (batched) root.batch(calls);
          else calls();
          const retained = root.inactiveValues;
          root.find('/open')!.setValue(true);
          expect(root.find('/x')?.value).toBeDefined();
          return { value: root.value, retained, seen };
        },
      })),
    ),
  ),
];
