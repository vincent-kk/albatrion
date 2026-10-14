import { describe, expect, it } from 'vitest';

import { createTestValidator } from '@/schema-form/core/__tests__/fixtures/createTestValidator';
import { createDispatchTree } from '@/schema-form/core/engine/__tests__/fixtures/createDispatchTree';
import { dispatchMount } from '@/schema-form/core/engine/write';

import type { ValidationIssue } from '../types/issue';
import { createValidatorCopy } from '../utils/copy/createValidatorCopy';
import { readFieldNodeErrors } from '../utils/read/readFieldNodeErrors';
import { routeValidationIssues } from '../utils/route/routeValidationIssues';

/** Branches use separate reference targets so each target has one owner. */
const schema = {
  type: 'object',
  controls: { discriminator: 'kind' },
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
    const issues = await validator.compile(createValidatorCopy(schema))({
      kind: 'x',
      value: 'a',
    });
    expect(issues).not.toBeNull();
    const ajv8Issues = issues ?? [];
    expect(
      ajv8Issues.some((issue) => issue.schemaPath?.includes('$defs/xRule')),
    ).toBe(true);
    const { root } = createDispatchTree(schema, undefined, validator);
    dispatchMount(root, { kind: 'x', value: 'a' });
    routeValidationIssues(root, ajv8Issues);
    const shown = readFieldNodeErrors(root.structure?.value ?? root);
    expect(
      shown.some((issue) => issue.schemaPath?.includes('$defs/xRule')),
    ).toBe(true);
    expect(
      shown.some((issue) => issue.schemaPath?.includes('$defs/yRule')),
    ).toBe(false);
  });

  it('ajv6 and ajv7 literal reference shapes preserve uncertain attribution', () => {
    const { root, runtime } = createDispatchTree(schema);
    dispatchMount(root, { kind: 'x', value: 'a' });
    // Ajv 6 can report a definitions target; Ajv 7 can retain a oneOf wrapper.
    const legacyShapes: readonly ValidationIssue[] = [
      {
        dataPath: '/value',
        schemaPath: '#/definitions/yRule/minLength',
        keyword: 'minLength',
      },
      {
        dataPath: '/value',
        schemaPath: '#/oneOf/1/properties/value/$ref/minLength',
        keyword: 'minLength',
      },
    ];
    routeValidationIssues(root, legacyShapes);
    expect(runtime.globalErrors).toBe(legacyShapes);
    expect(readFieldNodeErrors(root.structure?.value ?? root)).toContain(
      legacyShapes[0],
    );
    expect(readFieldNodeErrors(root.structure?.value ?? root)).not.toContain(
      legacyShapes[1],
    );
  });
});
