import { describe, expect, it, vi } from 'vitest';

import { createDispatchTree } from '@/schema-form/core/engine/__tests__/fixtures/createDispatchTree';
import { ValidationMode } from '@/schema-form/core/engine/types/state';
import {
  dispatchMount,
  dispatchResetSubtree,
  dispatchSetValue,
  dispatchValidate,
} from '@/schema-form/core/engine/write';
import { FormErrorCode } from '@/schema-form/errors';

import type { Validator } from '../types/validator';
import { readFieldNodeErrors } from '../utils/read/readFieldNodeErrors';

// filid:contract validation-lifetime
describe('validator failures', () => {
  it('WRITE-099 ERROR-039 31C-03 reports an unvalidatable load once and resetSubtree does not clear it', async () => {
    const sink = vi.spyOn(console, 'error').mockImplementation(() => undefined);
    try {
      const compile = vi.fn(() => {
        throw new Error('compiler failed');
      });
      const report = vi.fn();
      const validator: Validator = { compile, compileGuard: () => () => true };
      const { root, runtime } = createDispatchTree(
        { type: 'object', properties: { child: { type: 'string' } } },
        undefined,
        validator,
        { hasConsumer: () => true, report },
      );
      runtime.validationMode = ValidationMode.OnChange;
      dispatchMount(root, { child: 'a' });
      await new Promise((resolve) => setImmediate(resolve));
      expect(report).toHaveBeenCalledTimes(1);
      expect(sink).toHaveBeenCalledTimes(1);
      expect(report.mock.calls[0][0].code).toBe(
        FormErrorCode.ValidatorCompileFailed,
      );
      expect(readFieldNodeErrors(root)).toEqual([]);
      expect(readFieldNodeErrors(root.structure?.child ?? root)).toEqual([]);
      dispatchResetSubtree(root.structure?.child ?? root);
      await new Promise((resolve) => setImmediate(resolve));
      expect(report).toHaveBeenCalledTimes(1);
      expect(compile).toHaveBeenCalledTimes(1);
    } finally {
      sink.mockRestore();
    }
  });

  it('ERROR-019 VALIDATE-042 rejects explicit validate when the validator throws', async () => {
    const order: string[] = [];
    const report = vi.fn((_record: unknown) => {
      order.push('report');
    });
    const validator: Validator = {
      compile: () => () => {
        throw new Error('runtime failed');
      },
      compileGuard: () => () => true,
    };
    const { root } = createDispatchTree(
      { type: 'string' },
      undefined,
      validator,
      { hasConsumer: () => true, report },
    );
    dispatchMount(root, 'a');
    await expect(
      dispatchValidate(root).catch((error: unknown) => {
        order.push('reject');
        throw error;
      }),
    ).rejects.toMatchObject({
      code: FormErrorCode.ValidatorThrew,
    });
    expect(order).toEqual(['report', 'reject']);
    expect(report).toHaveBeenCalledTimes(1);
    expect(report.mock.calls[0][0]).toMatchObject({
      code: FormErrorCode.ValidatorThrew,
      surface: 'rejected',
    });
    expect(readFieldNodeErrors(root)).toEqual([]);
  });

  it('VALIDATE-048 compile failure preserves the original error in details', async () => {
    const failure = new Error('bad schema');
    const validator: Validator = {
      compile: () => {
        throw failure;
      },
      compileGuard: () => () => true,
    };
    const { root } = createDispatchTree(
      { type: 'string' },
      undefined,
      validator,
    );
    await expect(dispatchValidate(root)).rejects.toEqual(
      expect.objectContaining({
        details: expect.objectContaining({ error: failure }),
      }),
    );
  });

  it('VALIDATE-045 reports explicit compile failure once in one form load', async () => {
    const report = vi.fn();
    const validator: Validator = {
      compile: () => {
        throw new Error('bad schema');
      },
      compileGuard: () => () => true,
    };
    const { root } = createDispatchTree(
      { type: 'string' },
      undefined,
      validator,
      { hasConsumer: () => true, report },
    );
    await expect(dispatchValidate(root)).rejects.toMatchObject({
      code: FormErrorCode.ValidatorCompileFailed,
    });
    expect(report.mock.calls[0][0]).toMatchObject({
      code: FormErrorCode.ValidatorCompileFailed,
      surface: 'rejected',
    });
    await expect(dispatchValidate(root)).rejects.toMatchObject({
      code: FormErrorCode.ValidatorCompileFailed,
    });
    expect(report).toHaveBeenCalledTimes(1);
  });

  it('ERROR-039 reports an OnChange throw once before its ownerless sink', async () => {
    const report = vi.fn();
    const sink = vi.spyOn(console, 'error').mockImplementation(() => undefined);
    try {
      const validator: Validator = {
        compile: () => () => {
          throw new Error('boom');
        },
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
      dispatchResetSubtree(root);
      await new Promise((resolve) => setImmediate(resolve));
      expect(report).toHaveBeenCalledTimes(1);
      expect(sink).toHaveBeenCalledTimes(1);
    } finally {
      sink.mockRestore();
    }
  });

  it('WRITE-099 rejects writes made by the asynchronous validation error observer', async () => {
    const sink = vi.spyOn(console, 'error').mockImplementation(() => undefined);
    try {
      const validator: Validator = {
        compile: () => () => {
          throw new Error('boom');
        },
        compileGuard: () => () => true,
      };
      let write: () => void = () => undefined;
      const refused: unknown[] = [];
      const { root, runtime } = createDispatchTree(
        { type: 'string' },
        undefined,
        validator,
        {
          hasConsumer: () => true,
          report: () => {
            try {
              write();
            } catch (error) {
              refused.push(error);
            }
          },
        },
      );
      write = () => dispatchSetValue(root, 'forbidden');
      dispatchMount(root, 'before');
      runtime.validationMode = ValidationMode.OnChange;
      dispatchResetSubtree(root);
      await new Promise((resolve) => setImmediate(resolve));
      expect(refused[0]).toMatchObject({
        code: 'SCHEMA_FORM_ERROR.WRITE_IN_OBSERVER',
      });
      expect(root.emit).toBe('before');
    } finally {
      sink.mockRestore();
    }
  });
});
