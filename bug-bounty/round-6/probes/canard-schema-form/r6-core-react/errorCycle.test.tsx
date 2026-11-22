// Loaded by Vitest render/react18 projects; probes the retry of a failed field boundary when the parent re-renders from onError.
import { act, cleanup, render } from '@testing-library/react';
import * as React from 'react';
import { afterEach, expect, it, vi } from 'vitest';

import { Form, ValidationMode } from '../../index';

afterEach(cleanup);

const schema = {
  type: 'object',
  properties: { a: { type: 'string' }, b: { type: 'string' } },
} as const;

const BrokenInput = () => {
  throw new Error('broken input');
};

const BrokenRenderer = ({ Input, path }: any) => {
  if (path === '/a') throw new Error('broken renderer');
  return <Input />;
};

function setup(inline: 'formatError' | 'none', maxRenders = 200, failing: 'input' | 'renderer' = 'input') {
  let renders = 0;
  const records: unknown[] = [];
  const formatError = (error: any) => error.message;
  const App = () => {
    const [, setCount] = React.useState(0);
    renders++;
    if (renders > maxRenders) throw new Error('render loop');
    return (
      <Form
        jsonSchema={schema}
        validationMode={ValidationMode.None}
        fieldInputMap={failing === 'input' ? { '/a': BrokenInput as any } : undefined}
        FieldRenderer={failing === 'renderer' ? BrokenRenderer : undefined}
        formatError={inline === 'formatError' ? (error: any) => error.message : formatError}
        onError={(record) => {
          records.push(record);
          setCount((count) => count + 1);
        }}
      />
    );
  };
  return {
    App,
    read: () => ({ renders, records: records.length }),
    kinds: () => [...new Set(records.map((r: any) => (r.code ?? '') + ':' + String(r.cause?.message ?? r.error?.message ?? r.message ?? '')))],
  };
}

it('control: a stable formatError and an onError that stores records render a bounded number of times', async () => {
  vi.spyOn(console, 'error').mockImplementation(() => {});
  const { App, read } = setup('none');
  let failure: unknown;
  try {
    await act(async () => {
      render(<App />);
      await new Promise((r) => setTimeout(r, 50));
    });
  } catch (error) {
    failure = error;
  }
  expect({ failure: failure && String(failure), bounded: read().renders < 10 }).toEqual({
    failure: undefined,
    bounded: true,
  });
});

it('an inline formatError and an onError that stores records render a bounded number of times', async () => {
  vi.spyOn(console, 'error').mockImplementation(() => {});
  const { App, read } = setup('formatError');
  let failure: unknown;
  try {
    await act(async () => {
      render(<App />);
      await new Promise((r) => setTimeout(r, 50));
    });
  } catch (error) {
    failure = error;
  }
  const { renders, records } = read();
  expect({ failure: failure && String(failure), bounded: renders < 10, renders, records }).toMatchObject({
    failure: undefined,
    bounded: true,
  });
});

for (const inline of ['none', 'formatError'] as const)
  it(`a throwing FieldRenderer with ${inline === 'none' ? 'a stable' : 'an inline'} formatError and an onError that stores records renders a bounded number of times`, async () => {
    vi.spyOn(console, 'error').mockImplementation(() => {});
    const { App, read } = setup(inline, 200, 'renderer');
    let failure: unknown;
    try {
      await act(async () => {
        render(<App />);
        await new Promise((r) => setTimeout(r, 50));
      });
    } catch (error) {
      failure = error;
    }
    const { renders, records } = read();
    expect({ failure: failure && String(failure), records, rendersBounded: renders <= 3 }).toEqual({
      failure: undefined,
      records: 1,
      rendersBounded: true,
    });
  });

it('measurement: one renderer failure under an inline formatError yields about 27 onError records (stable across 400 ms)', async () => {
  vi.spyOn(console, 'error').mockImplementation(() => {});
  const { App, read, kinds } = setup('formatError', 1e9, 'renderer');
  const samples: { renders: number; records: number }[] = [];
  await act(async () => {
    render(<App />);
    await new Promise((r) => setTimeout(r, 50));
  });
  samples.push(read());
  await act(async () => {
    await new Promise((r) => setTimeout(r, 400));
  });
  samples.push(read());
  const summary = { samples, kinds: kinds(), dom: document.body.textContent };
  (await import('node:fs')).writeFileSync((await import('node:os')).tmpdir() + '/r6-core-react-errorCycle.json', JSON.stringify(summary, null, 1));
  expect(samples[1].records).toBeLessThanOrEqual(1);
});
