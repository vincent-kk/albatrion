import { createRef } from 'react';

import { cleanup, fireEvent, render, screen } from '@testing-library/react';
import { afterEach, expect, it } from 'vitest';

import { Form, type FormHandle } from '@canard/schema-form';

import { plugin } from '../index';

afterEach(cleanup);

it.each([
  {
    source: 'alias',
    alias: { on: 'Alias on', off: 'Alias off' },
    context: {},
    prefix: 'Alias',
  },
  {
    source: 'context before alias',
    alias: { on: 'Alias on', off: 'Alias off' },
    context: { switchLabels: { on: 'Context on', off: 'Context off' } },
    prefix: 'Context',
  },
  {
    source: 'empty context masks alias',
    alias: { on: 'Alias on', off: 'Alias off' },
    context: { switchLabels: {} },
    prefix: '',
  },
])(
  'string switch map follows $source in either state',
  ({ alias, context, prefix }) => {
    for (const stored of ['on', 'off']) {
      const ref = createRef<FormHandle>();
      const view = render(
        <Form
          ref={ref}
          jsonSchema={{
            type: 'object',
            properties: {
              mode: {
                type: 'string',
                enum: ['on', 'off'],
                presentation: {
                  inputType: 'switch',
                  FieldInputProps: { alias },
                },
              },
            },
          }}
          defaultValue={{ mode: stored }}
          context={context}
          fieldInputDefinitions={plugin.fieldInputDefinitions}
          FieldRenderer={plugin.FieldRenderer}
          LabelRenderer={plugin.LabelRenderer}
        />,
      );
      expect(view.container.textContent).toContain(
        prefix ? prefix + ' ' + stored : stored,
      );
      if (prefix !== 'Alias')
        expect(view.container.textContent).not.toContain('Alias');
      const control = screen.getByRole('switch');
      const checked =
        control instanceof HTMLInputElement
          ? control.checked
          : control.getAttribute('aria-checked') === 'true';
      expect(checked).toBe(stored === 'on');
      fireEvent.click(control);
      expect(ref.current!.getValue()).toEqual({
        mode: stored === 'on' ? 'off' : 'on',
      });
      view.unmount();
    }
  },
);
