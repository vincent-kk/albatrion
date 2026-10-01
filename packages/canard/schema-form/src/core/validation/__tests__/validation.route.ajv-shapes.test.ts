import { describe, expect, it } from 'vitest';

import { dispatchMount } from '../../dispatch';
import { createTestValidator } from '../../__tests__/fixtures/createTestValidator';
import { createDispatchTree } from '../../dispatch/__tests__/fixtures/createDispatchTree';
import { createValidatorCopy, readSchemaNodeErrors, routeValidationIssues } from '../index';
import type { ValidationIssue } from '../type';

/** Branches use separate reference targets so each target has one owner. */
const schema = { type: 'object', controls: { discriminator: 'kind' },
  $defs: {
    xRule: { type: 'string', minLength: 3 },
    yRule: { type: 'string', minLength: 5 },
  },
  properties: { kind: { type: 'string' }, value: { type: 'string' } },
  oneOf: [
    { properties: { kind: { const: 'x' }, value: { $ref: '#/$defs/xRule' } } },
    { properties: { kind: { const: 'y' }, value: { $ref: '#/$defs/yRule' } } },
  ],
};

// filid:contract validation-route
describe('18C-53 reference schemaPath attribution', () => {
  it('ajv8 uses the compiled reference target path and hides only the inactive branch', async () => {
    const validator = createTestValidator();
    const issues = await validator.compile(createValidatorCopy(schema))({ kind: 'x', value: 'a' });
    expect(issues).not.toBeNull();
    const ajv8Issues = issues ?? [];
    expect(ajv8Issues.some((issue) => issue.schemaPath?.includes('$defs/xRule'))).toBe(true);
    const { root } = createDispatchTree(schema, undefined, validator);
    dispatchMount(root, { kind: 'x', value: 'a' });
    routeValidationIssues(root, ajv8Issues);
    const shown = readSchemaNodeErrors(root.structure?.value ?? root);
    expect(shown.some((issue) => issue.schemaPath?.includes('$defs/xRule'))).toBe(true);
    expect(shown.some((issue) => issue.schemaPath?.includes('$defs/yRule'))).toBe(false);
  });

  it('ajv6 and ajv7 literal reference shapes preserve uncertain attribution', () => {
    const { root, runtime } = createDispatchTree(schema);
    dispatchMount(root, { kind: 'x', value: 'a' });
    // Ajv 6 can report a definitions target; Ajv 7 can retain a oneOf wrapper.
    const legacyShapes: readonly ValidationIssue[] = [
      { dataPath: '/value', schemaPath: '#/definitions/yRule/minLength', keyword: 'minLength' },
      { dataPath: '/value', schemaPath: '#/oneOf/1/properties/value/$ref/minLength', keyword: 'minLength' },
    ];
    routeValidationIssues(root, legacyShapes);
    expect(runtime.globalErrors).toBe(legacyShapes);
    expect(readSchemaNodeErrors(root.structure?.value ?? root)).toContain(legacyShapes[0]);
    expect(readSchemaNodeErrors(root.structure?.value ?? root)).not.toContain(legacyShapes[1]);
  });
});
