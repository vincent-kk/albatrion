import type { FormScenario } from '../../types';

/** Three text fields written through the handle so every step is one public write or one batch. */
const syncSchema = {
  type: 'object',
  properties: { first: { type: 'string' }, second: { type: 'string' }, third: { type: 'string' } },
};

/** Writes notify synchronously in document order, an unchanged write notifies nothing, and a nested batch settles once. */
export const batchSyncScenario: FormScenario = {
  name: 'events.batch-sync',
  description: 'EVENT-002 a write settles and notifies synchronously; EVENT-005 delivery follows document order from the root down; EVENT-031 a write that leaves the emitted value unchanged sends no onChange and no validation request; EVENT-013 and EVENT-014 a nested batch belongs to the outermost one, which settles once and sends one onChange; a batch whose writes cancel out notifies nothing.',
  schema: syncSchema,
  initialValue: { first: 'old', second: 'old', third: 'old' },
  steps: [
    { action: 'setValue', path: '', value: { first: 'a', second: 'old', third: 'old' }, expect: {
      outputValue: { first: 'a', second: 'old', third: 'old' }, deliveryOrder: ['', '/first'], onChangeCount: 1, validationRequestCount: 1,
    } },
    { action: 'setValue', path: '', value: { first: 'a', second: 'old', third: 'old' }, expect: {
      deliveryOrder: [], onChangeCount: 0, validationRequestCount: 0,
    } },
    { action: 'batch', steps: [
      { action: 'setValue', path: '/third', value: 'c' },
      { action: 'batch', steps: [
        { action: 'setValue', path: '/second', value: 'b' },
        { action: 'setValue', path: '/first', value: 'z' },
      ] },
    ], expect: {
      outputValue: { first: 'z', second: 'b', third: 'c' }, deliveryOrder: ['', '/first', '/second', '/third'], onChangeCount: 1, validationRequestCount: 1,
    } },
    { action: 'batch', steps: [
      { action: 'setValue', path: '/second', value: 'x' },
      { action: 'setValue', path: '/second', value: 'b' },
    ], expect: { outputValue: { first: 'z', second: 'b', third: 'c' }, deliveryOrder: [], onChangeCount: 0, validationRequestCount: 0 } },
  ],
};
