import { expect, it } from 'vitest';

import { buildFieldNodeTree } from '../buildFieldNodeTree';
import { mountFieldNode } from '../mountFieldNode';
import { observeFieldNodeReports } from '../observeFieldNodeReports';

it('ERROR-113 rejects writes throughout nested report scopes and restores them afterwards', () => {
  const root = buildFieldNodeTree({
    jsonSchema: { type: 'string' },
    defaultValue: 'kept',
  });
  mountFieldNode(root);
  const refusal = expect.objectContaining({
    code: 'SCHEMA_FORM_ERROR.WRITE_IN_OBSERVER',
  });
  observeFieldNodeReports(root, () => {
    expect(() => root.setValue('outer')).toThrowError(refusal);
    observeFieldNodeReports(root, () => {
      expect(() => root.setValue('inner')).toThrowError(refusal);
    });
    expect(() => root.setValue('still outer')).toThrowError(refusal);
  });
  expect(root.value).toBe('kept');
  root.setValue('after');
  expect(root.value).toBe('after');
});

it('ERROR-113 restores the previous report scope when delivery throws', () => {
  const root = buildFieldNodeTree({ jsonSchema: { type: 'string' } });
  mountFieldNode(root);
  const failure = new Error('delivery');
  observeFieldNodeReports(root, () => {
    expect(() =>
      observeFieldNodeReports(root, () => {
        throw failure;
      }),
    ).toThrow(failure);
    expect(() => root.setState({ 1: true })).toThrowError(
      expect.objectContaining({ code: 'SCHEMA_FORM_ERROR.WRITE_IN_OBSERVER' }),
    );
  });
  expect(() =>
    observeFieldNodeReports(root, () => {
      throw failure;
    }),
  ).toThrow(failure);
  root.setValue('after');
  expect(root.value).toBe('after');
});

it('ERROR-113 retains the core reporter scope after a nested binding delivery', () => {
  let failures = 0;
  const root = buildFieldNodeTree({
    jsonSchema: { type: 'number' },
    validationMode: 0,
    errorReporter: {
      hasConsumer: () => true,
      report: () => {
        observeFieldNodeReports(root, () => {});
        expect(() => root.setValue(3)).toThrowError(
          expect.objectContaining({
            code: 'SCHEMA_FORM_ERROR.WRITE_IN_OBSERVER',
          }),
        );
        failures++;
      },
    },
  });
  mountFieldNode(root, 'invalid');
  expect(failures).toBe(1);
  expect(root.value).toBe('invalid');
  root.setValue(3);
  expect(root.value).toBe(3);
});
