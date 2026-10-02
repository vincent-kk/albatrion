import { act } from '@testing-library/react';
import { deriveScenarios, playScenario } from '@aileron/schema-form-scenarios';
import { describe, expect, it, vi } from 'vitest';

import { SchemaNodeEventType, type FormTypeInputProps, type JSONSchema } from '@/schema-form';

import { renderForm } from '../renderForm';

describe('LANDING-146 / LANDING-166 — committed reads and observer deliveries', () => {
  it('LANDING-146 batch parent reads stay committed while updater writes compose', async () => {
    const form = await renderForm({ type: 'object', properties: {
      count: { type: 'number' }, doubled: { type: 'number', controls: { derived: '../count * 2' } },
    } }, { defaultValue: { count: 1 } });
    const reads: unknown[] = [];
    try {
      await act(async () => {
        form.handle.node!.batch(() => {
          form.node('/count')!.setValue((value: unknown) => Number(value) + 1);
          reads.push(form.getValue(), form.node('/count')!.parentNode!.value);
          form.node('/count')!.setValue((value: unknown) => Number(value) + 1);
          reads.push(form.getValue());
        });
      });
      expect(reads).toEqual([{ count: 1, doubled: 2 }, { count: 1, doubled: 2 }, { count: 1, doubled: 2 }]);
      expect(form.getValue()).toEqual({ count: 3, doubled: 6 });
      expect([form.value('/count'), form.value('/doubled')]).toEqual(['3', '6']);
    } finally { form.unmount(); }
  });

  it('LANDING-166 parent reads and watch observe null after an automatic injection', async () => {
    const observed: unknown[] = [];
    let readParent: (() => unknown) | undefined;
    const parentReads: unknown[] = [];
    const Watch = ({ path, watchValues }: FormTypeInputProps) => {
      observed.push(watchValues);
      return <output id={path}>{JSON.stringify(watchValues)}</output>;
    };
    const form = await renderForm({ type: 'object', properties: {
      source: { type: 'string', controls: { injectTo: (value: unknown) => {
        if (readParent) parentReads.push(readParent());
        return { '../target/name': value };
      } } },
      target: { type: ['object', 'null'], properties: { name: { type: 'string' } } },
      observer: { type: 'string', controls: { watch: ['../target'] }, presentation: { FormTypeInput: Watch } },
    } }, { defaultValue: { source: 'A', target: null } });
    try {
      await act(async () => { form.node('/target')!.setValue(null); });
      expect(form.node('/target')!.outputValue).toBeNull();
      readParent = () => form.node('/target/name')!.parentNode!.outputValue;
      observed.length = 0;
      await form.type('/source', 'B');
      expect(parentReads.length).toBeGreaterThan(0);
      expect(parentReads.every((value) => value === null)).toBe(true);
      expect(form.node('/target')!.outputValue).toBeNull();
      expect(form.value('/target/name')).toBe('B');
      expect(form.container.querySelector('output')?.textContent).toBe('[null]');
    } finally { form.unmount(); }
  });

  it('LANDING-030 derive budget reports the committed fallback through onError', async () => {
    const scenario = deriveScenarios.find(({ name }) => name === 'derive.feedback-budget')!;
    const onError = vi.fn();
    const form = await renderForm(scenario.schema as JSONSchema, { defaultValue: scenario.initialValue, onError });
    try {
      await playScenario(scenario, form.container);
      expect(form.getValue()).toEqual({ active: true, a: 0, b: 1 });
      expect([form.value('/a'), form.value('/b')]).toEqual(['0', '1']);
      expect(onError.mock.calls.some(([record]) => record.code === 'SCHEMA_FORM_ERROR.BUDGET_EXCEEDED')).toBe(true);
    } finally { form.unmount(); }
  });

  it('VALUE-021 equal-content writes do not emit phantom UpdateValue or watch deliveries (P-25)', async () => {
    const form = await renderForm({ type: 'object', properties: {
      source: { type: 'object', properties: { name: { type: 'string' } } },
      observer: { type: 'string', controls: { watch: ['../source'] } },
    } }, { defaultValue: { source: { name: 'same' } } });
    const deliveries = vi.fn();
    const watches = vi.fn();
    const unsubscribeValue = form.node('/source')!.subscribe((event) => {
      if (event.type & SchemaNodeEventType.UpdateValue) deliveries(event);
    });
    const unsubscribeWatch = form.node('/observer')!.subscribe((event) => {
      if (event.type & SchemaNodeEventType.UpdateComputedProperties) watches(event);
    });
    try {
      await form.setValue({ source: { name: 'same' } });
      expect(form.getValue()).toEqual({ source: { name: 'same' } });
      expect(deliveries).not.toHaveBeenCalled();
      expect(watches).not.toHaveBeenCalled();
    } finally { unsubscribeValue(); unsubscribeWatch(); form.unmount(); }
  });
});
