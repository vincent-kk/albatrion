import { describe, expect, it, vi } from 'vitest';

import { dispatchMount, dispatchSetValue, dispatchValidate,
  subscribeSchemaNode } from '../../dispatch';
import { SchemaNodeEventType } from '../../record';
import { ValidationMode } from '../../types/state';
import { createDispatchTree } from '../../dispatch/__tests__/fixtures/createDispatchTree';
import { readSchemaNodeErrors, requestSchemaNodeValidation } from '../index';
import type { ValidationIssue, Validator } from '../type';

// filid:contract validation-lifetime
describe('validation execution', () => {
  it('VALIDATE-006 VALIDATE-049 coalesces requests and discards a stale result', async () => {
    const completions: ((issues: readonly ValidationIssue[]) => void)[] = [];
    const validate = vi.fn(() => new Promise<readonly ValidationIssue[]>((resolve) => {
      completions.push(resolve);
    }));
    const validator: Validator = { compile: () => validate, compileGuard: () => () => true };
    const { root, runtime } = createDispatchTree({ type: 'string' }, undefined, validator);
    dispatchMount(root, 'initial');
    const delivered: string[] = [];
    requestSchemaNodeValidation(root, (issues) => delivered.push(issues[0]?.message ?? 'valid'));
    requestSchemaNodeValidation(root, (issues) => delivered.push(issues[0]?.message ?? 'valid'));
    await Promise.resolve();
    expect(validate).toHaveBeenCalledTimes(1);
    dispatchSetValue(root, 'latest');
    requestSchemaNodeValidation(root, (issues) => delivered.push(issues[0]?.message ?? 'valid'));
    await Promise.resolve();
    expect(validate).toHaveBeenCalledTimes(2);
    completions[1]([{ dataPath: '', message: 'latest' }]);
    await Promise.resolve();
    completions[0]([{ dataPath: '', message: 'stale' }]);
    await Promise.resolve();
    expect(delivered).toEqual(['latest']);
    expect(runtime.globalErrors).toEqual([{ dataPath: '', message: 'latest' }]);
  });

  it('VALIDATE-008 None provides no verdict; OnRequest explicitly evaluates fresh input', async () => {
    const validate = vi.fn(() => null);
    const validator: Validator = { compile: () => validate, compileGuard: () => () => true };
    const { root, runtime } = createDispatchTree({ type: 'string' }, undefined, validator);
    runtime.validationMode = ValidationMode.None;
    dispatchMount(root, 'first');
    requestSchemaNodeValidation(root, () => { throw new Error('None delivered'); });
    await Promise.resolve();
    expect(validate).not.toHaveBeenCalled();
    expect(await dispatchValidate(root)).toEqual([]);
    expect(runtime.validationResult).toBeUndefined();
    expect(validate).not.toHaveBeenCalled();
    runtime.validationMode = ValidationMode.OnRequest;
    await dispatchValidate(root);
    await dispatchValidate(root);
    expect(validate).toHaveBeenCalledTimes(2);
  });

  it('VALIDATE-043 FRAGMENT-053 routes root and child issues without altering the verdict', async () => {
    const issues = [{ dataPath: '/', message: 'root' },
      { dataPath: '/name', message: 'child' }];
    const validator: Validator = { compile: () => () => issues,
      compileGuard: () => () => true };
    const { root, runtime } = createDispatchTree({ type: 'object',
      properties: { name: { type: 'string' } } }, undefined, validator);
    dispatchMount(root, { name: 'a' });
    expect(await dispatchValidate(root)).toBe(issues);
    expect(runtime.globalErrors).toBe(issues);
    expect(readSchemaNodeErrors(root).map((issue) => issue.message)).toEqual(['root']);
    expect(readSchemaNodeErrors(root.structure?.name ?? root).map((issue) => issue.message))
      .toEqual(['child']);
  });

  it('EVENT-046 delivers the latest result after the synchronous chain in its own wave', async () => {
    const validator: Validator = { compile: () => () => [
      { dataPath: '', message: 'invalid' }], compileGuard: () => () => true };
    const { root, runtime } = createDispatchTree({ type: 'string' }, undefined, validator);
    dispatchMount(root, 'initial');
    runtime.validationMode = ValidationMode.OnChange;
    const order: string[] = [];
    runtime.onChange = () => order.push('change');
    subscribeSchemaNode(root, (event) => {
      if (event.type & SchemaNodeEventType.UpdateGlobalError)
        order.push('validation');
    });
    dispatchSetValue(root, 'changed');
    expect(order).toEqual(['change']);
    await new Promise((resolve) => setTimeout(resolve, 0));
    expect(order).toEqual(['change', 'validation']);
  });

  it('WRITE-093 VALIDATE-051 passes the emitted union value by reference', async () => {
    const validate = vi.fn(() => null);
    const validator: Validator = { compile: () => validate, compileGuard: () => () => true };
    const { root } = createDispatchTree({ type: ['object', 'string'] }, undefined, validator);
    dispatchMount(root, { nested: 'value' });
    await dispatchValidate(root);
    expect(validate).toHaveBeenCalledWith(root.emit);
  });

  it('18C-101 coalesces two scoped requests without losing either target', async () => {
    const issues = [{ dataPath: '/a', message: 'A' },
      { dataPath: '/b', message: 'B' }];
    const validate = vi.fn(() => issues);
    const validator: Validator = { compile: () => validate,
      compileGuard: () => () => true };
    const { root, runtime } = createDispatchTree({ type: 'object', properties: {
      a: { type: 'string' }, b: { type: 'string' },
    } }, undefined, validator);
    dispatchMount(root, { a: 'a', b: 'b' });
    runtime.validationMode = ValidationMode.OnRequest;
    const a = root.structure?.a ?? root;
    const b = root.structure?.b ?? root;
    requestSchemaNodeValidation(a, () => undefined);
    requestSchemaNodeValidation(b, () => undefined);
    await new Promise((resolve) => setTimeout(resolve, 0));
    expect(validate).toHaveBeenCalledTimes(1);
    expect(readSchemaNodeErrors(a).map((issue) => issue.message)).toEqual(['A']);
    expect(readSchemaNodeErrors(b).map((issue) => issue.message)).toEqual(['B']);
  });

  it('VALIDATE-008 leaves the verdict absent when no validator is selected', async () => {
    const { root, runtime } = createDispatchTree({ type: 'string' },
      undefined, undefined);
    dispatchMount(root, 'value');
    runtime.validationMode = ValidationMode.OnChange;
    const deliver = vi.fn();
    requestSchemaNodeValidation(root, deliver);
    await new Promise((resolve) => setTimeout(resolve, 0));
    expect(deliver).not.toHaveBeenCalled();
    expect(runtime.validationResult).toBeUndefined();
    expect(runtime.globalErrors).toBeUndefined();
  });
});
