import { describe, expect, it } from 'vitest';

import { toDisplayLabel } from '../toDisplayLabel';

describe('toDisplayLabel', () => {
  it('turns kebab-case story names and lowercase title segments into sentence case', () => {
    expect(toDisplayLabel('reference-schema')).toBe('Reference schema');
    expect(toDisplayLabel('package-renderer-regression')).toBe('Package renderer regression');
    expect(toDisplayLabel('value')).toBe('Value');
  });
  it('splits compound PascalCase title segments and keeps codes in their case', () => {
    expect(toDisplayLabel('EmptyAndClear')).toBe('Empty and clear');
    expect(toDisplayLabel('HandleLayout')).toBe('Handle layout');
    expect(toDisplayLabel('CX01OrderForm')).toBe('CX01 order form');
    expect(toDisplayLabel('CX24EnterSubmitAndBranch')).toBe('CX24 enter submit and branch');
  });
  it('writes JSON Schema keywords as identifiers, without capitalizing a leading keyword', () => {
    expect(toDisplayLabel('AllOf')).toBe('allOf');
    expect(toDisplayLabel('NestedOneOf')).toBe('Nested oneOf');
    expect(toDisplayLabel('OneOfWithAnyOf')).toBe('oneOf with anyOf');
    expect(toDisplayLabel('IfThenElse')).toBe('if/then/else');
    expect(toDisplayLabel('CX13NestedOneofAnyof')).toBe('CX13 nested oneOf anyOf');
    expect(toDisplayLabel('one-of-switch')).toBe('oneOf switch');
  });
  it('leaves single-word PascalCase and authored spaced labels unchanged', () => {
    expect(toDisplayLabel('Usage')).toBe('Usage');
    expect(toDisplayLabel('Case')).toBe('Case');
    expect(toDisplayLabel('Default Layers')).toBe('Default Layers');
    expect(toDisplayLabel('Conditional branches')).toBe('Conditional branches');
    expect(toDisplayLabel('Browser gates')).toBe('Browser gates');
  });
});
