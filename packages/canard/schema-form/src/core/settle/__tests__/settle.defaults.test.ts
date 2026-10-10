import { describe, expect, it } from 'vitest';

import { SetValueOption } from '../../types/value';
import { loadSchemaNodeAtMount } from '../index';
import { createTestTree } from './fixtures/createTestTree';

describe('settled default sources', () => {
  it('CONTROLS-077 fragment default fills only its directly declared children', () => {
    const { root } = createTestTree({ type: 'object', properties: {
      outside: { type: 'string' },
    }, allOf: [{ controls: { default: 'fragment' }, properties: {
      inside: { type: 'string' },
    } }] });
    loadSchemaNodeAtMount(root, {}, SetValueOption.Overwrite);
    expect(root.structure?.inside?.raw).toBe('fragment');
    expect(root.structure?.outside?.raw).toBeUndefined();
  });

  it('CONTROLS-073 value layer orders own, children, fragment, and standard defaults', () => {
    const { root } = createTestTree({ type: 'object', controls: { children: [
      { targets: ['own', 'item'], controls: { default: 'item-first' } },
      { targets: ['own', 'item'], controls: { default: 'item-last' } },
    ] }, allOf: [{ controls: { default: 'fragment' }, properties: {
      own: { type: 'string', default: 'standard', controls: { default: 'own' } },
      item: { type: 'string', default: 'standard' },
      fragment: { type: 'string', default: 'standard' },
    } }], properties: { standard: { type: 'string', default: 'standard' } } });
    loadSchemaNodeAtMount(root, {}, SetValueOption.Overwrite);
    expect(root.structure?.own?.raw).toBe('own');
    expect(root.structure?.item?.raw).toBe('item-last');
    expect(root.structure?.fragment?.raw).toBe('fragment');
    expect(root.structure?.standard?.raw).toBe('standard');
  });

  it('CONTROLS-077 later fragment default wins within its layer', () => {
    const { root } = createTestTree({ type: 'object', allOf: [
      { controls: { default: 'first' }, properties: {
        field: { type: 'string' },
      } },
      { controls: { default: 'later' }, properties: {
        field: { type: 'string' },
      } },
    ] });
    loadSchemaNodeAtMount(root, {}, SetValueOption.Overwrite);
    expect(root.structure?.field?.raw).toBe('later');
  });
});
