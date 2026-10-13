import { describe, expect, it, vi } from 'vitest';

import type { BlueprintSchema } from '../../blueprint';
import { FieldNodeState } from '../../types/state';
import { WriteOption } from '../../types/value';
import { loadFieldNodeAtMount, writeFieldNode } from '../index';
import { createTestTree } from './fixtures/createTestTree';

// filid:contract settle-derive
describe('active derive declarations', () => {
  it('FRAGMENT-050 shared node baseline only on depth-one if activation', () => {
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
            controls: { derived: './s' },
            properties: {
              x: { type: 'string' },
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
    expect(root.structure?.H?.structure?.x?.raw).toBe('own');
    writeFieldNode(
      root.structure!.H.structure!.enabled,
      true,
      'input',
      WriteOption.Overwrite,
    );
    expect(root.structure?.H?.structure?.x?.raw).toBe('own');
  });

  it('FRAGMENT-050 shared node baseline only for resetInteraction', () => {
    const { root } = createTestTree({
      type: 'object',
      properties: {
        H: {
          type: 'object',
          properties: {
            enabled: { type: 'boolean' },
            x: { type: 'string' },
          },
          if: {
            properties: { enabled: { const: true } },
            required: ['enabled'],
          },
          then: {
            controls: { resetInteraction: 'true' },
            properties: { x: { type: 'string' } },
          },
        },
      },
    });
    loadFieldNodeAtMount(
      root,
      { H: { enabled: false, x: 'own' } },
      WriteOption.Overwrite,
    );
    const target = root.structure!.H.structure!.x;
    target.interactionState = {
      [FieldNodeState.Dirty]: true,
      [FieldNodeState.Touched]: true,
    };
    writeFieldNode(
      root.structure!.H.structure!.enabled,
      true,
      'input',
      WriteOption.Overwrite,
    );
    expect(target.interactionState[FieldNodeState.Dirty]).toBe(true);
    expect(target.interactionState[FieldNodeState.Touched]).toBe(true);
  });

  it('FRAGMENT-050 shared node baseline only on depth-two if activation', () => {
    const { root } = createTestTree({
      type: 'object',
      properties: {
        G: {
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
                controls: { derived: './s' },
                properties: {
                  x: { type: 'string' },
                },
              },
            },
          },
        },
      },
    });
    loadFieldNodeAtMount(
      root,
      { G: { H: { enabled: false, s: 'S1', x: 'own' } } },
      WriteOption.Overwrite,
    );
    writeFieldNode(
      root.structure!.G.structure!.H.structure!.enabled,
      true,
      'input',
      WriteOption.Overwrite,
    );
    expect(root.structure?.G?.structure?.H?.structure?.x?.raw).toBe('own');
  });

  it('SETTLE-003 non-root effective schema and selection match a fresh load on both flips', () => {
    const schema: BlueprintSchema = {
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
            controls: { derived: './s' },
            properties: {
              x: { type: 'string', minLength: 3 },
              extra: { type: 'string' },
            },
          },
        },
      },
    };
    const { root } = createTestTree(schema);
    loadFieldNodeAtMount(
      root,
      { H: { enabled: false, s: 'S1', x: 'own' } },
      WriteOption.Overwrite,
    );
    const selectedKey = JSON.stringify(['/H', 'object']);
    for (const enabled of [true, false]) {
      writeFieldNode(
        root.structure!.H.structure!.enabled,
        enabled,
        'input',
        WriteOption.Overwrite,
      );
      const { root: fresh } = createTestTree(schema);
      loadFieldNodeAtMount(fresh, root.emit, WriteOption.Overwrite);
      expect(root.structure?.H?.schema).toEqual(fresh.structure?.H?.schema);
      expect(root.runtime.committedDeclarationIds?.get(selectedKey)).toEqual(
        fresh.runtime.committedDeclarationIds?.get(selectedKey),
      );
      expect(Object.keys(root.structure!.H.structure!)).toEqual(
        Object.keys(fresh.structure!.H.structure!),
      );
    }
  });

  it('CONTROLS-077 nested fragment derived follows outer dependency after mount', () => {
    const { root } = createTestTree({
      type: 'object',
      properties: {
        t: { type: 'string' },
        H: {
          type: 'object',
          allOf: [
            {
              controls: { derived: '../t' },
              properties: { x: { type: 'string' } },
            },
          ],
        },
      },
    });
    loadFieldNodeAtMount(root, { t: 'T1' }, WriteOption.Overwrite);
    expect(root.structure?.H?.structure?.x?.raw).toBe('T1');
    writeFieldNode(root.structure!.t, 'T2', 'input', WriteOption.Overwrite);
    expect(root.structure?.H?.structure?.x?.raw).toBe('T2');
    writeFieldNode(root.structure!.t, 'T3', 'input', WriteOption.Overwrite);
    expect(root.structure?.H?.structure?.x?.raw).toBe('T3');
  });

  it('CONTROLS-077 fragment unsetValue consumes a false-to-true dependency edge', () => {
    const { root } = createTestTree({
      type: 'object',
      properties: {
        c: { type: 'boolean' },
        H: {
          type: 'object',
          allOf: [
            {
              controls: { unsetValue: '../c' },
              properties: { x: { type: 'string' } },
            },
          ],
        },
      },
    });
    loadFieldNodeAtMount(
      root,
      { c: false, H: { x: 'v' } },
      WriteOption.Overwrite,
    );
    expect(root.structure?.H?.structure?.x?.raw).toBe('v');
    writeFieldNode(root.structure!.c, true, 'input', WriteOption.Overwrite);
    expect(root.structure?.H?.structure?.x?.raw).toBeUndefined();
  });

  it('SETTLE-049 inactive ancestor fragment does not derive on a nested write', () => {
    const { root } = createTestTree({
      type: 'object',
      properties: {
        flag: { type: 'boolean' },
        H: {
          type: 'object',
          properties: {
            P: {
              type: 'object',
              properties: {
                q: { type: 'string' },
                r: { type: 'string' },
              },
            },
          },
          allOf: [
            {
              controls: { active: '../flag' },
              properties: {
                P: { type: 'object', controls: { derived: '@.derive()' } },
              },
            },
          ],
        },
      },
    });
    const derive = vi.fn(() => ({ q: 'DQ', r: 'DR' }));
    root.runtime.context = { derive };
    loadFieldNodeAtMount(
      root,
      { flag: false, H: { P: { q: 'q0', r: 'r0' } } },
      WriteOption.Overwrite,
    );
    writeFieldNode(
      root.structure!.H.structure!.P.structure!.q,
      'user',
      'input',
      WriteOption.Overwrite,
    );
    expect(root.structure?.H?.structure?.P?.structure?.q?.raw).toBe('user');
    expect(root.structure?.H?.structure?.P?.structure?.r?.raw).toBe('r0');
    expect(derive).not.toHaveBeenCalled();
  });

  it('SETTLE-049 inactive fragment does not reset interaction on a nested write', () => {
    const { root } = createTestTree({
      type: 'object',
      properties: {
        flag: { type: 'boolean' },
        H: {
          type: 'object',
          properties: {
            P: { type: 'object', properties: { q: { type: 'string' } } },
          },
          allOf: [
            {
              controls: { active: '../flag' },
              properties: {
                P: { type: 'object', controls: { resetInteraction: 'true' } },
              },
            },
          ],
        },
      },
    });
    loadFieldNodeAtMount(
      root,
      { flag: false, H: { P: { q: 'q0' } } },
      WriteOption.Overwrite,
    );
    const target = root.structure!.H.structure!.P;
    target.interactionState = {
      [FieldNodeState.Dirty]: true,
      [FieldNodeState.Touched]: true,
    };
    writeFieldNode(target.structure!.q, 'user', 'input', WriteOption.Overwrite);
    expect(target.structure?.q?.raw).toBe('user');
    expect(target.interactionState[FieldNodeState.Dirty]).toBe(true);
    expect(target.interactionState[FieldNodeState.Touched]).toBe(true);
  });

  it('FRAGMENT-050 shared node baseline only after inactive declaration reselects', () => {
    const { root } = createTestTree({
      type: 'object',
      properties: {
        flag: { type: 'boolean' },
        source: { type: 'string' },
        target: { type: 'string' },
      },
      allOf: [
        {
          controls: { active: './flag' },
          properties: {
            target: { type: 'string', controls: { derived: '../source' } },
          },
        },
      ],
    });
    loadFieldNodeAtMount(
      root,
      { flag: false, source: 'A', target: 'manual' },
      WriteOption.Overwrite,
    );
    writeFieldNode(root.structure!.source, 'B', 'input', WriteOption.Overwrite);
    expect(root.structure?.target?.raw).toBe('manual');
    writeFieldNode(root.structure!.flag, true, 'input', WriteOption.Overwrite);
    expect(root.structure?.target?.raw).toBe('manual');
    writeFieldNode(root.structure!.flag, false, 'input', WriteOption.Overwrite);
    writeFieldNode(root.structure!.source, 'C', 'input', WriteOption.Overwrite);
    expect(root.structure?.target?.raw).toBe('manual');
  });

  it('FRAGMENT-050 shared node baseline only for allOf derived, then source change fires', () => {
    const { root } = createTestTree({
      type: 'object',
      properties: {
        flag: { type: 'boolean' },
        source: { type: 'string' },
        target: { type: 'string' },
      },
      allOf: [
        {
          controls: { active: './flag' },
          properties: {
            target: { type: 'string', controls: { derived: '../source' } },
          },
        },
      ],
    });
    loadFieldNodeAtMount(
      root,
      { flag: false, source: 'A', target: 'manual' },
      WriteOption.Overwrite,
    );
    writeFieldNode(root.structure!.flag, true, 'input', WriteOption.Overwrite);
    expect(root.structure?.target?.raw).toBe('manual');
    writeFieldNode(root.structure!.source, 'B', 'input', WriteOption.Overwrite);
    expect(root.structure?.target?.raw).toBe('B');
  });

  it('FRAGMENT-050 newly entered node fires for allOf derived', () => {
    const { root } = createTestTree({
      type: 'object',
      properties: {
        flag: { type: 'boolean' },
        source: { type: 'string' },
      },
      allOf: [
        {
          controls: { active: './flag' },
          properties: {
            target: { type: 'string', controls: { derived: '../source' } },
          },
        },
      ],
    });
    loadFieldNodeAtMount(
      root,
      { flag: false, source: 'A', target: 'manual' },
      WriteOption.Overwrite,
    );
    writeFieldNode(root.structure!.flag, true, 'input', WriteOption.Overwrite);
    expect(root.structure?.target?.raw).toBe('A');
  });

  it('FRAGMENT-050 shared node baseline only for then derived, then source change fires', () => {
    const { root } = createTestTree({
      type: 'object',
      properties: {
        enabled: { type: 'boolean' },
        s: { type: 'string' },
        x: { type: 'string' },
      },
      if: { properties: { enabled: { const: true } }, required: ['enabled'] },
      then: {
        controls: { derived: './s' },
        properties: {
          x: { type: 'string' },
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
  });

  it('FRAGMENT-050 newly entered node fires for then derived', () => {
    const { root } = createTestTree({
      type: 'object',
      properties: {
        enabled: { type: 'boolean' },
        s: { type: 'string' },
      },
      if: { properties: { enabled: { const: true } }, required: ['enabled'] },
      then: {
        controls: { derived: './s' },
        properties: {
          x: { type: 'string' },
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
    expect(root.structure?.x?.raw).toBe('S1');
  });

  it('FRAGMENT-050 shared node baseline only for unsetValue, then false-to-true fires', () => {
    const { root } = createTestTree({
      type: 'object',
      properties: {
        flag: { type: 'boolean' },
        clear: { type: 'boolean' },
        target: { type: 'string' },
      },
      allOf: [
        {
          controls: { active: './flag' },
          properties: {
            target: { type: 'string', controls: { unsetValue: '../clear' } },
          },
        },
      ],
    });
    loadFieldNodeAtMount(
      root,
      { flag: false, clear: true, target: 'held' },
      WriteOption.Overwrite,
    );
    writeFieldNode(root.structure!.flag, true, 'input', WriteOption.Overwrite);
    expect(root.structure?.target?.raw).toBe('held');
    writeFieldNode(
      root.structure!.clear,
      false,
      'input',
      WriteOption.Overwrite,
    );
    expect(root.structure?.target?.raw).toBe('held');
    writeFieldNode(root.structure!.clear, true, 'input', WriteOption.Overwrite);
    expect(root.structure?.target?.raw).toBeUndefined();
  });

  it('FRAGMENT-050 shared injectTo baseline only and newly entered source fires', () => {
    const injectTo = vi.fn((value: unknown) => ({
      '../output': `from-${value}`,
    }));
    const shared = createTestTree({
      type: 'object',
      properties: {
        flag: { type: 'boolean' },
        source: { type: 'string' },
        output: { type: 'string' },
      },
      allOf: [
        {
          controls: { active: './flag' },
          properties: {
            source: { type: 'string', controls: { injectTo } },
          },
        },
      ],
    }).root;
    loadFieldNodeAtMount(
      shared,
      { flag: false, source: 'A', output: 'manual' },
      WriteOption.Overwrite,
    );
    writeFieldNode(
      shared.structure!.flag,
      true,
      'input',
      WriteOption.Overwrite,
    );
    expect(shared.structure?.output?.raw).toBe('manual');
    expect(injectTo).not.toHaveBeenCalled();
    writeFieldNode(
      shared.structure!.source,
      'B',
      'input',
      WriteOption.Overwrite,
    );
    expect(injectTo).toHaveBeenCalledWith('B', expect.any(Object));
    expect(shared.structure?.output?.raw).toBe('from-B');

    injectTo.mockClear();
    const entered = createTestTree({
      type: 'object',
      properties: {
        flag: { type: 'boolean' },
        output: { type: 'string' },
      },
      allOf: [
        {
          controls: { active: './flag' },
          properties: {
            source: { type: 'string', controls: { injectTo } },
          },
        },
      ],
    }).root;
    loadFieldNodeAtMount(
      entered,
      { flag: false, source: 'A' },
      WriteOption.Overwrite,
    );
    writeFieldNode(
      entered.structure!.flag,
      true,
      'input',
      WriteOption.Overwrite,
    );
    expect(entered.structure?.source?.raw).toBe('A');
    expect(injectTo).toHaveBeenCalledWith('A', expect.any(Object));
    expect(entered.structure?.output?.raw).toBe('from-A');
  });
});
