import { arrayScenarios } from '@aileron/schema-form-scenarios';
import { describe, expect, it } from 'vitest';
import type { FormErrorRecord } from '../../../errors';

import { createCoreScenarioAdapter } from './utils/createCoreScenarioAdapter';
import { runScenario } from './utils/runScenario';

const scenario = arrayScenarios.find(({ name }) => name === 'array.source-b-structure');
if (!scenario) throw new Error('array.source-b-structure scenario is missing');

// filid:contract scenario-array-source-b
describe('array Source-B structure rollback', () => {
  it('58C-01 restores caller structure and reports its single budget occurrence', async () => {
    const adapter = createCoreScenarioAdapter(scenario);
    const records: FormErrorRecord[] = [];
    adapter.root.runtime.errorReporter = { hasConsumer: () => true,
      report: (record) => records.push(record) };
    expect(adapter.root.find('/items')).toBeNull();

    await runScenario(scenario, adapter);

    const host = adapter.root.find('/items');
    expect(host?.itemCount).toBe(0);
    expect(host?.children).toEqual([]);
    expect(host?.raw).toBeUndefined();
    expect(host?.extras).toBeUndefined();
    expect(host?.value).toEqual([]);
    expect(host?.outputValue).toBeUndefined();
    expect(host?.nextItemKey).toBeGreaterThan(0);
    expect(records.filter((record) => record.level === 'error')).toEqual([
      expect.objectContaining({ code: 'SCHEMA_FORM_ERROR.BUDGET_EXCEEDED', surface: 'thrown' }),
    ]);
  });
});
