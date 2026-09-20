import '@testing-library/jest-dom';
import { describe, expect, it } from 'vitest';

import type { JSONSchema } from '@/schema-form/types';

import { renderForm } from '../renderForm';

/**
 * S2 (ObjectNode DETAIL): `computed.derived` defines a field's content and
 * never brings a null object into existence; `injectTo` is a write and inherits
 * the provenance of the write that caused it. One form states the same relation
 * — total = quantity * 10 — both ways, so the two outcomes sit side by side.
 */
describe('nullable.object-write-provenance.render — derived defines, injectTo writes', () => {
  const sameRelationBothWays = {
    type: 'object',
    properties: {
      quantity: {
        type: 'number',
        default: 2,
        injectTo: (value: number | undefined) => ({
          '../pushed/total': (value || 0) * 10,
        }),
      },
      pulled: {
        type: ['object', 'null'],
        properties: {
          total: {
            type: 'number',
            computed: { derived: '(../../quantity || 0) * 10' },
          },
        },
      },
      pushed: {
        type: ['object', 'null'],
        properties: { total: { type: 'number' } },
      },
    },
  } satisfies JSONSchema;

  /** Mounts the form with both objects seeded null. */
  const mountBothNull = async () => {
    const form = await renderForm(sameRelationBothWays, {
      defaultValue: { pulled: null, pushed: null },
    });
    await form.flush(20);
    return form;
  };

  it('keeps both objects null after mount, where only the schema default drives them', async () => {
    const form = await mountBothNull();

    expect(form.getValue()).toEqual({
      quantity: 2,
      pulled: null,
      pushed: null,
    });
    expect(form.value('/pulled/total')).toBe('20');
  });

  it('creates only the injected object when the user edits the dependency', async () => {
    const form = await mountBothNull();
    await form.clear('/quantity');
    await form.type('/quantity', '5');
    await form.flush(20);

    expect(form.value('/pulled/total')).toBe('50');
    expect(form.value('/pushed/total')).toBe('50');
    expect(form.getValue()).toEqual({
      quantity: 5,
      pulled: null,
      pushed: { total: 50 },
    });
  });
});
