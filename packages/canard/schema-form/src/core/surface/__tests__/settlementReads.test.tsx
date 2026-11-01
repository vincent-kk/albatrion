import { createRef } from 'react';

import { act, cleanup, render } from '@testing-library/react';
import { afterEach, expect, it, vi } from 'vitest';

import { Form, type FormHandle } from '@/schema-form/components/Form';
import { ValidationMode } from '@/schema-form/core/engine';

afterEach(cleanup);

it('D6 reads a complete before-or-after defaultValue epoch during array removal and resetSubtree', () => {
  const ref = createRef<FormHandle>();
  const removalView = render(
    <Form
      ref={ref}
      validationMode={ValidationMode.None}
      jsonSchema={{
        type: 'object',
        properties: {
          rows: {
            type: 'array',
            items: {
              type: 'object',
              properties: {
                on: { type: 'boolean' },
                note: {
                  type: 'string',
                  controls: { active: '../../0/on === true' },
                },
              },
            },
          },
        },
      }}
      defaultValue={{
        rows: [
          { on: true, note: 'n0' },
          { on: false, note: 'n1' },
        ],
      }}
    >
      <span />
    </Form>,
  );
  const root = ref.current!.node!;
  const rows = root.find('/rows')!;
  if (rows.type !== 'array') throw new Error('Expected array');
  const moved = root.find('/rows/1/note')!;
  const beforeRemove = [root.defaultValue, moved.defaultValue];
  const removalReads = vi.fn(() => [root.defaultValue, moved.defaultValue]);
  moved.onInactive(() => {
    removalReads();
    return undefined;
  });
  act(() => rows.remove(0));
  expect(removalReads).toHaveBeenCalledOnce();
  const afterRemove = [root.defaultValue, moved.defaultValue];
  expect
    .soft([beforeRemove, afterRemove])
    .toContainEqual(removalReads.mock.results[0].value);

  removalView.unmount();
  const resetRef = createRef<FormHandle>();
  render(
    <Form
      ref={resetRef}
      validationMode={ValidationMode.None}
      jsonSchema={{
        type: 'object',
        properties: {
          rows: { type: 'array', items: { type: 'string' } },
          note: {
            type: 'string',
            controls: { active: '../rows/0 === "live"' },
          },
        },
      }}
      defaultValue={{ rows: [], note: 'loaded' }}
    >
      <span />
    </Form>,
  );
  const resetRoot = resetRef.current!.node!;
  const resetRows = resetRoot.find('/rows')!;
  act(() => resetRows.setValue(['live']));
  const departing = resetRoot.find('/note')!;
  const beforeReset = [resetRoot.defaultValue, departing.defaultValue];
  const resetReads = vi.fn(() => [
    resetRoot.defaultValue,
    departing.defaultValue,
  ]);
  departing.onInactive(() => {
    resetReads();
    return undefined;
  });
  act(() => resetRows.resetSubtree());
  expect(resetReads).toHaveBeenCalledOnce();
  const afterReset = [resetRoot.defaultValue, departing.defaultValue];
  expect([beforeReset, afterReset]).toContainEqual(
    resetReads.mock.results[0].value,
  );
});

it('D7 reads a complete before-or-after watchValues epoch during a oneOf branch switch', () => {
  const ref = createRef<FormHandle>();
  render(
    <Form
      ref={ref}
      validationMode={ValidationMode.None}
      jsonSchema={{
        type: 'object',
        properties: {
          kind: { type: 'string' },
          watcher: {
            type: 'string',
            controls: { watch: ['../kind', '../leaving', '../arriving'] },
          },
        },
        oneOf: [
          {
            controls: { active: './kind === "s"' },
            properties: { leaving: { type: 'string' } },
          },
          {
            controls: { active: './kind === "n"' },
            properties: { arriving: { type: 'number' } },
          },
        ],
      }}
      defaultValue={{ kind: 's', leaving: 'before' }}
    >
      <span />
    </Form>,
  );
  const root = ref.current!.node!;
  const watcher = root.find('/watcher')!;
  const before = watcher.watchValues;
  expect(before).toEqual(['s', 'before', undefined]);
  const reads = vi.fn(() => watcher.watchValues);
  root.find('/leaving')!.onInactive(() => {
    reads();
    return undefined;
  });
  act(() => root.setValue({ kind: 'n', arriving: 42 }));
  const after = watcher.watchValues;
  expect(after).toEqual(['n', undefined, 42]);
  expect(reads).toHaveBeenCalledOnce();
  expect([before, after]).toContainEqual(reads.mock.results[0].value);
});
