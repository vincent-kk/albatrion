import { expect, it } from 'vitest';

import { buildSchemaNodeTree } from '../buildSchemaNodeTree';
import { mountSchemaNode } from '../mountSchemaNode';
import { observeSchemaNodeReports } from '../observeSchemaNodeReports';

it('ERROR-113 rejects writes throughout nested report scopes and restores them afterwards', () => {
  const root = buildSchemaNodeTree({ jsonSchema: { type: 'string' }, defaultValue: 'kept' });
  mountSchemaNode(root);
  const refusal = expect.objectContaining({ code: 'SCHEMA_FORM_ERROR.WRITE_IN_OBSERVER' });
  observeSchemaNodeReports(root, () => {
    expect(() => root.setValue('outer')).toThrowError(refusal);
    observeSchemaNodeReports(root, () => {
      expect(() => root.setValue('inner')).toThrowError(refusal);
    });
    expect(() => root.setValue('still outer')).toThrowError(refusal);
  });
  expect(root.value).toBe('kept');
  root.setValue('after');
  expect(root.value).toBe('after');
});

it('ERROR-113 restores the previous report scope when delivery throws', () => {
  const root = buildSchemaNodeTree({ jsonSchema: { type: 'string' } });
  mountSchemaNode(root);
  const failure = new Error('delivery');
  observeSchemaNodeReports(root, () => {
    expect(() => observeSchemaNodeReports(root, () => { throw failure; })).toThrow(failure);
    expect(() => root.setState({ 1: true })).toThrowError(
      expect.objectContaining({ code: 'SCHEMA_FORM_ERROR.WRITE_IN_OBSERVER' }));
  });
  expect(() => observeSchemaNodeReports(root, () => { throw failure; })).toThrow(failure);
  root.setValue('after');
  expect(root.value).toBe('after');
});

it('ERROR-113 retains the core reporter scope after a nested binding delivery', () => {
  let failures = 0;
  const root = buildSchemaNodeTree({
    jsonSchema: { type: 'number' },
    validationMode: 0,
    errorReporter: {
      hasConsumer: () => true,
      report: () => {
        observeSchemaNodeReports(root, () => {});
        expect(() => root.setValue(3)).toThrowError(
          expect.objectContaining({ code: 'SCHEMA_FORM_ERROR.WRITE_IN_OBSERVER' }));
        failures++;
      },
    },
  });
  mountSchemaNode(root, 'invalid');
  expect(failures).toBe(1);
  expect(root.value).toBe('invalid');
  root.setValue(3);
  expect(root.value).toBe(3);
});
