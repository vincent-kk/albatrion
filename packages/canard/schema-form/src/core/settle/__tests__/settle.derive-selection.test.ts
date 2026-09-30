import { describe, expect, it, vi } from 'vitest';

import { NodeState } from '../../types/state';
import { SetValueOption } from '../../types/value';
import { loadSchemaNodeAtMount, writeSchemaNode } from '../index';
import { createTestTree } from './fixtures/createTestTree';

// filid:contract settle-derive
describe('active derive declarations', () => {
  it('CONTROLS-077 nested fragment derived follows outer dependency after mount', () => {
    const { root } = createTestTree({ type: 'object', properties: {
      t: { type: 'string' }, H: { type: 'object', allOf: [{
        controls: { derived: '../t' }, properties: { x: { type: 'string' } },
      }] },
    } });
    loadSchemaNodeAtMount(root, { t: 'T1' }, SetValueOption.Overwrite);
    expect(root.structure?.H?.structure?.x?.raw).toBe('T1');
    writeSchemaNode(root.structure!.t, 'T2', 'input', SetValueOption.Overwrite);
    expect(root.structure?.H?.structure?.x?.raw).toBe('T2');
    writeSchemaNode(root.structure!.t, 'T3', 'input', SetValueOption.Overwrite);
    expect(root.structure?.H?.structure?.x?.raw).toBe('T3');
  });

  it('CONTROLS-077 fragment unsetValue consumes a false-to-true dependency edge', () => {
    const { root } = createTestTree({ type: 'object', properties: {
      c: { type: 'boolean' }, H: { type: 'object', allOf: [{
        controls: { unsetValue: '../c' }, properties: { x: { type: 'string' } },
      }] },
    } });
    loadSchemaNodeAtMount(root, { c: false, H: { x: 'v' } },
      SetValueOption.Overwrite);
    expect(root.structure?.H?.structure?.x?.raw).toBe('v');
    writeSchemaNode(root.structure!.c, true, 'input', SetValueOption.Overwrite);
    expect(root.structure?.H?.structure?.x?.raw).toBeUndefined();
  });

  it('SETTLE-049 inactive ancestor fragment does not derive on a nested write', () => {
    const { root } = createTestTree({ type: 'object', properties: {
      flag: { type: 'boolean' }, H: { type: 'object', properties: {
        P: { type: 'object', properties: {
          q: { type: 'string' }, r: { type: 'string' },
        } },
      }, allOf: [{ controls: { active: '../flag' }, properties: {
        P: { type: 'object', controls: { derived: '@.derive()' } },
      } }] },
    } });
    const derive = vi.fn(() => ({ q: 'DQ', r: 'DR' }));
    root.runtime.context = { derive };
    loadSchemaNodeAtMount(root, { flag: false, H: { P: { q: 'q0', r: 'r0' } } },
      SetValueOption.Overwrite);
    writeSchemaNode(root.structure!.H.structure!.P.structure!.q, 'user',
      'input', SetValueOption.Overwrite);
    expect(root.structure?.H?.structure?.P?.structure?.q?.raw).toBe('user');
    expect(root.structure?.H?.structure?.P?.structure?.r?.raw).toBe('r0');
    expect(derive).not.toHaveBeenCalled();
  });

  it('SETTLE-049 inactive fragment does not reset interaction on a nested write', () => {
    const { root } = createTestTree({ type: 'object', properties: {
      flag: { type: 'boolean' }, H: { type: 'object', properties: {
        P: { type: 'object', properties: { q: { type: 'string' } } },
      }, allOf: [{ controls: { active: '../flag' }, properties: {
        P: { type: 'object', controls: { resetInteraction: 'true' } },
      } }] },
    } });
    loadSchemaNodeAtMount(root, { flag: false, H: { P: { q: 'q0' } } },
      SetValueOption.Overwrite);
    const target = root.structure!.H.structure!.P;
    target.state = { [NodeState.Dirty]: true, [NodeState.Touched]: true };
    writeSchemaNode(target.structure!.q, 'user', 'input', SetValueOption.Overwrite);
    expect(target.structure?.q?.raw).toBe('user');
    expect(target.state[NodeState.Dirty]).toBe(true);
    expect(target.state[NodeState.Touched]).toBe(true);
  });

  it('SETTLE-049 keeps an inactive shared declaration from firing on a sibling edit', () => {
    const { root } = createTestTree({ type: 'object', properties: {
      flag: { type: 'boolean' }, source: { type: 'string' },
      target: { type: 'string' },
    }, allOf: [{ controls: { active: './flag' }, properties: {
      target: { type: 'string', controls: { derived: '../source' } },
    } }] });
    loadSchemaNodeAtMount(root, { flag: false, source: 'A', target: 'manual' },
      SetValueOption.Overwrite);
    writeSchemaNode(root.structure!.source, 'B', 'input', SetValueOption.Overwrite);
    expect(root.structure?.target?.raw).toBe('manual');
    writeSchemaNode(root.structure!.flag, true, 'input', SetValueOption.Overwrite);
    expect(root.structure?.target?.raw).toBe('B');
    writeSchemaNode(root.structure!.flag, false, 'input', SetValueOption.Overwrite);
    writeSchemaNode(root.structure!.source, 'C', 'input', SetValueOption.Overwrite);
    expect(root.structure?.target?.raw).toBe('B');
  });
});
