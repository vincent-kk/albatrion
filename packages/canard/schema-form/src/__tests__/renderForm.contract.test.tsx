import { cleanup } from '@testing-library/react';
import { findScenarioHandle, playScenario } from '@aileron/schema-form-scenarios';
import { afterEach, describe, expect, it } from 'vitest';

import { renderForm } from './renderForm';

describe('renderForm new-engine contract', () => {
  afterEach(cleanup);

  it('registers the current handle on the container and unregisters on unmount', async () => {
    const schema = { type: 'object', properties: { name: { type: 'string' } } } as const;
    const form = await renderForm(schema, { defaultValue: { name: 'initial' } });
    expect(findScenarioHandle(form.container).handle).toBe(form.handle);
    await playScenario({ name: 'reset through the DOM registration', schema, steps: [
      { action: 'setValue', path: '/name', value: 'edited', expect: { outputValue: { name: 'edited' } } },
      { action: 'reset', expect: { outputValue: { name: 'initial' }, values: { '/name': 'initial' } } },
    ] }, form.container);
    form.unmount();
    expect(() => findScenarioHandle(form.container)).toThrow();
  });

  it('settles an authored guard with root refs synchronously without a mount flush', async () => {
    const form = await renderForm({
      type: 'object',
      $defs: { selected: { const: 'yes' } },
      properties: { mode: { type: 'string', default: 'yes' } },
      if: { properties: { mode: { $ref: '#/$defs/selected' } }, required: ['mode'] },
      then: { properties: { detail: { type: 'string', default: 'ready' } } },
    }, { validator: true, flushOnMount: false });
    expect(form.getValue()).toEqual({ mode: 'yes', detail: 'ready' });
    expect(form.value('/detail')).toBe('ready');
    expect(form.changeLog()).toEqual([]);
  });

  it('observes Form errors separately from an ownerless handler failure', async () => {
    const failure = new Error('observer failed');
    const form = await renderForm({ type: 'invalid' } as never, {
      onError: () => { throw failure; },
    });
    expect(form.errorRecords().length).toBeGreaterThan(0);
    expect(form.sinkErrors()).toContain(failure);
  });
});
