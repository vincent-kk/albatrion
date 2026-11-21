// Port of round 3 `uriSingleColon.test.tsx` (watch-list point: the URI input schemes of the UI plugins). Only the
// text input lookup changed: `input#\/link` became a lookup through the core's `data-path` wrapper,
// because the round 4 identifier design replaced path ids with opaque ids.
import { createRef } from 'react';

import { cleanup, fireEvent, render } from '@testing-library/react';
import { afterEach, describe, expect, it } from 'vitest';

import { Form, type FormHandle } from '@canard/schema-form';

import { FieldInputUriDefinition } from '../../fieldInputs/FieldInputUri';

afterEach(cleanup);

const typeAtEnd = (text: string) => {
  const input = document.querySelector('[data-path="/link"] input:not(.ant-select-selection-search-input)') as HTMLInputElement;
  fireEvent.change(input, { target: { value: input.value + text } });
};

const renderLink = (link: string | undefined, protocols?: string[]) => {
  const ref = createRef<FormHandle>();
  render(
    <Form
      ref={ref}
      fieldInputDefinitions={[FieldInputUriDefinition]}
      jsonSchema={{
        type: 'object',
        properties: {
          link: {
            type: 'string',
            format: 'uri',
            ...(protocols
              ? { presentation: { FieldInputProps: { protocols } } }
              : {}),
          },
        },
      }}
      defaultValue={link === undefined ? {} : { link }}
    />,
  );
  return ref;
};

describe('URI schemes written with a single colon (antd5)', () => {
  it.each([
    ['sms:+15551234', 'sms:+155512345'],
    ['urn:isbn:0451450523', 'urn:isbn:04514505235'],
    ['geo:37.78,-122.4', 'geo:37.78,-122.45'],
  ])('editing %s keeps its scheme', (link, expected) => {
    const ref = renderLink(link);
    typeAtEnd('5');
    expect(ref.current!.getValue()).toEqual({ link: expected });
  });

  it('control: editing a listed single-colon scheme keeps it', () => {
    const ref = renderLink('tel:+15551234');
    typeAtEnd('5');
    expect(ref.current!.getValue()).toEqual({ link: 'tel:+155512345' });
  });

  it('a configured single-colon protocol writes a single colon', () => {
    const ref = renderLink(undefined, ['sms']);
    typeAtEnd('+15551234');
    expect(ref.current!.getValue()).toEqual({ link: 'sms:+15551234' });
  });
});
