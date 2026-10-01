import { describe, expect, it, vi } from 'vitest';

import { SchemaNodeEventType } from '../../record';
import { ValidationMode } from '../../types/state';
import type { ValidationIssue } from '../../validation';
import { dispatchBatch, dispatchClearExternalErrors, dispatchSetExternalErrors,
  readSchemaNodeRevision, subscribeSchemaNode } from '../index';
import { createDispatchTree } from './fixtures/createDispatchTree';

describe('dispatcher external errors', () => {
  it('EVENT-045 stores errors in the runtime map and delivers synchronously', () => {
    const { root, runtime } = createDispatchTree({ type: 'string' });
    const issues: readonly ValidationIssue[] = [{ dataPath: '', message: 'server' }];
    const seen: number[] = [];
    const onChange = vi.fn();
    const requestValidation = vi.fn();
    runtime.onChange = onChange;
    runtime.requestValidation = requestValidation;
    runtime.validationMode = ValidationMode.OnChange;
    subscribeSchemaNode(root, (event) => seen.push(event.type));
    const before = runtime.commitNumber;

    dispatchSetExternalErrors(root, issues);

    expect(runtime.nodeErrors?.get(root)).toBe(issues);
    expect(seen).toEqual([SchemaNodeEventType.UpdateError]);
    expect(readSchemaNodeRevision(root, SchemaNodeEventType.UpdateError)).toBe(1);
    expect(root.raw).toBeUndefined();
    expect(root.emit).toBeUndefined();
    expect(runtime.commitNumber).toBe(before);
    expect(onChange).not.toHaveBeenCalled();
    expect(requestValidation).not.toHaveBeenCalled();
    dispatchClearExternalErrors(root);
    expect(runtime.nodeErrors?.has(root) ?? false).toBe(false);
    expect(seen).toEqual([SchemaNodeEventType.UpdateError,
      SchemaNodeEventType.UpdateError]);
  });

  it('EVENT-067 31C-01 merges error updates inside one entry', () => {
    const { root, runtime } = createDispatchTree({ type: 'string' });
    const seen: number[] = [];
    subscribeSchemaNode(root, (event) => seen.push(event.type));
    dispatchBatch(root, () => {
      dispatchSetExternalErrors(root, [{ dataPath: '', message: 'first' }]);
      dispatchSetExternalErrors(root, [{ dataPath: '', message: 'last' }]);
      expect(seen).toEqual([]);
    });
    expect(seen).toEqual([SchemaNodeEventType.UpdateError]);
    expect(runtime.nodeErrors?.get(root)).toEqual([{ dataPath: '', message: 'last' }]);
  });

  it('NODE-044 ignores external errors on a detached occurrence', () => {
    const { root, runtime } = createDispatchTree({ type: 'string' });
    root.detached = true;
    dispatchSetExternalErrors(root, [{ dataPath: '', message: 'ignored' }]);
    dispatchClearExternalErrors(root);
    expect(runtime.nodeErrors?.has(root) ?? false).toBe(false);
    expect(readSchemaNodeRevision(root, SchemaNodeEventType.UpdateError)).toBe(0);
  });

  it('ERROR-029 refuses external errors during error delivery', () => {
    const { root, runtime } = createDispatchTree({ type: 'string' });
    runtime.reportingErrors = true;
    expect(() => dispatchSetExternalErrors(root, [{ dataPath: '' }]))
      .toThrowError(expect.objectContaining({ code: 'SCHEMA_FORM_ERROR.WRITE_IN_OBSERVER' }));
    expect(() => dispatchClearExternalErrors(root))
      .toThrowError(expect.objectContaining({ code: 'SCHEMA_FORM_ERROR.WRITE_IN_OBSERVER' }));
    expect(runtime.nodeErrors?.has(root)).toBeFalsy();
  });
});
