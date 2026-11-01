import { describe, expect, it } from 'vitest';

import { WriteOption } from '@/schema-form/core/engine/types/value';

import { createTestTree } from '../../__tests__/fixtures/createTestTree';
import { loadFieldNodeAtMount } from '../loadFieldNodeAtMount';
import { resetFieldNodeForm } from '../utils/reset/resetFieldNodeForm';
import { resetFieldNodeSubtree } from '../utils/reset/resetFieldNodeSubtree';
import { writeFieldNode } from '../utils/write/writeFieldNode';
import { readInactiveValuesAt } from './fixtures/readInactiveValuesAt';
import {
  hasRetainedSlotOwnSource,
  readRetainedSlotRaw,
} from './fixtures/readRetainedSlotRaw';

// filid:contract settle-transition
describe('final-shape exits', () => {
  const alternateKinds = [
    {
      name: 'discriminated oneOf',
      schema: {
        type: 'object',
        controls: { discriminator: 'kind' },
        properties: { kind: { type: 'string' } },
        oneOf: [
          {
            properties: {
              kind: { type: 'string', const: 'a' },
              value: { type: 'string' },
            },
          },
          {
            properties: {
              kind: { type: 'string', const: 'b' },
              value: { type: 'number' },
            },
          },
        ],
      },
    },
    {
      name: 'two node gates',
      schema: {
        type: 'object',
        properties: { kind: { type: 'string' } },
        allOf: [
          {
            properties: {
              value: {
                type: 'string',
                controls: { active: '../kind === "a"' },
              },
            },
          },
          {
            properties: {
              value: {
                type: 'number',
                controls: { active: '../kind === "b"' },
              },
            },
          },
        ],
      },
    },
    {
      name: 'if/then/else',
      schema: {
        type: 'object',
        properties: { kind: { type: 'string' } },
        if: { properties: { kind: { const: 'a' } }, required: ['kind'] },
        then: { properties: { value: { type: 'string' } } },
        else: { properties: { value: { type: 'number' } } },
      },
    },
  ] as const;

  for (const { name, schema: alternateSchema } of alternateKinds)
    it(`WRITE-099 keeps alternate value kinds stable for ${name}`, () => {
      const { root: mounted } = createTestTree(alternateSchema);
      expect(() =>
        loadFieldNodeAtMount(
          mounted,
          { kind: 'b', value: 2 },
          WriteOption.Overwrite,
        ),
      ).not.toThrow();
      expect(mounted.structure?.value?.blueprintNode.kind).toBe('number');
      expect(mounted.runtime.diagnostics.status).toBe('stable');
      expect(
        readInactiveValuesAt(mounted, '')?.some(
          (entry) => entry.path === '/value',
        ),
      ).toBe(false);

      const { root } = createTestTree(alternateSchema);
      loadFieldNodeAtMount(
        root,
        { kind: 'a', value: 'first' },
        WriteOption.Overwrite,
      );
      expect(root.structure?.value?.blueprintNode.kind).toBe('string');
      expect(() =>
        writeFieldNode(
          root,
          { kind: 'b', value: 2 },
          'callerReplace',
          WriteOption.Overwrite,
        ),
      ).not.toThrow();
      expect(root.structure?.value?.blueprintNode.kind).toBe('number');
      expect(() =>
        writeFieldNode(
          root,
          { kind: 'a', value: 'again' },
          'callerReplace',
          WriteOption.Overwrite,
        ),
      ).not.toThrow();
      expect(root.structure?.value?.blueprintNode.kind).toBe('string');
      expect(root.runtime.diagnostics.status).toBe('stable');
    });

  it('26C-13 keeps the exited kind raw through input writes only', () => {
    const { root } = createTestTree(alternateKinds[0].schema);
    loadFieldNodeAtMount(
      root,
      { kind: 'a', value: 'hello' },
      WriteOption.Overwrite,
    );
    writeFieldNode(root.structure!.kind, 'b', 'input', WriteOption.Overwrite);
    expect(root.structure?.value?.blueprintNode.kind).toBe('number');
    writeFieldNode(root.structure!.value, 3, 'input', WriteOption.Overwrite);
    expect(readRetainedSlotRaw(root, '/value', 'string')).toBe('hello');
    expect(
      readInactiveValuesAt(root, '')?.some((entry) => entry.path === '/value'),
    ).toBe(false);
    writeFieldNode(root.structure!.kind, 'a', 'input', WriteOption.Overwrite);
    expect(root.structure?.value?.blueprintNode.kind).toBe('string');
    expect(root.structure?.value?.raw).toBe('hello');
    expect(
      readInactiveValuesAt(root, '')?.some((entry) => entry.path === '/value'),
    ).toBe(false);
    writeFieldNode(
      root.structure!.kind,
      'none',
      'input',
      WriteOption.Overwrite,
    );
    expect(
      readInactiveValuesAt(root, '')?.some((entry) => entry.path === '/value'),
    ).toBe(true);
  });

  it('WRITE-094 makes a whole write the only raw of every kind in its scope', () => {
    const { root } = createTestTree(alternateKinds[0].schema);
    loadFieldNodeAtMount(
      root,
      { kind: 'a', value: 'hello' },
      WriteOption.Overwrite,
    );
    writeFieldNode(root.structure!.kind, 'b', 'input', WriteOption.Overwrite);
    writeFieldNode(root.structure!.value, 3, 'input', WriteOption.Overwrite);
    writeFieldNode(
      root,
      { kind: 'b', value: 4 },
      'callerReplace',
      WriteOption.Overwrite,
    );
    expect(hasRetainedSlotOwnSource(root, '/value', 'string')).toBe(false);
    writeFieldNode(root.structure!.kind, 'a', 'input', WriteOption.Overwrite);
    expect(root.structure?.value?.blueprintNode.kind).toBe('string');
    expect(root.structure?.value?.raw).not.toBe('hello');
  });

  it('26C-13 replaces every kind at a path covered by a whole write', () => {
    const { root } = createTestTree(alternateKinds[0].schema);
    loadFieldNodeAtMount(
      root,
      { kind: 'a', value: 'hello' },
      WriteOption.Overwrite,
    );
    writeFieldNode(root.structure!.kind, 'b', 'input', WriteOption.Overwrite);
    writeFieldNode(root.structure!.value, 3, 'input', WriteOption.Overwrite);
    writeFieldNode(
      root,
      { kind: 'a', value: 'again' },
      'callerReplace',
      WriteOption.Overwrite,
    );
    expect(root.structure?.value?.raw).toBe('again');
    expect(root.raw).toBeUndefined();
    expect(root.structure?.kind?.raw).toBe('a');
    expect(
      readInactiveValuesAt(root, '')?.some((entry) => entry.path === '/value'),
    ).toBe(false);
    expect(root.runtime.misfitPaths.has('/value')).toBe(false);
    writeFieldNode(root.structure!.kind, 'b', 'input', WriteOption.Overwrite);
    expect(root.structure?.value?.blueprintNode.kind).toBe('number');
    expect(root.structure?.value?.raw).not.toBe(3);
    expect(root.structure?.value?.raw).toBeUndefined();
  });

  it('VALUE-025 enters an other-kind node from its own latent or absent', () => {
    const { root } = createTestTree(alternateKinds[0].schema);
    loadFieldNodeAtMount(
      root,
      { kind: 'a', value: 'hello' },
      WriteOption.Overwrite,
    );
    writeFieldNode(root.structure!.kind, 'b', 'input', WriteOption.Overwrite);
    expect(root.structure?.value?.blueprintNode.kind).toBe('number');
    expect(root.structure?.value?.raw).toBeUndefined();
    expect(root.runtime.misfitPaths.has('/value')).toBe(false);
    expect(
      readInactiveValuesAt(root, '')?.some((entry) => entry.path === '/value'),
    ).toBe(false);
    expect(readRetainedSlotRaw(root, '/value', 'string')).toBe('hello');
    expect(hasRetainedSlotOwnSource(root, '/value', 'number')).toBe(false);
    writeFieldNode(root.structure!.kind, 'a', 'input', WriteOption.Overwrite);
    expect(root.structure?.value?.blueprintNode.kind).toBe('string');
    expect(root.structure?.value?.raw).toBe('hello');
    expect(hasRetainedSlotOwnSource(root, '/value', 'number')).toBe(false);
  });

  it('VALUE-025 enters a nested other-kind node from its own latent or absent', () => {
    const { root } = createTestTree({
      type: 'object',
      properties: { outer: alternateKinds[0].schema },
    });
    loadFieldNodeAtMount(
      root,
      { outer: { kind: 'a', value: 'hello' } },
      WriteOption.Overwrite,
    );
    const outer = root.structure!.outer;
    writeFieldNode(outer.structure!.kind, 'b', 'input', WriteOption.Overwrite);
    expect(outer.structure?.value?.blueprintNode.kind).toBe('number');
    expect(outer.structure?.value?.raw).toBeUndefined();
    expect(root.runtime.misfitPaths.has('/outer/value')).toBe(false);
    expect(
      readInactiveValuesAt(root, '')?.some(
        (entry) => entry.path === '/outer/value',
      ),
    ).toBe(false);
    expect(readRetainedSlotRaw(root, '/outer/value', 'string')).toBe('hello');
    expect(hasRetainedSlotOwnSource(root, '/outer/value', 'number')).toBe(
      false,
    );
    writeFieldNode(outer.structure!.kind, 'a', 'input', WriteOption.Overwrite);
    expect(outer.structure?.value?.blueprintNode.kind).toBe('string');
    expect(outer.structure?.value?.raw).toBe('hello');
    expect(hasRetainedSlotOwnSource(root, '/outer/value', 'number')).toBe(
      false,
    );
  });

  it('WRITE-085 confines a subtree whole write to latents inside that subtree', () => {
    const host = {
      type: 'object',
      properties: { kind: { type: 'string' } },
      allOf: [
        {
          properties: {
            value: { type: 'string', controls: { active: '../kind === "a"' } },
          },
        },
        {
          properties: {
            value: { type: 'number', controls: { active: '../kind === "b"' } },
          },
        },
      ],
    } as const;
    const { root } = createTestTree({
      type: 'object',
      properties: { inside: host, outside: host },
    });
    loadFieldNodeAtMount(
      root,
      {
        inside: { kind: 'a', value: 'in' },
        outside: { kind: 'a', value: 'out' },
      },
      WriteOption.Overwrite,
    );
    writeFieldNode(
      root.structure!.inside.structure!.kind,
      'b',
      'input',
      WriteOption.Overwrite,
    );
    writeFieldNode(
      root.structure!.outside.structure!.kind,
      'b',
      'input',
      WriteOption.Overwrite,
    );
    writeFieldNode(
      root.structure!.inside,
      { kind: 'b', value: 4 },
      'callerReplace',
      WriteOption.Overwrite,
    );
    expect(hasRetainedSlotOwnSource(root, '/inside/value', 'string')).toBe(
      false,
    );
    expect(readRetainedSlotRaw(root, '/outside/value', 'string')).toBe('out');
    writeFieldNode(
      root.structure!.outside.structure!.kind,
      'a',
      'input',
      WriteOption.Overwrite,
    );
    expect(root.structure?.outside?.structure?.value?.raw).toBe('out');
  });

  it('26C-13 loads one latent kind when every declaration is gated off', () => {
    const { root } = createTestTree(alternateKinds[1].schema);
    loadFieldNodeAtMount(
      root,
      { kind: 'none', value: 2 },
      WriteOption.Overwrite,
    );
    expect(root.structure?.value).toBeUndefined();
    expect(readInactiveValuesAt(root, '')).toEqual([
      { path: '/value', value: '2' },
    ]);
  });

  it('26C-13 selects the live kind when its declaration precedes the old kind', () => {
    const { root } = createTestTree({
      type: 'object',
      properties: {
        kind: { type: 'string' },
      },
      allOf: [
        {
          properties: {
            value: { type: 'number', controls: { active: '../kind === "b"' } },
          },
        },
        {
          properties: {
            value: { type: 'string', controls: { active: '../kind === "a"' } },
          },
        },
      ],
    });
    loadFieldNodeAtMount(
      root,
      { kind: 'a', value: 'hello' },
      WriteOption.Overwrite,
    );
    writeFieldNode(root.structure!.kind, 'b', 'input', WriteOption.Overwrite);
    expect(root.structure?.value?.blueprintNode.kind).toBe('number');
    expect(root.runtime.diagnostics.status).toBe('stable');
    expect(readRetainedSlotRaw(root, '/value', 'string')).toBe('hello');
  });

  it('26C-13 form reset replaces previous kind latents with its loaded value', () => {
    const { root } = createTestTree(alternateKinds[1].schema);
    loadFieldNodeAtMount(
      root,
      { kind: 'a', value: 'hello' },
      WriteOption.Overwrite,
    );
    writeFieldNode(root.structure!.kind, 'b', 'input', WriteOption.Overwrite);
    expect(hasRetainedSlotOwnSource(root, '/value', 'string')).toBe(true);
    resetFieldNodeForm(root, { kind: 'b', value: 2 }, WriteOption.Overwrite);
    expect(hasRetainedSlotOwnSource(root, '/value', 'string')).toBe(false);
    expect(readInactiveValuesAt(root, '')).toEqual([]);
    resetFieldNodeForm(root, { kind: 'none', value: 3 }, WriteOption.Overwrite);
    expect(readInactiveValuesAt(root, '')).toEqual([
      { path: '/value', value: '3' },
    ]);
  });

  it('26C-13 subtree reset loads its snapshot without retaining another kind', () => {
    const { root } = createTestTree({
      type: 'object',
      properties: {
        host: {
          type: 'object',
          properties: { kind: { type: 'string' } },
          allOf: [
            {
              properties: {
                value: {
                  type: 'string',
                  controls: { active: '../kind === "a"' },
                },
              },
            },
            {
              properties: {
                value: {
                  type: 'number',
                  controls: { active: '../kind === "b"' },
                },
              },
            },
          ],
        },
      },
    });
    loadFieldNodeAtMount(
      root,
      { host: { kind: 'a', value: 'hello' } },
      WriteOption.Overwrite,
    );
    const host = root.structure!.host;
    writeFieldNode(host.structure!.kind, 'b', 'input', WriteOption.Overwrite);
    writeFieldNode(host.structure!.value, 2, 'input', WriteOption.Overwrite);
    resetFieldNodeSubtree(host, WriteOption.Overwrite);
    expect(root.structure?.host?.structure?.value?.blueprintNode.kind).toBe(
      'string',
    );
    expect(root.structure?.host?.structure?.value?.raw).toBe('hello');
    expect(hasRetainedSlotOwnSource(root, '/host/value', 'number')).toBe(false);
    expect(readInactiveValuesAt(root, '')).toEqual([]);
  });

  const schema = (unsetOnInactive: boolean) => ({
    type: 'object',
    properties: {
      t: { type: 'boolean' },
      a: { type: 'number', default: 1, controls: { active: '../t === true' } },
      c: { type: 'number', default: 2, controls: { active: '../a === 1' } },
      g: {
        type: 'object',
        controls: {
          active: '../a !== 1 || ../c === 2',
          unsetOnInactive,
        },
        properties: { leaf: { type: 'string' } },
      },
    },
  });

  for (const unsetOnInactive of [false, true])
    it(`SETTLE-005 keeps a reopened node when unset is ${unsetOnInactive}`, () => {
      const { root } = createTestTree(schema(unsetOnInactive));
      loadFieldNodeAtMount(
        root,
        { g: { leaf: 'keep' } },
        WriteOption.Overwrite,
      );
      const g = root.structure?.g;
      if (!g) throw new Error('Expected g in the previous commit');
      writeFieldNode(root.structure!.t, true, 'input', WriteOption.Overwrite);
      expect(root.structure?.g).toBe(g);
      expect(g.detached).toBe(false);
      expect(g.raw).toBeUndefined();
      expect(g.structure?.leaf?.raw).toBe('keep');
      expect(root.raw).toBeUndefined();
    });

  it('SETTLE-011 keeps the previous g instance after Source B restores the final shape', () => {
    const base = schema(true);
    const { root } = createTestTree({
      ...base,
      properties: {
        ...base.properties,
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
    loadFieldNodeAtMount(
      root,
      { g: { leaf: 'keep' }, x: 'steady' },
      WriteOption.Overwrite,
    );
    const g = root.structure?.g;
    if (!g) throw new Error('Expected g in the previous commit');
    expect(() =>
      writeFieldNode(
        root,
        { t: true, g: { leaf: 'keep' }, x: 0 },
        'callerReplace',
        WriteOption.Overwrite,
      ),
    ).toThrow();
    expect(root.runtime.diagnostics).toMatchObject({ cause: 'budget' });
    expect(root.structure?.g).toBe(g);
    expect(g.detached).toBe(false);
    expect(g.raw).toBeUndefined();
    expect(g.structure?.leaf?.raw).toBe('keep');
    expect(root.raw).toBeUndefined();
  });

  it('WRITE-015 keeps exited raw when automatic writes are disabled', () => {
    const { root } = createTestTree({
      type: 'object',
      properties: {
        flag: { type: 'boolean' },
        secret: {
          type: 'string',
          controls: {
            active: '../flag',
            unsetOnInactive: true,
          },
        },
      },
    });
    loadFieldNodeAtMount(
      root,
      { flag: true, secret: 'held' },
      WriteOption.Overwrite,
    );
    const secret = root.structure!.secret;
    writeFieldNode(
      root.structure!.flag,
      false,
      'input',
      WriteOption.DisableAutomaticWrites,
    );
    expect(secret.detached).toBe(true);
    expect(secret.raw).toBe('held');
    expect(root.raw).toBeUndefined();
    expect(readRetainedSlotRaw(root, '/secret', 'string')).toBe('held');
  });

  it('SETTLE-011 keeps exited raw after a degraded host wheel', () => {
    const { root } = createTestTree({
      type: 'object',
      properties: {
        flag: { type: 'boolean' },
        b: { type: 'number', default: 5 },
        secret: {
          type: 'string',
          controls: {
            active: '../flag',
            unsetOnInactive: true,
          },
        },
      },
      controls: {
        fields: [
          {
            targets: ['b'],
            controls: {
              active: '!../flag && ../b === undefined',
            },
          },
        ],
      },
    });
    loadFieldNodeAtMount(
      root,
      { flag: true, secret: 'held' },
      WriteOption.Overwrite,
    );
    const secret = root.structure!.secret;
    expect(() =>
      writeFieldNode(
        root.structure!.flag,
        false,
        'input',
        WriteOption.Overwrite,
      ),
    ).toThrow();
    expect(root.runtime.diagnostics).toMatchObject({
      status: 'degraded',
      exceededBudget: 'hostWheel',
    });
    expect(secret.detached).toBe(true);
    expect(secret.raw).toBe('held');
    expect(root.raw).toBeUndefined();
    expect(readRetainedSlotRaw(root, '/secret', 'string')).toBe('held');
  });
});
