import { describe, expect, it } from 'vitest';

import { SchemaNodeEventType, SetValueOption } from '../../SchemaNode';
import type { SchemaNode } from '../../SchemaNode';
import { NodeState, ValidationMode } from '../../types/state';
import { makeSchemaNodeTree } from '../makeSchemaNodeTree';

const requireNode = (root: SchemaNode, path: string): SchemaNode => {
  const node = root.find(path);
  if (!node) throw new Error(`Missing test node ${path}`);
  return node;
};

const injectionTree = () => {
  const { root } = makeSchemaNodeTree({ type: 'object', properties: {
    src: { type: 'string', controls: {
      injectTo: (value: unknown) => ({ '../tgt': `f(${value})` }),
    } }, tgt: { type: 'string' },
  } });
  root.setValue({ src: 'x', tgt: 'custom' });
  requireNode(root, '/tgt').setValue('mine');
  return root;
};

const injectionBatch = () => {
  const root = injectionTree();
  root.batch(() => {
    requireNode(root, '/src').setValue('y');
    requireNode(root, '/src').setValue('x');
  });
  return root;
};

// filid:contract factory-single-path
describe('round7 dispatch and notification ports', () => {
  it('r7-port.mjs:478 EVENT-008 resets feedback budget for each of 30 caller writes', () => {
    const { root } = makeSchemaNodeTree({ type: 'object', properties: {
      a: { type: 'string' }, b: { type: 'string' },
    } });
    root.setValue({});
    const a = requireNode(root, '/a');
    const b = requireNode(root, '/b');
    a.subscribe(() => { b.setValue(`derived:${a.value}`); });
    for (let i = 1; i <= 30; i += 1) a.setValue(`v${i}`);
    expect(root.outputValue).toEqual({ a: 'v30', b: 'derived:v30' });
    expect(root.diagnostics.status).toBe('stable');
    const { root: feedbackRoot } = makeSchemaNodeTree({ type: 'string' });
    let calls = 0;
    feedbackRoot.subscribe(() => {
      if (calls < 30) feedbackRoot.setValue(`c${++calls}`);
    });
    expect(() => feedbackRoot.setValue('go')).toThrowError(expect.objectContaining({
      code: 'SCHEMA_FORM_ERROR.FEEDBACK_LIMIT_EXCEEDED',
    }));
  });

  it('r7-port.mjs:296 X2 batch chooses the final b fragment', () => {
    const { root } = makeSchemaNodeTree({ type: 'object', properties: {
      kind: { type: 'string' },
    }, allOf: [
      { controls: { active: './kind === "a"' }, properties: {
        x: { type: 'string', default: 'A' },
      } },
      { controls: { active: './kind === "b"' }, properties: {
        x: { type: 'string', default: 'B' },
      } },
    ] });
    root.setValue({});
    root.batch(() => {
      requireNode(root, '/kind').setValue('a');
      requireNode(root, '/kind').setValue('b');
    });
    expect(root.outputValue).toEqual({ kind: 'b', x: 'B' });
  });

  it('r7-port.mjs:320 X3 batch leaves the manually edited injection target', () => {
    expect(injectionBatch().outputValue).toEqual({ src: 'x', tgt: 'mine' });
  });

  it('r7-port.mjs:129 E4 requests validation once after listener write-back', () => {
    const { root, runtime } = makeSchemaNodeTree({ type: 'object', properties: {
      a: { type: 'string' },
    } });
    root.setValue({ a: 'orig' });
    const a = requireNode(root, '/a');
    let changes = 0;
    Reflect.set(runtime, 'validationMode', ValidationMode.OnChange);
    Reflect.set(runtime, 'onChange', () => { changes += 1; });
    a.subscribe(() => { if (a.value === 'bad') a.setValue('orig'); });
    const before: number = Reflect.get(runtime, 'validationStamp') ?? 0;
    a.setValue('bad');
    expect([changes, (Reflect.get(runtime, 'validationStamp') ?? 0) - before,
      root.outputValue])
      .toEqual([1, 1, { a: 'orig' }]);
    const batched = makeSchemaNodeTree({ type: 'object', properties: {
      a: { type: 'string' },
    } });
    batched.root.setValue({ a: 'orig' });
    let batchChanges = 0;
    Reflect.set(batched.runtime, 'validationMode', ValidationMode.OnChange);
    Reflect.set(batched.runtime, 'onChange', () => { batchChanges += 1; });
    const batchBefore: number = Reflect.get(batched.runtime, 'validationStamp') ?? 0;
    batched.root.batch(() => {
      requireNode(batched.root, '/a').setValue('bad');
      requireNode(batched.root, '/a').setValue('orig');
    });
    expect([batchChanges, (Reflect.get(batched.runtime, 'validationStamp') ?? 0) - batchBefore,
      batched.root.outputValue])
      .toEqual([0, 0, { a: 'orig' }]);
  });

  it('r7-port.mjs:163 EVENT-008 permits 30 independent writes with a store listener', () => {
    const { root } = makeSchemaNodeTree({ type: 'object', properties: {
      a: { type: 'string' }, b: { type: 'string' },
    } });
    root.setValue({});
    const a = requireNode(root, '/a');
    const b = requireNode(root, '/b');
    let deliveries = 0;
    a.subscribe(() => {
      deliveries += 1;
      b.setValue(`derived:${a.value}`);
    });
    for (let i = 1; i <= 30; i += 1) a.setValue(`v${i}`);
    expect(deliveries).toBe(30);
    expect(b.value).toBe('derived:v30');
  });

  it('r7-port.mjs:87 E3 batch retains the manual target', () => {
    expect(injectionBatch().find('/tgt')?.value).toBe('mine');
  });

  it('r7-port.mjs:338 X3c batch retains the target under commit-edge comparison', () => {
    const root = injectionBatch();
    expect(root.outputValue).toEqual({ src: 'x', tgt: 'mine' });
    expect(root.diagnostics.status).toBe('stable');
  });

  it('WRITE-015 applies batch-wide automatic-write suppression', () => {
    const { root } = makeSchemaNodeTree({ type: 'object', properties: {
      src: { type: 'string' },
      target: { type: 'string', controls: {
        derived: '../src === undefined ? undefined : ../src + "!"',
      } },
    } });
    root.setValue({});
    root.batch(() => {
      requireNode(root, '/src').setValue('A', SetValueOption.DisableAutomaticWrites);
      requireNode(root, '/src').setValue('B', SetValueOption.EnableAutomaticWrites);
    });
    expect(root.outputValue).toEqual({ src: 'B' });
    expect(requireNode(root, '/target').value).toBeUndefined();
  });

  it('CONTROLS-079 treats injectTo callback public writes as nested feedback', () => {
    let root: SchemaNode | undefined;
    const created = makeSchemaNodeTree({ type: 'object', properties: {
      src: { type: 'string', controls: { injectTo: () => {
        root?.find('/target')?.setValue('callback');
        return {};
      } } },
      target: { type: 'string' },
    } });
    root = created.root;
    root.setValue({ src: 'start' });
    expect(root.find('/target')?.value).toBe('callback');
  });

  it('EVENT-066 delivers resetInteraction state changes in the same commit', () => {
    const { root } = makeSchemaNodeTree({ type: 'object', properties: {
      clear: { type: 'boolean' },
      target: { type: 'string', controls: { resetInteraction: '../clear' } },
    } });
    root.setValue({ clear: false, target: 'X' });
    const target = requireNode(root, '/target');
    target.setState({ [NodeState.Dirty]: true, [NodeState.Touched]: true });
    const delivered: number[] = [];
    target.subscribe((event) => { delivered.push(event.type); });
    requireNode(root, '/clear').setValue(true);
    expect(target.state).toMatchObject({
      [NodeState.Dirty]: false, [NodeState.Touched]: false,
    });
    expect(delivered.some((type) => !!(type & SchemaNodeEventType.UpdateState))).toBe(true);
  });

  it('WRITE-096 marks whole replacement UpdateValue with callerReplace source', () => {
    const { root } = makeSchemaNodeTree({ type: 'object', properties: {
      a: { type: 'string' },
    } });
    root.setValue({ a: 'old' });
    const sources: unknown[] = [];
    root.subscribe((event) => {
      if (event.type & SchemaNodeEventType.UpdateValue)
        sources.push(event.options?.[SchemaNodeEventType.UpdateValue]);
    });
    root.setValue({ a: 'new' });
    expect(sources).toEqual([{ source: 'callerReplace' }]);
  });

  it('EVENT-064 separates calculated-state and effective-schema event bits', () => {
    const { root } = makeSchemaNodeTree({ type: 'object', properties: {
      show: { type: 'boolean' },
      target: { type: 'string', controls: { visible: '../show' } },
    } });
    root.setValue({ show: false, target: 'X' });
    const target = requireNode(root, '/target');
    const delivered: number[] = [];
    target.subscribe((event) => { delivered.push(event.type); });
    requireNode(root, '/show').setValue(true);
    expect(target.visible).toBe(true);
    expect(delivered.some((type) => !!(type & SchemaNodeEventType.UpdateComputedProperties)))
      .toBe(true);
    expect(delivered.every((type) => !(type & SchemaNodeEventType.UpdateJsonSchema)))
      .toBe(true);
  });
});
