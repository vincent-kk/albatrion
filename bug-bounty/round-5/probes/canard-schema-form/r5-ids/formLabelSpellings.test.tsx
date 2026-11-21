import { cleanup, render } from '@testing-library/react';
import { afterEach, describe, expect, it } from 'vitest';

import { Form, type JSONSchema, ValidationMode } from '../../index';

// Probe for r5-ids: RG3 on the Form.Label decision that a query resolving to one node uses
// that node's ids, so every spelling that resolves the node labels the same input.
// Verification level: public API (package source).

afterEach(cleanup);

const schema: JSONSchema = {
  type: 'object',
  properties: {
    group: { type: 'object', properties: { name: { type: 'string' } } },
    'a b': { type: 'string' },
  },
};

describe('core: Form.Label spellings of one field label its input', () => {
  it.each([
    ['/group/name', '/group/name'],
    ['#/group/name', '/group/name'],
    ['/group/./name', '/group/name'],
    ['/group/name/../name', '/group/name'],
    ['#/group/./name', '/group/name'],
    ['/a b', '/a b'],
  ])('Form.Label path %s labels the input at %s', (labelPath, inputPath) => {
    const { container } = render(
      <Form jsonSchema={schema} validationMode={ValidationMode.None}>
        <Form.Label path={labelPath} />
        <Form.Input path={inputPath} />
      </Form>,
    );
    const label = container.querySelector('label');
    const input = container.querySelector('input');
    expect(label).not.toBeNull();
    expect((label as HTMLLabelElement).control).toBe(input);
  });
});
