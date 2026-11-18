import { expect, it } from 'vitest';

import { nodeFromJSONSchema } from '../../__tests__/fixtures/nodeFromJSONSchema';
import { FieldNodeEventType } from '../engine';
import { readFieldNodeRuntime } from '../../__tests__/helpers/readFieldNodeRuntime';

it('round-2 schema-form 3: writes before the first revision read keep round-1 observation eligibility', () => {
  const root = nodeFromJSONSchema({
    jsonSchema: { type: 'array', items: { type: 'string' } },
    defaultValue: ['before'],
  });
  const runtime = readFieldNodeRuntime(root);
  let record: typeof runtime.chainRoot;
  root.batch(() => {
    record = runtime.chainRoot;
  });
  if (!record) throw new Error('Expected active root record');
  const initial = record.revisionLedger[FieldNodeEventType.UpdateValue] ?? 0;
  expect(runtime.isRevisionObserved).not.toBe(true);

  root.setValue(['written']);
  expect(runtime.isRevisionObserved).not.toBe(true);
  expect(record.revisionLedger[FieldNodeEventType.UpdateValue]).toBe(initial + 1);

  const ledger = record.revisionLedger;
  expect(root.revision(FieldNodeEventType.UpdateValue)).toBe(initial + 1);
  expect(runtime.isRevisionObserved).toBe(true);
  expect(record.revisionLedger).toBe(ledger);

  root.setValue(['observed']);
  expect(root.revision(FieldNodeEventType.UpdateValue)).toBe(initial + 2);
});
