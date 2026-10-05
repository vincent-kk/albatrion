import { flushSync } from 'react-dom';
import { act } from '@testing-library/react';
import { expect, it } from 'vitest';

import { SchemaNodeEventType } from '@/schema-form';
import { renderForm } from '../renderForm';

it('EVENT-024 keeps the fixed wave payload through React flushSync and resubscription', async () => {
  const form = await renderForm({ type: 'object', properties: {
    a: { type: 'string' }, b: { type: 'string' },
  } }, { defaultValue: { a: 'A', b: 'A' } });
  try {
    const a = form.node('/a')!, b = form.node('/b')!;
    const seen: unknown[] = [];
    let remove = () => {};
    a.subscribe(event => {
      if (!(event.type & SchemaNodeEventType.UpdateValue)) return;
      remove();
      b.subscribe(event => {
        if (event.type & SchemaNodeEventType.UpdateValue)
          seen.push(['late', event.payload?.[SchemaNodeEventType.UpdateValue]]);
      });
      flushSync(() => b.setValue('C'));
    });
    b.subscribe(event => {
      if (event.type & SchemaNodeEventType.UpdateValue)
        seen.push(['kept', event.payload?.[SchemaNodeEventType.UpdateValue]]);
    });
    remove = b.subscribe(() => seen.push('removed'));
    await act(async () => { form.handle.setValue({ a: 'B', b: 'B' }); });
    expect(seen).toEqual([
      ['kept', { previous: 'A', current: 'B' }],
      ['kept', { previous: 'B', current: 'C' }],
      ['late', { previous: 'B', current: 'C' }],
    ]);
    expect(form.handle.getValue()).toEqual({ a: 'B', b: 'C' });
  } finally { form.unmount(); }
});
