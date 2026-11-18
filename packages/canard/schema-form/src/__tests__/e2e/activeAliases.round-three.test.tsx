import { createRef } from 'react';

import { act, cleanup, render } from '@testing-library/react';
import { afterEach, describe, expect, it } from 'vitest';

import {
  Form,
  type FormHandle,
  type JSONSchema,
  ValidationMode,
} from '../../index';

afterEach(cleanup);

const contact: JSONSchema = {
  type: 'object',
  properties: {
    name: { type: 'string', default: 'n' },
    vatId: {
      type: 'string',
      default: 'V',
      controls: { active: '../../isCompany === true' },
    },
  },
};

const party = (ref: boolean): JSONSchema => ({
  type: 'object',
  properties: {
    isCompany: { type: 'boolean', default: false },
    contact: ref ? { $ref: '#/$defs/Contact' } : contact,
  },
});

const schemaFor = (ref: boolean, extra?: JSONSchema): JSONSchema => ({
  type: 'object',
  $defs: { Contact: contact },
  properties: {
    buyer: party(ref),
    seller: party(ref),
    ...(extra ? { note: extra } : {}),
  },
});

const run = async (
  schema: JSONSchema,
  defaultValue: any,
  path: string,
  next: boolean,
) => {
  const handle = createRef<FormHandle>();
  const view = render(
    <Form
      ref={handle}
      validationMode={ValidationMode.None}
      jsonSchema={schema}
      defaultValue={defaultValue}
    />,
  );
  const initial = handle.current!.getValue();
  await act(() => handle.current!.findNode(path)!.setValue(next));
  const after = handle.current!.getValue();
  view.unmount();
  return { initial, after };
};

describe('active gate in a reused $defs template that reads outside the template', () => {
  it('turning on the second referrer condition adds its field, as the inline schema does', async () => {
    const inline = await run(schemaFor(false), {}, '/seller/isCompany', true);
    expect(inline.after).toEqual({
      buyer: { isCompany: false, contact: { name: 'n' } },
      seller: { isCompany: true, contact: { name: 'n', vatId: 'V' } },
    });
    expect(await run(schemaFor(true), {}, '/seller/isCompany', true)).toEqual(
      inline,
    );
  });

  it('turning off the second referrer condition removes its value from getValue, as the inline schema does', async () => {
    const load = {
      buyer: { isCompany: true, contact: { vatId: 'B-1' } },
      seller: { isCompany: true, contact: { vatId: 'S-1' } },
    };
    const inline = await run(
      schemaFor(false),
      load,
      '/seller/isCompany',
      false,
    );
    expect(inline.after).toEqual({
      buyer: { isCompany: true, contact: { name: 'n', vatId: 'B-1' } },
      seller: { isCompany: false, contact: { name: 'n' } },
    });
    expect(
      await run(schemaFor(true), load, '/seller/isCompany', false),
    ).toEqual(inline);
  });

  it('control: the same $ref schema reacts once an unrelated visible control exists', async () => {
    const extra: JSONSchema = {
      type: 'string',
      controls: { visible: '../buyer/isCompany === true' },
    };
    const load = {
      buyer: { isCompany: true, contact: { vatId: 'B-1' } },
      seller: { isCompany: true, contact: { vatId: 'S-1' } },
    };
    const inline = await run(
      schemaFor(false, extra),
      load,
      '/seller/isCompany',
      false,
    );
    expect(
      await run(schemaFor(true, extra), load, '/seller/isCompany', false),
    ).toEqual(inline);
  });
});

describe('active gate in a reused $defs template that reads the form context', () => {
  const address: JSONSchema = {
    type: 'object',
    properties: {
      city: { type: 'string', default: 'c' },
      internalCode: {
        type: 'string',
        default: 'IC',
        controls: { active: '@.role === "admin"' },
      },
    },
  };
  const schemaFor = (ref: boolean, extra?: JSONSchema): JSONSchema => ({
    type: 'object',
    $defs: { Address: address },
    properties: {
      billing: ref ? { $ref: '#/$defs/Address' } : address,
      shipping: ref ? { $ref: '#/$defs/Address' } : address,
      ...(extra ? { note: extra } : {}),
    },
  });
  const run = async (schema: JSONSchema) => {
    const handle = createRef<FormHandle>();
    const view = render(
      <Form
        ref={handle}
        validationMode={ValidationMode.None}
        jsonSchema={schema}
        context={{ role: 'user' }}
      />,
    );
    const initial = handle.current!.getValue();
    await act(async () => {
      view.rerender(
        <Form
          ref={handle}
          validationMode={ValidationMode.None}
          jsonSchema={schema}
          context={{ role: 'admin' }}
        />,
      );
    });
    const after = handle.current!.getValue();
    view.unmount();
    return { initial, after };
  };

  it('a context change activates the field at both referrers, as the inline schema does', async () => {
    const inline = await run(schemaFor(false));
    expect(inline.after).toEqual({
      billing: { city: 'c', internalCode: 'IC' },
      shipping: { city: 'c', internalCode: 'IC' },
    });
    expect(await run(schemaFor(true))).toEqual(inline);
  });

  it('the context change still misses the second referrer when an unrelated visible control builds the occurrence index', async () => {
    const extra: JSONSchema = {
      type: 'string',
      controls: { visible: '@.role === "admin"' },
    };
    expect(await run(schemaFor(true, extra))).toEqual(
      await run(schemaFor(false, extra)),
    );
  });
});

describe('absent field at the second referrer while the occurrence index exists', () => {
  it('turning on the second referrer condition adds its field even with an unrelated visible control', async () => {
    const extra: JSONSchema = {
      type: 'string',
      controls: { visible: '../buyer/isCompany === true' },
    };
    const inline = await run(
      schemaFor(false, extra),
      {},
      '/seller/isCompany',
      true,
    );
    expect(
      await run(schemaFor(true, extra), {}, '/seller/isCompany', true),
    ).toEqual(inline);
  });
});
