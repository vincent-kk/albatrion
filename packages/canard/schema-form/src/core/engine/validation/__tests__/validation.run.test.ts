import { describe, expect, it, vi } from 'vitest';

import { createDispatchTree } from '@/schema-form/core/engine/__tests__/fixtures/createDispatchTree';
import { FieldNodeEventType } from '@/schema-form/core/engine/record';
import { ValidationMode } from '@/schema-form/core/engine/types/state';
import {
  dispatchMount,
  dispatchSetValue,
  dispatchValidate,
  subscribeFieldNode,
} from '@/schema-form/core/engine/write';

import type { ValidationIssue } from '../types/issue';
import type { Validator } from '../types/validator';
import { readFieldNodeErrors } from '../utils/read/readFieldNodeErrors';
import { requestFieldNodeValidation } from '../utils/run/requestFieldNodeValidation';

// filid:contract validation-lifetime
describe('validation execution', () => {
  it('VALIDATE-006 VALIDATE-049 coalesces requests and discards a stale result', async () => {
    const completions: ((issues: readonly ValidationIssue[]) => void)[] = [];
    const validate = vi.fn(
      () =>
        new Promise<readonly ValidationIssue[]>((resolve) => {
          completions.push(resolve);
        }),
    );
    const validator: Validator = {
      compile: () => validate,
      compileGuard: () => () => true,
    };
    const { root, runtime } = createDispatchTree(
      { type: 'string' },
      undefined,
      validator,
    );
    dispatchMount(root, 'initial');
    const delivered: string[] = [];
    requestFieldNodeValidation(root, (issues) =>
      delivered.push(issues[0]?.message ?? 'valid'),
    );
    requestFieldNodeValidation(root, (issues) =>
      delivered.push(issues[0]?.message ?? 'valid'),
    );
    await new Promise<void>((resolve) => setImmediate(resolve));
    expect(validate).toHaveBeenCalledTimes(1);
    dispatchSetValue(root, 'latest');
    requestFieldNodeValidation(root, (issues) =>
      delivered.push(issues[0]?.message ?? 'valid'),
    );
    await new Promise<void>((resolve) => setImmediate(resolve));
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
    const validator: Validator = {
      compile: () => validate,
      compileGuard: () => () => true,
    };
    const { root, runtime } = createDispatchTree(
      { type: 'string' },
      undefined,
      validator,
    );
    runtime.validationMode = ValidationMode.None;
    dispatchMount(root, 'first');
    requestFieldNodeValidation(root, () => {
      throw new Error('None delivered');
    });
    await new Promise<void>((resolve) => setImmediate(resolve));
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
    const issues = [
      { dataPath: '', message: 'root' },
      { dataPath: '/name', message: 'child' },
    ];
    const validator: Validator = {
      compile: () => () => issues,
      compileGuard: () => () => true,
    };
    const { root, runtime } = createDispatchTree(
      { type: 'object', properties: { name: { type: 'string' } } },
      undefined,
      validator,
    );
    dispatchMount(root, { name: 'a' });
    expect(await dispatchValidate(root)).toBe(issues);
    expect(runtime.globalErrors).toBe(issues);
    expect(readFieldNodeErrors(root).map((issue) => issue.message)).toEqual([
      'root',
    ]);
    expect(
      readFieldNodeErrors(root.structure?.name ?? root).map(
        (issue) => issue.message,
      ),
    ).toEqual(['child']);
  });

  it('EVENT-046 delivers the latest result after the synchronous chain in its own wave', async () => {
    const validator: Validator = {
      compile: () => () => [{ dataPath: '', message: 'invalid' }],
      compileGuard: () => () => true,
    };
    const { root, runtime } = createDispatchTree(
      { type: 'string' },
      undefined,
      validator,
    );
    dispatchMount(root, 'initial');
    runtime.validationMode = ValidationMode.OnChange;
    const order: string[] = [];
    runtime.onChange = () => order.push('change');
    subscribeFieldNode(root, (event) => {
      if (event.type & FieldNodeEventType.UpdateGlobalError)
        order.push('validation');
    });
    dispatchSetValue(root, 'changed');
    expect(order).toEqual(['change']);
    await new Promise((resolve) => setImmediate(resolve));
    expect(order).toEqual(['change', 'validation']);
  });

  it('EVENT-046 ERROR-019 reports a result-wave listener failure once to the sink', async () => {
    const report = vi.fn();
    const sink = vi.spyOn(console, 'error').mockImplementation(() => undefined);
    try {
      const validator: Validator = {
        compile: () => () => [],
        compileGuard: () => () => true,
      };
      const { root, runtime } = createDispatchTree(
        { type: 'string' },
        undefined,
        validator,
        { hasConsumer: () => true, report },
      );
      dispatchMount(root, 'before');
      runtime.validationMode = ValidationMode.OnChange;
      const failure = new Error('result listener');
      subscribeFieldNode(root, (event) => {
        if (event.type & FieldNodeEventType.UpdateGlobalError) throw failure;
      });

      dispatchSetValue(root, 'after');
      await new Promise((resolve) => setImmediate(resolve));
      expect(report).toHaveBeenCalledTimes(1);
      expect(report.mock.calls[0][0]).toMatchObject({
        code: 'SCHEMA_FORM_ERROR.LISTENER_THREW',
        error: failure,
        surface: 'sink',
      });
      expect(sink).toHaveBeenCalledTimes(1);
    } finally {
      sink.mockRestore();
    }
  });

  it('WRITE-093 VALIDATE-051 passes the emitted union value by reference', async () => {
    const validate = vi.fn(() => null);
    const validator: Validator = {
      compile: () => validate,
      compileGuard: () => () => true,
    };
    const { root } = createDispatchTree(
      { type: ['object', 'string'] },
      undefined,
      validator,
    );
    dispatchMount(root, { nested: 'value' });
    await dispatchValidate(root);
    expect(validate).toHaveBeenCalledWith(root.emit);
  });

  it('18C-101 coalesces two scoped requests without losing either target', async () => {
    const issues = [
      { dataPath: '/a', message: 'A' },
      { dataPath: '/b', message: 'B' },
    ];
    const validate = vi.fn(() => issues);
    const validator: Validator = {
      compile: () => validate,
      compileGuard: () => () => true,
    };
    const { root, runtime } = createDispatchTree(
      {
        type: 'object',
        properties: {
          a: { type: 'string' },
          b: { type: 'string' },
        },
      },
      undefined,
      validator,
    );
    dispatchMount(root, { a: 'a', b: 'b' });
    runtime.validationMode = ValidationMode.OnRequest;
    const a = root.structure?.a ?? root;
    const b = root.structure?.b ?? root;
    requestFieldNodeValidation(a, () => undefined);
    requestFieldNodeValidation(b, () => undefined);
    await new Promise((resolve) => setImmediate(resolve));
    expect(validate).toHaveBeenCalledTimes(1);
    expect(readFieldNodeErrors(a).map((issue) => issue.message)).toEqual(['A']);
    expect(readFieldNodeErrors(b).map((issue) => issue.message)).toEqual(['B']);
  });

  it('VALIDATE-008 leaves the verdict absent when no validator is selected', async () => {
    const { root, runtime } = createDispatchTree(
      { type: 'string' },
      undefined,
      undefined,
    );
    dispatchMount(root, 'value');
    runtime.validationMode = ValidationMode.OnChange;
    const deliver = vi.fn();
    requestFieldNodeValidation(root, deliver);
    await new Promise((resolve) => setImmediate(resolve));
    expect(deliver).not.toHaveBeenCalled();
    expect(runtime.validationResult).toBeUndefined();
    expect(runtime.globalErrors).toBeUndefined();
  });
});
