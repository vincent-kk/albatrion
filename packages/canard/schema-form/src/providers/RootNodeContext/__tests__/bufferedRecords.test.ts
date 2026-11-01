import { expect, it, vi } from 'vitest';

import { type FieldNode, ValidationMode } from '@/schema-form/core';
import { FormErrorCode, type FormErrorRecord } from '@/schema-form/errors';

import type { FormErrorService } from '../../FormErrorContext';
import { createRootLoad } from '../utils/createRootLoad';
import { resetRootLoad } from '../utils/resetRootLoad';

it('IR-7 T3 a never-prepared replacement transfers its record origin and flushes once', () => {
  const roots: (FieldNode | undefined)[] = [];
  const reporter: FormErrorService = {
    load: 0,
    warningScope: {},
    reportInLoad: (record) => reporter.report(record),
    beginLoad: vi.fn(),
    capture: vi.fn(),
    hasConsumer: () => true,
    report: () => {
      roots.push(reporter.root);
    },
  };
  const first = createRootLoad(
    { jsonSchema: { type: 'string' }, validationMode: ValidationMode.None },
    reporter,
  );
  const record: FormErrorRecord = {
    level: 'error',
    origin: 'load',
    code: FormErrorCode.ValidatorThrew,
    message: 'first',
  };
  first.records.push(record);
  const second = resetRootLoad(
    first,
    { jsonSchema: { type: 'number' }, validationMode: ValidationMode.None },
    undefined,
    true,
  );
  expect(first.prepared).toBe(false);
  expect(second.prepared).toBe(true);
  expect(second.records).toEqual([]);
  expect(roots).toEqual([first.root]);
  expect(reporter.root).toBe(second.root);
});
