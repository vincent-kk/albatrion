import { createRef } from 'react';

import { act } from '@testing-library/react';
import { createRoot } from 'react-dom/client';
import { afterEach, describe, expect, it } from 'vitest';

import {
  Form,
  type FormHandle,
  type JSONSchema,
  ValidationMode,
} from '../../index';

// Probe for r5-ids: IN2 and IN3, two independent client-rendered React roots on one page.
// Verification level: public API (package source). Runs in render (React 19) and react18.

const schema: JSONSchema = {
  type: 'object',
  properties: {
    agree: { type: 'boolean' },
    plan: {
      type: 'string',
      enum: ['free', 'pro'],
      presentation: { inputType: 'radio' },
    },
  },
};

const cleanups: (() => Promise<void>)[] = [];
afterEach(async () => {
  for (const cleanup of cleanups.splice(0)) await cleanup();
});

/** Mount one Form in its own client root, as a micro-frontend or widget does. */
const mountRoot = async (identifierPrefix?: string) => {
  const host = document.createElement('div');
  document.body.append(host);
  const root = createRoot(
    host,
    identifierPrefix === undefined ? undefined : { identifierPrefix },
  );
  const handle = createRef<FormHandle>();
  await act(async () => {
    root.render(
      <Form
        ref={handle}
        jsonSchema={schema}
        validationMode={ValidationMode.None}
      />,
    );
  });
  cleanups.push(async () => {
    await act(async () => root.unmount());
    host.remove();
  });
  return { host, handle };
};

const duplicateIds = () => {
  const ids = Array.from(document.querySelectorAll('[id]'), (e) => e.id);
  return ids.filter((id, index) => ids.indexOf(id) !== index);
};

const labelFor = (host: HTMLElement, text: string) =>
  Array.from(host.querySelectorAll('label')).find(
    (label) => label.textContent?.trim() === text,
  )!;

describe('two client-rendered roots without identifierPrefix', () => {
  it('every element id in the document is unique', async () => {
    await mountRoot();
    await mountRoot();
    expect(duplicateIds()).toEqual([]);
  });

  it('clicking the "agree" label of the second root changes only the second Form', async () => {
    const first = await mountRoot();
    const second = await mountRoot();
    await act(async () => {
      labelFor(second.host, 'agree').click();
    });
    expect({
      first: first.handle.current!.getValue(),
      second: second.handle.current!.getValue(),
    }).toEqual({ first: {}, second: { agree: true } });
  });

  it('clicking the "pro" option text of the second root changes only the second Form', async () => {
    const first = await mountRoot();
    const second = await mountRoot();
    await act(async () => {
      labelFor(second.host, 'pro').click();
    });
    expect({
      first: first.handle.current!.getValue(),
      second: second.handle.current!.getValue(),
    }).toEqual({ first: {}, second: { plan: 'pro' } });
  });

  it('control: distinct identifierPrefix values keep every id unique', async () => {
    await mountRoot('left-');
    await mountRoot('right-');
    expect(duplicateIds()).toEqual([]);
  });
});
