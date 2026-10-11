import { describe, expect, it, vi } from 'vitest';

import {
  SchemaNodeEventType,
  ValidationMode,
  isUnionNode,
  nodeFromJSONSchema,
} from '../index';

describe('70C-01 core host entry', () => {
  it.each([
    { deferMountValidation: undefined, calls: 1 },
    { deferMountValidation: true, calls: 0 },
  ])(
    '70C-01 mount validation defer=$deferMountValidation',
    async ({ deferMountValidation, calls }) => {
      const validate = vi.fn(() => null);
      nodeFromJSONSchema({
        jsonSchema: { type: 'string' },
        defaultValue: 'ready',
        validationMode: ValidationMode.OnChange,
        validator: { compile: () => validate, compileGuard: () => () => true },
        deferMountValidation,
      });
      await new Promise((resolve) => setTimeout(resolve, 0));
      expect(validate).toHaveBeenCalledTimes(calls);
    },
  );

  it('builds and mounts through the binding channels with an optional callback', () => {
    const root = nodeFromJSONSchema({
      jsonSchema: { type: 'number' },
      defaultValue: 42,
    });
    expect(root.value).toBe(42);
    expect(root.outputValue).toBe(42);
    expect(root.type).toBe('number');
  });

  it('NODE-058 mounts a union root through the public core entry', () => {
    const root = nodeFromJSONSchema({
      jsonSchema: { type: ['string', 'number'] as const },
      defaultValue: 'ready',
    });
    expect(isUnionNode(root)).toBe(true);
    expect(root.value).toBe('ready');
  });

  it('SURFACE-059 retains validation mode values', () => {
    expect([
      ValidationMode.None,
      ValidationMode.OnChange,
      ValidationMode.OnRequest,
    ]).toEqual([0, 1, 2]);
  });

  it('SURFACE-059 retains the six public event bits', () => {
    expect([
      SchemaNodeEventType.UpdateValue,
      SchemaNodeEventType.UpdateState,
      SchemaNodeEventType.UpdateError,
      SchemaNodeEventType.RequestFocus,
      SchemaNodeEventType.RequestSelect,
      SchemaNodeEventType.RequestRemount,
    ]).toEqual([4, 8, 32, 2048, 4096, 16384]);
  });
});
