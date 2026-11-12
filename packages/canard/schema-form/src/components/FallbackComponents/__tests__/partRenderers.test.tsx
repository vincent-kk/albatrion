import { isValidElement } from 'react';

import { expect, it } from 'vitest';

import { nodeFromJSONSchema } from '@/schema-form/__tests__/fixtures/nodeFromJSONSchema';

import { ErrorMessageRenderer } from '../components/ErrorMessageRenderer';
import { LabelRenderer } from '../components/LabelRenderer';

it('returns a label element when called outside React', () => {
  const node = nodeFromJSONSchema({ jsonSchema: { type: 'string' } });
  const element = LabelRenderer({
    node,
    name: node.name,
    path: node.path,
    jsonSchema: node.jsonSchema,
    required: true,
    children: 'Name',
    htmlFor: '/name',
    id: 'label:/name',
  });
  expect(isValidElement(element)).toBe(true);
  expect(element.type).toBe('label');
  expect(element.props.htmlFor).toBe('/name');
  expect(element.props.id).toBe('label:/name');
});

it('returns an error element when called outside React', () => {
  const node = nodeFromJSONSchema({ jsonSchema: { type: 'string' } });
  const element = ErrorMessageRenderer({
    node,
    name: node.name,
    path: node.path,
    jsonSchema: node.jsonSchema,
    required: false,
    children: 'Issue',
  });
  expect(isValidElement(element)).toBe(true);
  expect(element.type).toBe('em');
  expect(element.props.children).toBe('Issue');
});
