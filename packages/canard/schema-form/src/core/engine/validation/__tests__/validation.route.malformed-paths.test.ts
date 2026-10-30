import { describe, expect, it } from 'vitest';

import { createDispatchTree } from '@/schema-form/core/engine/__tests__/fixtures/createDispatchTree';
import { dispatchMount, dispatchValidate } from '@/schema-form/core/engine/write';

import type { ValidationIssue } from '../types/issue';
import type { Validator } from '../types/validator';
import { readFieldNodeErrors } from '../utils/read/readFieldNodeErrors';

/** Mount an object with one `name` child whose validator reports exactly the given issue. */
const mountWithIssue = (issue: ValidationIssue) => {
  const validator: Validator = {
    compile: () => () => [issue],
    compileGuard: () => () => true,
  };
  const { root } = createDispatchTree(
    { type: 'object', properties: { name: { type: 'string' } } },
    undefined,
    validator,
  );
  dispatchMount(root, { name: 'a' });
  return root;
};

// filid:contract validation-route
describe('validator-owned path strings that are not routable pointers', () => {
  it.each([
    ['a keyword name', 'minLength'],
    ['a foreign-document reference', 'other.json#/properties/name'],
    ['a malformed percent escape', '#/properties/100%'],
  ])('keeps %s as the schemaPath and still routes by dataPath', async (_, schemaPath) => {
    const issue: ValidationIssue = { dataPath: '/name', schemaPath, message: 'm' };
    const root = mountWithIssue(issue);
    const verdict = await dispatchValidate(root);
    expect(verdict).toHaveLength(1);
    const shown = readFieldNodeErrors(root.structure?.name ?? root);
    expect(shown).toHaveLength(1);
    expect(shown[0].schemaPath).toBe(schemaPath);
  });

  it.each([
    ['not a pointer', 'name'],
    ['a malformed percent escape', '#/na%me'],
  ])('leaves a dataPath that is %s unroutable without failing the validation', async (_, dataPath) => {
    const issue: ValidationIssue = { dataPath, message: 'm' };
    const root = mountWithIssue(issue);
    const verdict = await dispatchValidate(root);
    expect(verdict).toEqual([issue]);
    expect(readFieldNodeErrors(root.structure?.name ?? root)).toEqual([]);
    expect(readFieldNodeErrors(root)).toEqual([]);
  });
});
