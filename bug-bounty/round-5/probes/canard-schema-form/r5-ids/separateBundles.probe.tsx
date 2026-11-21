import { afterEach, describe, expect, it, vi } from 'vitest';

// Probe for r5-ids: IN2, two independently bundled applications (each with its own React
// and schema-form copy) mounted client-side on one page, as micro-frontends do.
// Verification level: public API (package source, two module registries).

type Copy = {
  react: unknown;
  client: unknown;
  host: HTMLElement;
  getValue: () => unknown;
  unmount: () => Promise<void>;
};

const schema = {
  type: 'object',
  properties: {
    agree: { type: 'boolean' },
    plan: {
      type: 'string',
      enum: ['free', 'pro'],
      presentation: { inputType: 'radio' },
    },
  },
} as const;

/** Load a fresh React, ReactDOM and schema-form copy and mount one Form with it. */
const mountBundle = async (identifierPrefix?: string): Promise<Copy> => {
  vi.resetModules();
  const React = await import('react');
  const { createRoot } = await import('react-dom/client');
  const { Form, ValidationMode } = await import('../../index');
  const host = document.createElement('div');
  document.body.append(host);
  const root = createRoot(
    host,
    identifierPrefix === undefined ? undefined : { identifierPrefix },
  );
  const handle = React.createRef<any>();
  await React.act(async () => {
    root.render(
      React.createElement(Form as any, {
        ref: handle,
        jsonSchema: schema,
        validationMode: ValidationMode.None,
      }),
    );
  });
  return {
    react: React,
    client: createRoot,
    host,
    getValue: () => handle.current.getValue(),
    unmount: async () => {
      await React.act(async () => root.unmount());
      host.remove();
    },
  };
};

const mounted: Copy[] = [];
afterEach(async () => {
  for (const copy of mounted.splice(0)) await copy.unmount();
});

const duplicateIds = () => {
  const ids = Array.from(document.querySelectorAll('[id]'), (e) => e.id);
  return ids.filter((id, index) => ids.indexOf(id) !== index);
};

const labelFor = (host: HTMLElement, text: string) =>
  Array.from(host.querySelectorAll('label')).find(
    (label) => label.textContent?.trim() === text,
  )!;

describe('two separately bundled client applications on one page', () => {
  it('probe validity: each application loads its own React copy', async () => {
    const first = await mountBundle();
    const second = await mountBundle();
    mounted.push(first, second);
    expect(first.react).not.toBe(second.react);
    expect(first.client).not.toBe(second.client);
  });

  it('every element id in the document is unique', async () => {
    mounted.push(await mountBundle(), await mountBundle());
    expect(duplicateIds()).toEqual([]);
  });

  it('clicking the "agree" label of the second application changes only its Form', async () => {
    const first = await mountBundle();
    const second = await mountBundle();
    mounted.push(first, second);
    labelFor(second.host, 'agree').click();
    await new Promise((resolve) => setTimeout(resolve, 0));
    expect({ first: first.getValue(), second: second.getValue() }).toEqual({
      first: {},
      second: { agree: true },
    });
  });

  it('control: distinct identifierPrefix values keep every id unique', async () => {
    mounted.push(await mountBundle('left-'), await mountBundle('right-'));
    expect(duplicateIds()).toEqual([]);
  });
});
