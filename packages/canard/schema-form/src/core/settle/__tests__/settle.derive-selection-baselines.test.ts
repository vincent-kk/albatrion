import { describe, expect, it, vi } from 'vitest';

import { NodeState } from '../../types/state';
import { SetValueOption } from '../../types/value';
import { loadSchemaNodeAtMount, writeSchemaNode } from '../index';
import { createTestTree } from './fixtures/createTestTree';

// filid:contract settle-derive
describe('newly selected declaration baselines', () => {
  it('FRAGMENT-050 same-length selection swap takes the new branch baseline', () => {
    const { root } = createTestTree({ type: 'object', properties: {
      enabled: { type: 'boolean' }, s: { type: 'string' },
      t: { type: 'string' }, x: { type: 'string' },
    }, if: {}, then: { properties: {
      x: { type: 'string', controls: { derived: '../s' } },
    } }, else: { properties: {
      x: { type: 'string', controls: { derived: '../t' } },
    } } });
    loadSchemaNodeAtMount(root, { enabled: false, s: 'S1', t: 'T1', x: '' },
      SetValueOption.Overwrite);
    const key = JSON.stringify(['/x', 'string']);
    const before = root.runtime.committedDeclarationIds?.get(key);
    writeSchemaNode(root.structure!.x, 'm', 'input', SetValueOption.Overwrite);
    writeSchemaNode(root.structure!.enabled, true, 'input', SetValueOption.Overwrite);
    const after = root.runtime.committedDeclarationIds?.get(key);
    expect(after?.length).toBe(before?.length);
    expect(after).not.toEqual(before);
    expect(root.structure?.x?.raw).toBe('m');
    writeSchemaNode(root.structure!.s, 'S2', 'input', SetValueOption.Overwrite);
    expect(root.structure?.x?.raw).toBe('S2');
  });

  it('FRAGMENT-050 root if/then shared derived fires on its next source edge', () => {
    const { root } = createTestTree({ type: 'object', properties: {
      enabled: { type: 'boolean' }, s: { type: 'string' },
      x: { type: 'string' },
    }, if: {}, then: { properties: {
      x: { type: 'string', controls: { derived: '../s' } },
    } } });
    loadSchemaNodeAtMount(root, { enabled: false, s: 'S1', x: 'own' },
      SetValueOption.Overwrite);
    writeSchemaNode(root.structure!.enabled, true, 'input', SetValueOption.Overwrite);
    expect(root.structure?.x?.raw).toBe('own');
    writeSchemaNode(root.structure!.s, 'S2', 'input', SetValueOption.Overwrite);
    expect(root.structure?.x?.raw).toBe('S2');
    writeSchemaNode(root.structure!.s, 'S3', 'input', SetValueOption.Overwrite);
    expect(root.structure?.x?.raw).toBe('S3');
  });

  it('FRAGMENT-050 depth-one if/then shared derived fires on its next source edge', () => {
    const { root } = createTestTree({ type: 'object', properties: {
      H: { type: 'object', properties: {
        enabled: { type: 'boolean' }, s: { type: 'string' },
        x: { type: 'string' },
      }, if: {}, then: { properties: {
        x: { type: 'string', controls: { derived: '../s' } },
      } } },
    } });
    loadSchemaNodeAtMount(root, { H: { enabled: false, s: 'S1', x: 'own' } },
      SetValueOption.Overwrite);
    writeSchemaNode(root.structure!.H.structure!.enabled, true, 'input',
      SetValueOption.Overwrite);
    expect(root.structure?.H?.structure?.x?.raw).toBe('own');
    writeSchemaNode(root.structure!.H.structure!.s, 'S2', 'input',
      SetValueOption.Overwrite);
    expect(root.structure?.H?.structure?.x?.raw).toBe('S2');
  });

  it('FRAGMENT-050 allOf if/then shared derived fires on its next source edge', () => {
    const { root } = createTestTree({ type: 'object', properties: {
      enabled: { type: 'boolean' }, s: { type: 'string' },
      x: { type: 'string' },
    }, allOf: [{ if: {}, then: { properties: {
      x: { type: 'string', controls: { derived: '../s' } },
    } } }] });
    loadSchemaNodeAtMount(root, { enabled: false, s: 'S1', x: 'own' },
      SetValueOption.Overwrite);
    writeSchemaNode(root.structure!.enabled, true, 'input', SetValueOption.Overwrite);
    expect(root.structure?.x?.raw).toBe('own');
    writeSchemaNode(root.structure!.s, 'S2', 'input', SetValueOption.Overwrite);
    expect(root.structure?.x?.raw).toBe('S2');
  });

  it('FRAGMENT-050 discriminator shared derived fires after switching branch', () => {
    const { root } = createTestTree({ type: 'object', controls: {
      discriminator: 'kind',
    }, properties: {
      kind: { type: 'string' }, s: { type: 'string' },
      x: { type: 'string' },
    }, oneOf: [{ properties: {
      kind: { type: 'string', const: 'a' },
      x: { type: 'string', controls: { derived: '../s' } },
    } }, { properties: { kind: { type: 'string', const: 'b' } } }] });
    loadSchemaNodeAtMount(root, { kind: 'b', s: 'S1', x: 'own' },
      SetValueOption.Overwrite);
    writeSchemaNode(root.structure!.kind, 'a', 'input', SetValueOption.Overwrite);
    expect(root.structure?.x?.raw).toBe('own');
    writeSchemaNode(root.structure!.s, 'S2', 'input', SetValueOption.Overwrite);
    expect(root.structure?.x?.raw).toBe('S2');
  });

  it('FRAGMENT-050 if/then shared unsetValue fires on its next false-to-true edge', () => {
    const { root } = createTestTree({ type: 'object', properties: {
      enabled: { type: 'boolean' }, c: { type: 'boolean' },
      x: { type: 'string' },
    }, if: {}, then: { properties: {
      x: { type: 'string', controls: { unsetValue: '../c' } },
    } } });
    loadSchemaNodeAtMount(root, { enabled: false, c: false, x: 'keep' },
      SetValueOption.Overwrite);
    writeSchemaNode(root.structure!.enabled, true, 'input', SetValueOption.Overwrite);
    expect(root.structure?.x?.raw).toBe('keep');
    writeSchemaNode(root.structure!.c, true, 'input', SetValueOption.Overwrite);
    expect(root.structure?.x?.raw).toBeUndefined();
  });

  it('FRAGMENT-050 if/then shared resetInteraction fires on its next edge', () => {
    const { root } = createTestTree({ type: 'object', properties: {
      enabled: { type: 'boolean' }, c: { type: 'boolean' },
      x: { type: 'string' },
    }, if: {}, then: { properties: {
      x: { type: 'string', controls: { resetInteraction: '../c' } },
    } } });
    loadSchemaNodeAtMount(root, { enabled: false, c: false, x: 'keep' },
      SetValueOption.Overwrite);
    const target = root.structure!.x;
    target.state = { [NodeState.Dirty]: true, [NodeState.Touched]: true };
    writeSchemaNode(root.structure!.enabled, true, 'input', SetValueOption.Overwrite);
    expect(target.state[NodeState.Dirty]).toBe(true);
    writeSchemaNode(root.structure!.c, true, 'input', SetValueOption.Overwrite);
    expect(target.state[NodeState.Dirty]).toBe(false);
    expect(target.state[NodeState.Touched]).toBe(false);
  });

  it('FRAGMENT-050 if/then shared injectTo fires on its next source edge', () => {
    const injectTo = vi.fn((value: unknown) => ({ '../out': `from-${value}` }));
    const { root } = createTestTree({ type: 'object', properties: {
      enabled: { type: 'boolean' }, src: { type: 'string' },
      out: { type: 'string' },
    }, if: {}, then: { properties: {
      src: { type: 'string', controls: { injectTo } },
    } } });
    loadSchemaNodeAtMount(root, { enabled: false, src: 'A', out: 'manual' },
      SetValueOption.Overwrite);
    writeSchemaNode(root.structure!.enabled, true, 'input', SetValueOption.Overwrite);
    expect(root.structure?.out?.raw).toBe('manual');
    expect(injectTo).not.toHaveBeenCalled();
    writeSchemaNode(root.structure!.src, 'B', 'input', SetValueOption.Overwrite);
    expect(injectTo).toHaveBeenCalledWith('B', expect.any(Object));
    expect(root.structure?.out?.raw).toBe('from-B');
  });
});
