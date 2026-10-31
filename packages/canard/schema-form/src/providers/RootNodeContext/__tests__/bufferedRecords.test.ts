import { expect, it, vi } from 'vitest';

import { type FieldNode, ValidationMode } from '@/schema-form/core';
import { FormErrorCode, type FormErrorRecord } from '@/schema-form/errors';

import type { FormErrorService } from '../../FormErrorContext';
import { createRootLoad } from '../utils/createRootLoad';
import { reportBufferedRootRecord } from '../utils/reportBufferedRootRecord';
import { resetRootLoad } from '../utils/resetRootLoad';

it('IR-6 a twice-replaced hidden load delivers each report with its original root and restores the current root', () => {
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
  const secondRecord = { ...record, message: 'second' };
  second.records.push(secondRecord);
  const third = resetRootLoad(
    second,
    { jsonSchema: { type: 'boolean' }, validationMode: ValidationMode.None },
    undefined,
    true,
  );
  expect(third.records).toEqual([record, secondRecord]);
  expect(roots).toEqual([]);
  for (const report of third.records.splice(0))
    reportBufferedRootRecord(third, report);
  expect(roots).toEqual([first.root, second.root]);
  expect(reporter.root).toBe(third.root);
});
