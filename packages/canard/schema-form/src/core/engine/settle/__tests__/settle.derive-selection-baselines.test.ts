import { describe, expect, it, vi } from 'vitest';

import { FieldNodeState } from '../../types/state';
import { WriteOption } from '../../types/value';
import { loadFieldNodeAtMount, writeFieldNode } from '../index';
import { createTestTree } from './fixtures/createTestTree';

// filid:contract settle-derive
describe('newly selected declaration baselines', () => {
  it('FRAGMENT-050 same-length selection swap takes the new branch baseline', () => {
    const { root } = createTestTree({
      type: 'object',
      properties: {
        enabled: { type: 'boolean' },
        s: { type: 'string' },
        t: { type: 'string' },
        x: { type: 'string' },
      },
      if: { properties: { enabled: { const: true } }, required: ['enabled'] },
      then: {
        properties: {
          x: { type: 'string', controls: { derived: '../s' } },
        },
      },
      else: {
        properties: {
          x: { type: 'string', controls: { derived: '../t' } },
        },
      },
    });
    loadFieldNodeAtMount(
      root,
      { enabled: false, s: 'S1', t: 'T1', x: '' },
      WriteOption.Overwrite,
    );
    const key = JSON.stringify(['/x', 'string']);
    const before = root.runtime.committedDeclarationIds?.get(key);
    writeFieldNode(root.structure!.x, 'm', 'input', WriteOption.Overwrite);
    writeFieldNode(
      root.structure!.enabled,
      true,
      'input',
      WriteOption.Overwrite,
    );
    const after = root.runtime.committedDeclarationIds?.get(key);
    expect(after?.length).toBe(before?.length);
    expect(after).not.toEqual(before);
    expect(root.structure?.x?.raw).toBe('m');
    writeFieldNode(root.structure!.s, 'S2', 'input', WriteOption.Overwrite);
    expect(root.structure?.x?.raw).toBe('S2');
  });

  it('FRAGMENT-050 root if/then shared derived fires on its next source edge', () => {
    const { root } = createTestTree({
      type: 'object',
      properties: {
        enabled: { type: 'boolean' },
        s: { type: 'string' },
        x: { type: 'string' },
      },
      if: { properties: { enabled: { const: true } }, required: ['enabled'] },
      then: {
        properties: {
          x: { type: 'string', controls: { derived: '../s' } },
        },
      },
    });
    loadFieldNodeAtMount(
      root,
      { enabled: false, s: 'S1', x: 'own' },
      WriteOption.Overwrite,
    );
    writeFieldNode(
      root.structure!.enabled,
      true,
      'input',
      WriteOption.Overwrite,
    );
    expect(root.structure?.x?.raw).toBe('own');
    writeFieldNode(root.structure!.s, 'S2', 'input', WriteOption.Overwrite);
    expect(root.structure?.x?.raw).toBe('S2');
    writeFieldNode(root.structure!.s, 'S3', 'input', WriteOption.Overwrite);
    expect(root.structure?.x?.raw).toBe('S3');
  });

  it('FRAGMENT-050 depth-one if/then shared derived fires on its next source edge', () => {
    const { root } = createTestTree({
      type: 'object',
      properties: {
        H: {
          type: 'object',
          properties: {
            enabled: { type: 'boolean' },
            s: { type: 'string' },
            x: { type: 'string' },
          },
          if: {
            properties: { enabled: { const: true } },
            required: ['enabled'],
          },
          then: {
            properties: {
              x: { type: 'string', controls: { derived: '../s' } },
            },
          },
        },
      },
    });
    loadFieldNodeAtMount(
      root,
      { H: { enabled: false, s: 'S1', x: 'own' } },
      WriteOption.Overwrite,
    );
    writeFieldNode(
      root.structure!.H.structure!.enabled,
      true,
      'input',
      WriteOption.Overwrite,
    );
    expect(root.structure?.H?.structure?.x?.raw).toBe('own');
    writeFieldNode(
      root.structure!.H.structure!.s,
      'S2',
      'input',
      WriteOption.Overwrite,
    );
    expect(root.structure?.H?.structure?.x?.raw).toBe('S2');
  });

  it('FRAGMENT-050 allOf if/then shared derived fires on its next source edge', () => {
    const { root } = createTestTree({
      type: 'object',
      properties: {
        enabled: { type: 'boolean' },
        s: { type: 'string' },
        x: { type: 'string' },
      },
      allOf: [
        {
          if: {
            properties: { enabled: { const: true } },
            required: ['enabled'],
          },
          then: {
            properties: {
              x: { type: 'string', controls: { derived: '../s' } },
            },
          },
        },
      ],
    });
    loadFieldNodeAtMount(
      root,
      { enabled: false, s: 'S1', x: 'own' },
      WriteOption.Overwrite,
    );
    writeFieldNode(
      root.structure!.enabled,
      true,
      'input',
      WriteOption.Overwrite,
    );
    expect(root.structure?.x?.raw).toBe('own');
    writeFieldNode(root.structure!.s, 'S2', 'input', WriteOption.Overwrite);
    expect(root.structure?.x?.raw).toBe('S2');
  });

  it('FRAGMENT-050 discriminator shared derived fires after switching branch', () => {
    const { root } = createTestTree({
      type: 'object',
      controls: {
        discriminator: 'kind',
      },
      properties: {
        kind: { type: 'string' },
        s: { type: 'string' },
        x: { type: 'string' },
      },
      oneOf: [
        {
          properties: {
            kind: { type: 'string', const: 'a' },
            x: { type: 'string', controls: { derived: '../s' } },
          },
        },
        { properties: { kind: { type: 'string', const: 'b' } } },
      ],
    });
    loadFieldNodeAtMount(
      root,
      { kind: 'b', s: 'S1', x: 'own' },
      WriteOption.Overwrite,
    );
    writeFieldNode(root.structure!.kind, 'a', 'input', WriteOption.Overwrite);
    expect(root.structure?.x?.raw).toBe('own');
    writeFieldNode(root.structure!.s, 'S2', 'input', WriteOption.Overwrite);
    expect(root.structure?.x?.raw).toBe('S2');
  });

  it('FRAGMENT-050 if/then shared unsetValue fires on its next false-to-true edge', () => {
    const { root } = createTestTree({
      type: 'object',
      properties: {
        enabled: { type: 'boolean' },
        c: { type: 'boolean' },
        x: { type: 'string' },
      },
      if: { properties: { enabled: { const: true } }, required: ['enabled'] },
      then: {
        properties: {
          x: { type: 'string', controls: { unsetValue: '../c' } },
        },
      },
    });
    loadFieldNodeAtMount(
      root,
      { enabled: false, c: false, x: 'keep' },
      WriteOption.Overwrite,
    );
    writeFieldNode(
      root.structure!.enabled,
      true,
      'input',
      WriteOption.Overwrite,
    );
    expect(root.structure?.x?.raw).toBe('keep');
    writeFieldNode(root.structure!.c, true, 'input', WriteOption.Overwrite);
    expect(root.structure?.x?.raw).toBeUndefined();
  });

  it('FRAGMENT-050 if/then shared resetInteraction fires on its next edge', () => {
    const { root } = createTestTree({
      type: 'object',
      properties: {
        enabled: { type: 'boolean' },
        c: { type: 'boolean' },
        x: { type: 'string' },
      },
      if: { properties: { enabled: { const: true } }, required: ['enabled'] },
      then: {
        properties: {
          x: { type: 'string', controls: { resetInteraction: '../c' } },
        },
      },
    });
    loadFieldNodeAtMount(
      root,
      { enabled: false, c: false, x: 'keep' },
      WriteOption.Overwrite,
    );
    const target = root.structure!.x;
    target.interactionState = {
      [FieldNodeState.Dirty]: true,
      [FieldNodeState.Touched]: true,
    };
    writeFieldNode(
      root.structure!.enabled,
      true,
      'input',
      WriteOption.Overwrite,
    );
    expect(target.interactionState[FieldNodeState.Dirty]).toBe(true);
    writeFieldNode(root.structure!.c, true, 'input', WriteOption.Overwrite);
    expect(target.interactionState[FieldNodeState.Dirty]).toBe(false);
    expect(target.interactionState[FieldNodeState.Touched]).toBe(false);
  });

  it('FRAGMENT-050 if/then shared injectTo fires on its next source edge', () => {
    const injectTo = vi.fn((value: unknown) => ({ '../out': `from-${value}` }));
    const { root } = createTestTree({
      type: 'object',
      properties: {
        enabled: { type: 'boolean' },
        src: { type: 'string' },
        out: { type: 'string' },
      },
      if: { properties: { enabled: { const: true } }, required: ['enabled'] },
      then: {
        properties: {
          src: { type: 'string', controls: { injectTo } },
        },
      },
    });
    loadFieldNodeAtMount(
      root,
      { enabled: false, src: 'A', out: 'manual' },
      WriteOption.Overwrite,
    );
    writeFieldNode(
      root.structure!.enabled,
      true,
      'input',
      WriteOption.Overwrite,
    );
    expect(root.structure?.out?.raw).toBe('manual');
    expect(injectTo).not.toHaveBeenCalled();
    writeFieldNode(root.structure!.src, 'B', 'input', WriteOption.Overwrite);
    expect(injectTo).toHaveBeenCalledWith('B', expect.any(Object));
    expect(root.structure?.out?.raw).toBe('from-B');
  });
});
