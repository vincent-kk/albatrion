import { describe, expect, it } from 'vitest';

import { createNotRequiredKeyLookup } from '../createNotRequiredKeyLookup';

describe('createNotRequiredKeyLookup', () => {
  it('decodes the percent and JSON Pointer escapes AJV6 writes in each segment', () => {
    const root = { properties: { 'a/%7E~b': { not: { required: ['x'] } } } };
    expect(createNotRequiredKeyLookup(root, [])('#/properties/a~1%257E~0b/not')).toBe('x');
  });

  it.each([
    ['a reference to the resource', 'urn:item/not'],
    ['a fragment reference into the resource', 'urn:item#/not'],
  ])('resolves a path inside a declared resource through %s', (_, schemaPath) => {
    const item = { $id: 'urn:item', not: { required: ['x'] } };
    expect(createNotRequiredKeyLookup({ definitions: { item } }, [{ id: 'urn:item', schema: item }])(schemaPath)).toBe('x');
  });

  it.each([
    ['a reference that matches no declared $id', { not: { required: ['x'] } }, 'urn:item/not'],
    ['a multi-name required list', { not: { required: ['x', 'y'] } }, '#/not'],
    ['a path through a non-object', { properties: { a: true } }, '#/properties/a/not'],
  ])('identifies no key for %s', (_, root, schemaPath) => {
    expect(createNotRequiredKeyLookup(root, [])(schemaPath)).toBeUndefined();
  });

  it('resolves each schema path once per lookup', () => {
    const root = { not: { required: ['x'] } };
    const lookup = createNotRequiredKeyLookup(root, []);
    expect(lookup('#/not')).toBe('x');
    root.not.required = ['y'];
    expect(lookup('#/not')).toBe('x');
    expect(createNotRequiredKeyLookup(root, [])('#/not')).toBe('y');
  });
});
