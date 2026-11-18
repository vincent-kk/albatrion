import { cleanup, render } from '@testing-library/react';
import { afterEach, describe, expect, it } from 'vitest';

import { Form } from '@canard/schema-form';

import { plugin } from '../../index';

afterEach(cleanup);

/** Returns the label's target control and whether it is the field's own control. */
const labelTarget = (container: HTMLElement, path: string) => {
  const field = container.querySelector(`[data-path="${path}"]`)!;
  const label = field.querySelector('label');
  const target = label?.htmlFor ? document.getElementById(label.htmlFor) : null;
  return target ? target.tagName.toLowerCase() : null;
};

describe('field label association (antd-mobile)', () => {
  it.each([
    ['/count', { type: 'number' as const }, 'input'],
    ['/name', { type: 'string' as const }, 'input'],
  ])('the label of %s points at its control', (path, schema, tag) => {
    const { container } = render(
      <Form
        fieldInputDefinitions={plugin.fieldInputDefinitions}
        LabelRenderer={plugin.LabelRenderer}
        jsonSchema={{
          type: 'object',
          properties: { [path.slice(1)]: schema },
        }}
        onError={() => {}}
      />,
    );
    expect(labelTarget(container, path)).toBe(tag);
  });
});
