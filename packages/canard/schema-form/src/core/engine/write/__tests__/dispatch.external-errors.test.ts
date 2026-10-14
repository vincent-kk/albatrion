import { describe, expect, it, vi } from 'vitest';

import { createDispatchTree } from '@/schema-form/core/engine/__tests__/fixtures/createDispatchTree';
import { FieldNodeEventType } from '@/schema-form/core/engine/record';
import { ValidationMode } from '@/schema-form/core/engine/types/state';
import type { ValidationIssue } from '@/schema-form/core/engine/validation';

import { dispatchBatch } from '../utils/entry/dispatchBatch';
import { dispatchClearExternalErrors } from '../utils/entry/dispatchClearExternalErrors';
import { dispatchSetExternalErrors } from '../utils/entry/dispatchSetExternalErrors';
import { readFieldNodeRevision } from '../utils/read/readFieldNodeRevision';
import { subscribeFieldNode } from '../utils/read/subscribeFieldNode';

describe('dispatcher external errors', () => {
  it('EVENT-045 stores errors in the runtime map and delivers synchronously', () => {
    const { root, runtime } = createDispatchTree({ type: 'string' });
    const issues: readonly ValidationIssue[] = [
      { dataPath: '', message: 'server' },
    ];
    const seen: number[] = [];
    const onChange = vi.fn();
    runtime.onChange = onChange;
    runtime.validationMode = ValidationMode.OnChange;
    subscribeFieldNode(root, (event) => seen.push(event.type));
    const before = runtime.commitNumber;
    const validationStamp = runtime.validationStamp;

    dispatchSetExternalErrors(root, issues);

    expect(runtime.nodeErrors?.get(root)).toBe(issues);
    expect(seen).toEqual([
      FieldNodeEventType.UpdateError | FieldNodeEventType.UpdateGlobalError,
    ]);
    expect(readFieldNodeRevision(root, FieldNodeEventType.UpdateError)).toBe(1);
    expect(root.raw).toBeUndefined();
    expect(root.emit).toBeUndefined();
    expect(runtime.commitNumber).toBe(before);
    expect(onChange).not.toHaveBeenCalled();
    expect(runtime.validationStamp).toBe(validationStamp);
    dispatchClearExternalErrors(root);
    expect(runtime.nodeErrors?.has(root) ?? false).toBe(false);
    expect(seen).toEqual([
      FieldNodeEventType.UpdateError | FieldNodeEventType.UpdateGlobalError,
      FieldNodeEventType.UpdateError | FieldNodeEventType.UpdateGlobalError,
    ]);
  });

  it('EVENT-067 31C-01 merges error updates inside one entry', () => {
    const { root, runtime } = createDispatchTree({ type: 'string' });
    const seen: number[] = [];
    subscribeFieldNode(root, (event) => seen.push(event.type));
    dispatchBatch(root, () => {
      dispatchSetExternalErrors(root, [{ dataPath: '', message: 'first' }]);
      dispatchSetExternalErrors(root, [{ dataPath: '', message: 'last' }]);
      expect(seen).toEqual([]);
    });
    expect(seen).toEqual([
      FieldNodeEventType.UpdateError | FieldNodeEventType.UpdateGlobalError,
    ]);
    expect(runtime.nodeErrors?.get(root)).toEqual([
      { dataPath: '', message: 'last' },
    ]);
  });

  it('NODE-044 ignores external errors on a detached occurrence', () => {
    const { root, runtime } = createDispatchTree({ type: 'string' });
    root.detached = true;
    dispatchSetExternalErrors(root, [{ dataPath: '', message: 'ignored' }]);
    dispatchClearExternalErrors(root);
    expect(runtime.nodeErrors?.has(root) ?? false).toBe(false);
    expect(readFieldNodeRevision(root, FieldNodeEventType.UpdateError)).toBe(0);
  });

  it('ERROR-029 refuses external errors during error delivery', () => {
    const { root, runtime } = createDispatchTree({ type: 'string' });
    runtime.reportingErrors = true;
    expect(() =>
      dispatchSetExternalErrors(root, [{ dataPath: '' }]),
    ).toThrowError(
      expect.objectContaining({ code: 'SCHEMA_FORM_ERROR.WRITE_IN_OBSERVER' }),
    );
    expect(() => dispatchClearExternalErrors(root)).toThrowError(
      expect.objectContaining({ code: 'SCHEMA_FORM_ERROR.WRITE_IN_OBSERVER' }),
    );
    expect(runtime.nodeErrors?.has(root)).toBeFalsy();
  });
});
