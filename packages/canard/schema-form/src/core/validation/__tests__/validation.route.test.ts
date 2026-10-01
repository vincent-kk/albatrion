import { describe, expect, it } from 'vitest';

import { dispatchMount } from '../../dispatch';
import { createDispatchTree } from '../../dispatch/__tests__/fixtures/createDispatchTree';
import { readSchemaNodeErrors, routeValidationIssues } from '../index';

// filid:contract validation-route
describe('validation issue attribution', () => {
  it('VALIDATE-043 FRAGMENT-053 assigns rejected keys to their host and terminal descendants to the terminal', () => {
    const { root, runtime } = createDispatchTree({ type: 'object', properties: {
      host: { type: 'object', properties: { known: { type: 'string' } } },
      terminal: { type: 'string' },
    } });
    dispatchMount(root, { host: { known: 'a' }, terminal: 'b' });
    const issues = [
      { dataPath: '/host', rejectedKey: 'extra', message: 'extra' },
      { dataPath: '/terminal/deep', message: 'inner' },
      { dataPath: '/absent', message: 'ownerless' },
    ];
    routeValidationIssues(root, issues);
    expect(runtime.globalErrors).toBe(issues);
    expect(readSchemaNodeErrors(root.structure?.host ?? root).map((issue) => issue.message))
      .toEqual(['extra']);
    expect(readSchemaNodeErrors(root.structure?.terminal ?? root).map((issue) => issue.message))
      .toEqual(['inner']);
    expect(readSchemaNodeErrors(root)).toEqual([]);
  });

  it('VALIDATE-051 keeps a union host keyword on its data node', () => {
    const { root } = createDispatchTree({ type: ['string', 'number'] });
    dispatchMount(root, 'x');
    routeValidationIssues(root, [{ dataPath: '', keyword: 'oneOf',
      schemaPath: '#/oneOf', message: 'host' }]);
    expect(readSchemaNodeErrors(root).map((issue) => issue.message)).toEqual(['host']);
  });

  it('VALIDATE-043 keeps allOf, if, and controls.active issues visible', () => {
    const { root } = createDispatchTree({ type: 'object',
      properties: { flag: { type: 'boolean' }, value: { type: 'string' } },
      allOf: [{ properties: { value: { minLength: 3 } } }],
      if: { properties: { flag: { const: true } } },
      then: { properties: { value: { pattern: '^A' } } },
    });
    dispatchMount(root, { flag: true, value: 'b' });
    routeValidationIssues(root, [
      { dataPath: '/value', schemaPath: '#/allOf/0/properties/value/minLength' },
      { dataPath: '/value', schemaPath: '#/then/properties/value/pattern' },
      { dataPath: '/value', schemaPath: '#/properties/value/controls/active' },
    ]);
    expect(readSchemaNodeErrors(root.structure?.value ?? root)).toHaveLength(3);
  });
});
