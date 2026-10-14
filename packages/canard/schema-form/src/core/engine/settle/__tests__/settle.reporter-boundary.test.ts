import { afterEach, expect, it, vi } from 'vitest';

import { ValidationMode } from '@/schema-form/core/engine/types/state';
import { WriteOption } from '@/schema-form/core/engine/types/value';

import { createTestTree } from '../../__tests__/fixtures/createTestTree';
import { loadFieldNodeAtMount } from '../utils/load/loadFieldNodeAtMount';

afterEach(() => vi.restoreAllMocks());

it('ERROR-019 retains missing-validator warnings without exposing intermediate state', () => {
  const { root } = createTestTree({
    type: 'object',
    properties: {
      value: { type: 'string', default: 'ready' },
    },
    if: { required: ['value'] },
    then: {
      properties: {
        conditional: { type: 'string' },
      },
    },
  });
  root.runtime.validator = undefined;
  root.runtime.validationMode = ValidationMode.OnChange;
  const observed: unknown[] = [];
  const report = vi.fn(() =>
    observed.push({
      value: root.local,
      commit: root.runtime.commitNumber,
      initialized: root.deliveryInitialized,
    }),
  );
  root.runtime.errorReporter = { hasConsumer: () => true, report };
  loadFieldNodeAtMount(root, undefined, WriteOption.Overwrite);
  expect(report).not.toHaveBeenCalled();
  expect(observed).toEqual([]);
  expect(root.local).toEqual({ value: 'ready' });
  expect(root.runtime.commitNumber).toBe(1);
  expect(
    [...(root.runtime.pendingWarningRecords?.values() ?? [])].map(
      (record) => record.code,
    ),
  ).toEqual([
    'SCHEMA_FORM_WARNING.VALIDATOR_MISSING',
    'SCHEMA_FORM_WARNING.CONDITIONAL_SCHEMA_WITHOUT_VALIDATOR',
  ]);
});

it('ERROR-019 retains non-JSON whole-value warnings until the owning chain delivers', () => {
  const { root } = createTestTree({ type: 'object' }, undefined, {
    isTerminal: () => true,
  });
  const warning = vi.spyOn(console, 'warn').mockImplementation(() => undefined);
  const value = { callback: () => undefined };
  loadFieldNodeAtMount(root, value, WriteOption.Overwrite);
  expect(warning).not.toHaveBeenCalled();
  expect(root.runtime.commitNumber).toBe(1);
  expect(
    [...(root.runtime.pendingWarningRecords?.values() ?? [])].map(
      (record) => record.code,
    ),
  ).toEqual(['SCHEMA_FORM_WARNING.NON_JSON_WHOLE_VALUE']);
});
