import { describe, expect, it } from 'vitest';

import { SetValueOption } from '../../types/value';
import { loadSchemaNodeAtMount, resetSchemaNodeForm, resetSchemaNodeSubtree,
  writeSchemaNode } from '../index';
import { createTestTree } from './fixtures/createTestTree';

// filid:contract settle-transition
describe('final-shape exits', () => {
  const alternateKinds = [
    { name: 'discriminated oneOf', schema: {
      type: 'object', controls: { discriminator: 'kind' },
      properties: { kind: { type: 'string' } },
      oneOf: [
        { properties: { kind: { type: 'string', const: 'a' },
          value: { type: 'string' } } },
        { properties: { kind: { type: 'string', const: 'b' },
          value: { type: 'number' } } },
      ],
    } },
    { name: 'two node gates', schema: {
      type: 'object', properties: { kind: { type: 'string' } },
      allOf: [
        { properties: { value: { type: 'string',
          controls: { active: '../kind === "a"' } } } },
        { properties: { value: { type: 'number',
          controls: { active: '../kind === "b"' } } } },
      ],
    } },
    { name: 'if/then/else', schema: {
      type: 'object', properties: { kind: { type: 'string' } },
      if: {},
      then: { properties: { value: { type: 'string' } } },
      else: { properties: { value: { type: 'number' } } },
    } },
  ] as const;

  for (const { name, schema: alternateSchema } of alternateKinds)
    it(`WRITE-099 keeps alternate value kinds stable for ${name}`, () => {
      const predicate = (input: unknown): boolean =>
        input !== null && typeof input === 'object' &&
        'kind' in input && input.kind === 'a';
      const { root: mounted } = createTestTree(alternateSchema, predicate);
      expect(() => loadSchemaNodeAtMount(mounted, { kind: 'b', value: 2 },
        SetValueOption.Overwrite)).not.toThrow();
      expect(mounted.structure?.value?.blueprintNode.kind).toBe('number');
      expect(mounted.runtime.diagnostics.status).toBe('stable');
      expect(mounted.runtime.inactiveValuesMemo.get('')?.some((entry) =>
        entry.path === '/value')).toBe(false);

      const { root } = createTestTree(alternateSchema, predicate);
      loadSchemaNodeAtMount(root, { kind: 'a', value: 'first' },
        SetValueOption.Overwrite);
      expect(root.structure?.value?.blueprintNode.kind).toBe('string');
      expect(() => writeSchemaNode(root, { kind: 'b', value: 2 },
        'callerReplace', SetValueOption.Overwrite)).not.toThrow();
      expect(root.structure?.value?.blueprintNode.kind).toBe('number');
      expect(() => writeSchemaNode(root, { kind: 'a', value: 'again' },
        'callerReplace', SetValueOption.Overwrite)).not.toThrow();
      expect(root.structure?.value?.blueprintNode.kind).toBe('string');
      expect(root.runtime.diagnostics.status).toBe('stable');
    });

  it('26C-13 keeps the exited kind raw through input writes only', () => {
    const { root } = createTestTree(alternateKinds[0].schema);
    loadSchemaNodeAtMount(root, { kind: 'a', value: 'hello' },
      SetValueOption.Overwrite);
    writeSchemaNode(root.structure!.kind, 'b', 'input', SetValueOption.Overwrite);
    expect(root.structure?.value?.blueprintNode.kind).toBe('number');
    writeSchemaNode(root.structure!.value, 3, 'input', SetValueOption.Overwrite);
    expect(root.runtime.latentRaw.get(JSON.stringify(['/value', 'string'])))
      .toBe('hello');
    expect(root.runtime.inactiveValuesMemo.get('')?.some((entry) =>
      entry.path === '/value')).toBe(false);
    writeSchemaNode(root.structure!.kind, 'a', 'input', SetValueOption.Overwrite);
    expect(root.structure?.value?.blueprintNode.kind).toBe('string');
    expect(root.structure?.value?.raw).toBe('hello');
    expect(root.runtime.inactiveValuesMemo.get('')?.some((entry) =>
      entry.path === '/value')).toBe(false);
    writeSchemaNode(root.structure!.kind, 'none', 'input', SetValueOption.Overwrite);
    expect(root.runtime.inactiveValuesMemo.get('')?.some((entry) =>
      entry.path === '/value')).toBe(true);
  });

  it('WRITE-094 makes a whole write the only raw of every kind in its scope', () => {
    const { root } = createTestTree(alternateKinds[0].schema);
    loadSchemaNodeAtMount(root, { kind: 'a', value: 'hello' },
      SetValueOption.Overwrite);
    writeSchemaNode(root.structure!.kind, 'b', 'input', SetValueOption.Overwrite);
    writeSchemaNode(root.structure!.value, 3, 'input', SetValueOption.Overwrite);
    writeSchemaNode(root, { kind: 'b', value: 4 },
      'callerReplace', SetValueOption.Overwrite);
    expect(root.runtime.latentRaw.has(JSON.stringify(['/value', 'string'])))
      .toBe(false);
    writeSchemaNode(root.structure!.kind, 'a', 'input', SetValueOption.Overwrite);
    expect(root.structure?.value?.blueprintNode.kind).toBe('string');
    expect(root.structure?.value?.raw).not.toBe('hello');
  });

  it('26C-13 replaces every kind at a path covered by a whole write', () => {
    const { root } = createTestTree(alternateKinds[0].schema);
    loadSchemaNodeAtMount(root, { kind: 'a', value: 'hello' },
      SetValueOption.Overwrite);
    writeSchemaNode(root.structure!.kind, 'b', 'input', SetValueOption.Overwrite);
    writeSchemaNode(root.structure!.value, 3, 'input', SetValueOption.Overwrite);
    writeSchemaNode(root, { kind: 'a', value: 'again' },
      'callerReplace', SetValueOption.Overwrite);
    expect(root.structure?.value?.raw).toBe('again');
    expect(root.raw).toMatchObject({ kind: 'a', value: 'again' });
    expect([...root.runtime.latentRaw.keys()].filter((key) =>
      key.startsWith('["/value",'))).toEqual([]);
    expect(root.runtime.inactiveValuesMemo.get('')?.some((entry) =>
      entry.path === '/value')).toBe(false);
    expect(root.runtime.typeMismatchPaths.has('/value')).toBe(false);
    writeSchemaNode(root.structure!.kind, 'b', 'input', SetValueOption.Overwrite);
    expect(root.structure?.value?.blueprintNode.kind).toBe('number');
    expect(root.structure?.value?.raw).not.toBe(3);
    expect(root.structure?.value?.raw).toBeUndefined();
  });

  it('VALUE-025 enters an other-kind node from its own latent or absent', () => {
    const { root } = createTestTree(alternateKinds[0].schema);
    loadSchemaNodeAtMount(root, { kind: 'a', value: 'hello' },
      SetValueOption.Overwrite);
    writeSchemaNode(root.structure!.kind, 'b', 'input', SetValueOption.Overwrite);
    expect(root.structure?.value?.blueprintNode.kind).toBe('number');
    expect(root.structure?.value?.raw).toBeUndefined();
    expect(root.runtime.typeMismatchPaths.has('/value')).toBe(false);
    expect(root.runtime.inactiveValuesMemo.get('')?.some((entry) =>
      entry.path === '/value')).toBe(false);
    expect(root.runtime.latentRaw.get(JSON.stringify(['/value', 'string'])))
      .toBe('hello');
    expect(root.runtime.latentRaw.has(JSON.stringify(['/value', 'number'])))
      .toBe(false);
    writeSchemaNode(root.structure!.kind, 'a', 'input', SetValueOption.Overwrite);
    expect(root.structure?.value?.blueprintNode.kind).toBe('string');
    expect(root.structure?.value?.raw).toBe('hello');
    expect(root.runtime.latentRaw.has(JSON.stringify(['/value', 'number'])))
      .toBe(false);
  });

  it('VALUE-025 enters a nested other-kind node from its own latent or absent', () => {
    const { root } = createTestTree({ type: 'object',
      properties: { outer: alternateKinds[0].schema } });
    loadSchemaNodeAtMount(root, { outer: { kind: 'a', value: 'hello' } },
      SetValueOption.Overwrite);
    const outer = root.structure!.outer;
    writeSchemaNode(outer.structure!.kind, 'b', 'input', SetValueOption.Overwrite);
    expect(outer.structure?.value?.blueprintNode.kind).toBe('number');
    expect(outer.structure?.value?.raw).toBeUndefined();
    expect(root.runtime.typeMismatchPaths.has('/outer/value')).toBe(false);
    expect(root.runtime.inactiveValuesMemo.get('')?.some((entry) =>
      entry.path === '/outer/value')).toBe(false);
    expect(root.runtime.latentRaw.get(JSON.stringify(['/outer/value', 'string'])))
      .toBe('hello');
    expect(root.runtime.latentRaw.has(JSON.stringify(['/outer/value', 'number'])))
      .toBe(false);
    writeSchemaNode(outer.structure!.kind, 'a', 'input', SetValueOption.Overwrite);
    expect(outer.structure?.value?.blueprintNode.kind).toBe('string');
    expect(outer.structure?.value?.raw).toBe('hello');
    expect(root.runtime.latentRaw.has(JSON.stringify(['/outer/value', 'number'])))
      .toBe(false);
  });

  it('WRITE-085 confines a subtree whole write to latents inside that subtree', () => {
    const host = { type: 'object', properties: { kind: { type: 'string' } },
      allOf: [
        { properties: { value: { type: 'string',
          controls: { active: '../kind === "a"' } } } },
        { properties: { value: { type: 'number',
          controls: { active: '../kind === "b"' } } } },
      ] } as const;
    const { root } = createTestTree({ type: 'object',
      properties: { inside: host, outside: host } });
    loadSchemaNodeAtMount(root, { inside: { kind: 'a', value: 'in' },
      outside: { kind: 'a', value: 'out' } }, SetValueOption.Overwrite);
    writeSchemaNode(root.structure!.inside.structure!.kind, 'b', 'input',
      SetValueOption.Overwrite);
    writeSchemaNode(root.structure!.outside.structure!.kind, 'b', 'input',
      SetValueOption.Overwrite);
    writeSchemaNode(root.structure!.inside, { kind: 'b', value: 4 },
      'callerReplace', SetValueOption.Overwrite);
    expect(root.runtime.latentRaw.has(JSON.stringify(['/inside/value', 'string'])))
      .toBe(false);
    expect(root.runtime.latentRaw.get(JSON.stringify(['/outside/value', 'string'])))
      .toBe('out');
    writeSchemaNode(root.structure!.outside.structure!.kind, 'a', 'input',
      SetValueOption.Overwrite);
    expect(root.structure?.outside?.structure?.value?.raw).toBe('out');
  });

  it('26C-13 loads one latent kind when every declaration is gated off', () => {
    const { root } = createTestTree(alternateKinds[1].schema);
    loadSchemaNodeAtMount(root, { kind: 'none', value: 2 },
      SetValueOption.Overwrite);
    expect(root.structure?.value).toBeUndefined();
    expect([...root.runtime.latentRaw.keys()].filter((key) =>
      key.startsWith('["/value",'))).toEqual([JSON.stringify(['/value', 'string'])]);
    expect(root.runtime.inactiveValuesMemo.get('')).toEqual([
      { path: '/value', value: 2 },
    ]);
  });

  it('26C-13 selects the live kind when its declaration precedes the old kind', () => {
    const { root } = createTestTree({ type: 'object', properties: {
      kind: { type: 'string' },
    }, allOf: [
      { properties: { value: { type: 'number',
        controls: { active: '../kind === "b"' } } } },
      { properties: { value: { type: 'string',
        controls: { active: '../kind === "a"' } } } },
    ] });
    loadSchemaNodeAtMount(root, { kind: 'a', value: 'hello' },
      SetValueOption.Overwrite);
    writeSchemaNode(root.structure!.kind, 'b', 'input', SetValueOption.Overwrite);
    expect(root.structure?.value?.blueprintNode.kind).toBe('number');
    expect(root.runtime.diagnostics.status).toBe('stable');
    expect(root.runtime.latentRaw.get(JSON.stringify(['/value', 'string'])))
      .toBe('hello');
  });

  it('26C-13 form reset replaces previous kind latents with its loaded value', () => {
    const { root } = createTestTree(alternateKinds[1].schema);
    loadSchemaNodeAtMount(root, { kind: 'a', value: 'hello' },
      SetValueOption.Overwrite);
    writeSchemaNode(root.structure!.kind, 'b', 'input', SetValueOption.Overwrite);
    expect(root.runtime.latentRaw.has(JSON.stringify(['/value', 'string'])))
      .toBe(true);
    resetSchemaNodeForm(root, { kind: 'b', value: 2 }, SetValueOption.Overwrite);
    expect(root.runtime.latentRaw.has(JSON.stringify(['/value', 'string'])))
      .toBe(false);
    expect(root.runtime.inactiveValuesMemo.get('')).toEqual([]);
    resetSchemaNodeForm(root, { kind: 'none', value: 3 }, SetValueOption.Overwrite);
    expect([...root.runtime.latentRaw.keys()].filter((key) =>
      key.startsWith('["/value",'))).toEqual([JSON.stringify(['/value', 'string'])]);
    expect(root.runtime.inactiveValuesMemo.get('')).toEqual([
      { path: '/value', value: 3 },
    ]);
  });

  it('26C-13 subtree reset loads its snapshot without retaining another kind', () => {
    const { root } = createTestTree({ type: 'object', properties: {
      host: { type: 'object', properties: { kind: { type: 'string' } }, allOf: [
        { properties: { value: { type: 'string',
          controls: { active: '../kind === "a"' } } } },
        { properties: { value: { type: 'number',
          controls: { active: '../kind === "b"' } } } },
      ] },
    } });
    loadSchemaNodeAtMount(root, { host: { kind: 'a', value: 'hello' } },
      SetValueOption.Overwrite);
    const host = root.structure!.host;
    writeSchemaNode(host.structure!.kind, 'b', 'input', SetValueOption.Overwrite);
    writeSchemaNode(host.structure!.value, 2, 'input', SetValueOption.Overwrite);
    resetSchemaNodeSubtree(host, SetValueOption.Overwrite);
    expect(root.structure?.host?.structure?.value?.blueprintNode.kind).toBe('string');
    expect(root.structure?.host?.structure?.value?.raw).toBe('hello');
    expect(root.runtime.latentRaw.has(JSON.stringify(['/host/value', 'number'])))
      .toBe(false);
    expect(root.runtime.inactiveValuesMemo.get('')).toEqual([]);
  });

  const schema = (unsetOnInactive: boolean) => ({ type: 'object', properties: {
    t: { type: 'boolean' },
    a: { type: 'number', default: 1, controls: { active: '../t === true' } },
    c: { type: 'number', default: 2, controls: { active: '../a === 1' } },
    g: { type: 'object', controls: {
      active: '../a !== 1 || ../c === 2', unsetOnInactive,
    }, properties: { leaf: { type: 'string' } } },
  } });

  for (const unsetOnInactive of [false, true])
    it(`SETTLE-005 keeps a reopened node when unset is ${unsetOnInactive}`, () => {
      const { root } = createTestTree(schema(unsetOnInactive));
      loadSchemaNodeAtMount(root, { g: { leaf: 'keep' } }, SetValueOption.Overwrite);
      const g = root.structure?.g;
      if (!g) throw new Error('Expected g in the previous commit');
      writeSchemaNode(root.structure!.t, true, 'input', SetValueOption.Overwrite);
      expect(root.structure?.g).toBe(g);
      expect(g.detached).toBe(false);
      expect(g.raw).toEqual({ leaf: 'keep' });
      expect(root.raw).toMatchObject({ g: { leaf: 'keep' } });
    });

  it('SETTLE-011 keeps the previous g instance after Source B restores the final shape', () => {
    const base = schema(true);
    const { root } = createTestTree({ ...base, properties: {
      ...base.properties, x: { type: ['string', 'boolean'] },
    }, allOf: [
      { controls: { active: './x === "0"' },
        properties: { x: { type: 'boolean' } } },
      { controls: { active: './x !== "0"' },
        properties: { x: { type: 'string' } } },
    ] });
    loadSchemaNodeAtMount(root, { g: { leaf: 'keep' }, x: 'steady' },
      SetValueOption.Overwrite);
    const g = root.structure?.g;
    if (!g) throw new Error('Expected g in the previous commit');
    expect(() => writeSchemaNode(root, { t: true, g: { leaf: 'keep' }, x: 0 },
      'callerReplace', SetValueOption.Overwrite)).toThrow();
    expect(root.runtime.diagnostics).toMatchObject({ cause: 'budget' });
    expect(root.structure?.g).toBe(g);
    expect(g.detached).toBe(false);
    expect(g.raw).toEqual({ leaf: 'keep' });
    expect(root.raw).toMatchObject({ g: { leaf: 'keep' } });
  });

  it('WRITE-015 keeps exited raw when automatic writes are disabled', () => {
    const { root } = createTestTree({ type: 'object', properties: {
      flag: { type: 'boolean' },
      secret: { type: 'string', controls: {
        active: '../flag', unsetOnInactive: true,
      } },
    } });
    loadSchemaNodeAtMount(root, { flag: true, secret: 'held' },
      SetValueOption.Overwrite);
    const secret = root.structure!.secret;
    writeSchemaNode(root.structure!.flag, false, 'input',
      SetValueOption.DisableAutomaticWrites);
    expect(secret.detached).toBe(true);
    expect(secret.raw).toBe('held');
    expect(root.raw).toHaveProperty('secret', 'held');
  });

  it('SETTLE-011 keeps exited raw after a degraded host wheel', () => {
    const { root } = createTestTree({ type: 'object', properties: {
      flag: { type: 'boolean' },
      b: { type: 'number', default: 5 },
      secret: { type: 'string', controls: {
        active: '../flag', unsetOnInactive: true,
      } },
    }, controls: { children: [{ targets: ['b'], controls: {
      active: '!../flag && ../b === undefined',
    } }] } });
    loadSchemaNodeAtMount(root, { flag: true, secret: 'held' },
      SetValueOption.Overwrite);
    const secret = root.structure!.secret;
    expect(() => writeSchemaNode(root.structure!.flag, false, 'input',
      SetValueOption.Overwrite)).toThrow();
    expect(root.runtime.diagnostics).toMatchObject({
      status: 'degraded', exceededBudget: 'hostWheel',
    });
    expect(secret.detached).toBe(true);
    expect(secret.raw).toBe('held');
    expect(root.raw).toHaveProperty('secret', 'held');
  });
});
