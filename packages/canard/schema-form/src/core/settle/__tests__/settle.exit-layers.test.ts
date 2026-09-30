import { describe, expect, it, vi } from 'vitest';

import { SetValueOption } from '../../types/value';
import { loadSchemaNodeAtMount, writeSchemaNode } from '../index';
import { createTestTree } from './fixtures/createTestTree';

describe('settled exit policy layers', () => {
  it('WRITE-031 node layer overrides the Form clear policy', () => {
    const { root } = createTestTree({ type: 'object', properties: {
      flag: { type: 'boolean' }, secret: { type: 'string', controls: {
        active: '../flag', unsetOnInactive: false,
      } },
    } });
    root.runtime.unsetOnInactive = true;
    loadSchemaNodeAtMount(root, { flag: true, secret: 'held' }, SetValueOption.Overwrite);
    writeSchemaNode(root.structure!.flag, false, 'input', SetValueOption.Overwrite);
    expect(root.runtime.latentRaw.get(JSON.stringify(['/secret', 'string']))).toBe('held');
  });

  it('WRITE-031 children layer clears a child when Form keeps it', () => {
    const { root } = createTestTree({ type: 'object', controls: { children: [
      { targets: ['secret'], controls: { unsetOnInactive: true } },
    ] }, properties: { flag: { type: 'boolean' }, secret: {
      type: 'string', controls: { active: '../flag' },
    } } });
    loadSchemaNodeAtMount(root, { flag: true, secret: 'held' }, SetValueOption.Overwrite);
    writeSchemaNode(root.structure!.flag, false, 'input', SetValueOption.Overwrite);
    expect(root.runtime.latentRaw.has(JSON.stringify(['/secret', 'string']))).toBe(false);
  });

  it('WRITE-031 fragment layer clears its directly declared child', () => {
    const { root } = createTestTree({ type: 'object', properties: {
      flag: { type: 'boolean' },
    }, allOf: [{ controls: { active: './flag', unsetOnInactive: true },
      properties: { secret: { type: 'string' } } }] });
    loadSchemaNodeAtMount(root, { flag: true, secret: 'held' }, SetValueOption.Overwrite);
    writeSchemaNode(root.structure!.flag, false, 'input', SetValueOption.Overwrite);
    expect(root.runtime.latentRaw.has(JSON.stringify(['/secret', 'string']))).toBe(false);
  });

  it('WRITE-031 form layer clears when no closer declaration exists', () => {
    const { root } = createTestTree({ type: 'object', properties: {
      flag: { type: 'boolean' }, secret: { type: 'string', controls: {
        active: '../flag',
      } },
    } });
    root.runtime.unsetOnInactive = true;
    loadSchemaNodeAtMount(root, { flag: true, secret: 'held' }, SetValueOption.Overwrite);
    writeSchemaNode(root.structure!.flag, false, 'input', SetValueOption.Overwrite);
    expect(root.runtime.latentRaw.has(JSON.stringify(['/secret', 'string']))).toBe(false);
  });

  it('WRITE-031 same-layer keep defeats another children item clear', () => {
    const { root } = createTestTree({ type: 'object', controls: { children: [
      { targets: ['secret'], controls: { unsetOnInactive: true } },
      { targets: ['secret'], controls: { unsetOnInactive: false } },
    ] }, properties: { flag: { type: 'boolean' }, secret: {
      type: 'string', controls: { active: '../flag' },
    } } });
    root.runtime.unsetOnInactive = true;
    loadSchemaNodeAtMount(root, { flag: true, secret: 'held' }, SetValueOption.Overwrite);
    writeSchemaNode(root.structure!.flag, false, 'input', SetValueOption.Overwrite);
    expect(root.runtime.latentRaw.get(JSON.stringify(['/secret', 'string']))).toBe('held');
  });

  it('WRITE-032 fragment turning off applies to a departing declaration', () => {
    const { root } = createTestTree({ type: 'object', properties: {
      flag: { type: 'boolean' }, addr: { type: 'object', properties: {
        city: { type: 'string' },
      } },
    }, allOf: [{ controls: { active: './flag', unsetOnInactive: true },
      properties: { addr: { type: 'object', properties: {
        zip: { type: 'string' },
      } } } }] });
    loadSchemaNodeAtMount(root, { flag: true, addr: { city: 'C', zip: 'Z', extra: 'E' } },
      SetValueOption.Overwrite);
    writeSchemaNode(root.structure!.flag, false, 'input', SetValueOption.Overwrite);
    expect(root.structure?.addr?.structure?.city?.raw).toBe('C');
    expect(root.runtime.latentRaw.has(JSON.stringify(['/addr/zip', 'string']))).toBe(false);
    expect(root.structure?.addr?.extras).toEqual({ extra: 'E' });
  });

  it('WRITE-033 children subtree policy reaches exiting descendants', () => {
    const { root } = createTestTree({ type: 'object', controls: { children: [
      { targets: ['branch'], controls: { unsetOnInactive: true } },
    ] }, properties: { flag: { type: 'boolean' }, branch: {
      type: 'object', controls: { active: '../flag' }, properties: {
        drop: { type: 'string' }, keep: { type: 'string', controls: {
          unsetOnInactive: false,
        } },
      },
    } } });
    loadSchemaNodeAtMount(root, { flag: true, branch: { drop: 'D', keep: 'K' } },
      SetValueOption.Overwrite);
    writeSchemaNode(root.structure!.flag, false, 'input', SetValueOption.Overwrite);
    expect(root.runtime.latentRaw.has(JSON.stringify(['/branch/drop', 'string']))).toBe(false);
    expect(root.runtime.latentRaw.get(JSON.stringify(['/branch/keep', 'string']))).toBe('K');
  });

  it('WRITE-034 fragment latent policy reaches previously absent descendants', () => {
    const { root } = createTestTree({ type: 'object', properties: {
      flag: { type: 'boolean' },
    }, allOf: [{ controls: { active: './flag', unsetOnInactive: true },
      properties: { branch: { type: 'object', properties: {
        show: { type: 'boolean' },
        drop: { type: 'string', controls: { active: '../show' } },
        keep: { type: 'string', controls: { active: '../show',
          unsetOnInactive: false } },
      } } } }] });
    loadSchemaNodeAtMount(root, { flag: true, branch: {
      show: true, drop: 'D', keep: 'K',
    } }, SetValueOption.Overwrite);
    writeSchemaNode(root.structure!.branch.structure!.show, false,
      'input', SetValueOption.Overwrite);
    writeSchemaNode(root.structure!.flag, false, 'input', SetValueOption.Overwrite);
    expect(root.runtime.latentRaw.has(JSON.stringify(['/branch/drop', 'string']))).toBe(false);
    expect(root.runtime.latentRaw.get(JSON.stringify(['/branch/keep', 'string']))).toBe('K');
  });

  it('WRITE-034 latent children item keep overrides a departing parent clear', () => {
    const { root } = createTestTree({ type: 'object', controls: { children: [
      { targets: ['branch'], controls: { unsetOnInactive: true } },
    ] }, properties: { flag: { type: 'boolean' }, branch: {
      type: 'object', controls: { active: '../flag', children: [
        { targets: ['keep'], controls: { unsetOnInactive: false } },
      ] }, properties: { show: { type: 'boolean' },
        keep: { type: 'string', controls: { active: '../show' } },
      },
    } } });
    loadSchemaNodeAtMount(root, { flag: true, branch: { show: true, keep: 'K' } },
      SetValueOption.Overwrite);
    writeSchemaNode(root.structure!.branch.structure!.show, false,
      'input', SetValueOption.Overwrite);
    writeSchemaNode(root.structure!.flag, false, 'input', SetValueOption.Overwrite);
    expect(root.runtime.latentRaw.get(JSON.stringify(['/branch/keep', 'string']))).toBe('K');
  });

  it('WRITE-038 previous commit expression ignores the exiting write', () => {
    const { root } = createTestTree({ type: 'object', controls: { children: [
      { targets: ['secret'], controls: { unsetOnInactive: './clear' } },
    ] }, properties: { flag: { type: 'boolean' }, clear: { type: 'boolean' }, secret: {
      type: 'string', controls: { active: '../flag' },
    } } });
    loadSchemaNodeAtMount(root, { flag: true, clear: false, secret: 'held' },
      SetValueOption.Overwrite);
    writeSchemaNode(root.structure!.clear, true, 'input', SetValueOption.Overwrite);
    writeSchemaNode(root.structure!.flag, false, 'input', SetValueOption.Overwrite);
    expect(root.runtime.latentRaw.has(JSON.stringify(['/secret', 'string']))).toBe(false);
  });

  it('28C-05 throw keeps the committed value and degrades that commit', () => {
    const { root } = createTestTree({ type: 'object', properties: {
      flag: { type: 'boolean' }, secret: { type: 'string', controls: {
        active: '../flag', unsetOnInactive: '@.explode()',
      } },
    } });
    const explode = vi.fn(() => { throw new Error('policy'); });
    root.runtime.context = { explode };
    root.runtime.unsetOnInactive = true;
    expect(() => loadSchemaNodeAtMount(root, { flag: true, secret: 'held' },
      SetValueOption.Overwrite)).toThrow();
    expect(root.runtime.diagnostics).toMatchObject({ status: 'degraded',
      cause: 'expression', commit: 1 });
    const calls = explode.mock.calls.length;
    writeSchemaNode(root.structure!.flag, false, 'input', SetValueOption.Overwrite);
    expect(explode).toHaveBeenCalledTimes(calls);
    expect(root.runtime.latentRaw.get(JSON.stringify(['/secret', 'string']))).toBe('held');
  });

  it('WRITE-038 removes an exited occurrence expression baseline after using it', () => {
    const { root } = createTestTree({ type: 'object', properties: {
      flag: { type: 'boolean' }, secret: { type: 'string', controls: {
        active: '../flag', unsetOnInactive: '../flag',
      } },
    } });
    loadSchemaNodeAtMount(root, { flag: true, secret: 'held' }, SetValueOption.Overwrite);
    expect([...root.runtime.committedRuleValues?.keys() ?? []].some((key) =>
      key.startsWith('["/secret",'))).toBe(true);
    writeSchemaNode(root.structure!.flag, false, 'input', SetValueOption.Overwrite);
    expect([...root.runtime.committedRuleValues?.keys() ?? []].some((key) =>
      key.startsWith('["/secret",'))).toBe(false);
    expect(root.runtime.latentRaw.has(JSON.stringify(['/secret', 'string'])))
      .toBe(false);
  });

  it('WRITE-039 visible preserved leaves a hidden value in shape', () => {
    const { root } = createTestTree({ type: 'object', properties: {
      hidden: { type: 'string', controls: {
        visible: false, unsetOnInactive: true,
      } },
    } });
    loadSchemaNodeAtMount(root, { hidden: 'held' }, SetValueOption.Overwrite);
    expect(root.structure?.hidden?.visible).toBe(false);
    expect(root.structure?.hidden?.raw).toBe('held');
    expect(root.runtime.latentRaw.size).toBe(0);
  });

  it('FRAGMENT-050 exit not edge evaluates no departing fragment value rule', () => {
    const { root } = createTestTree({ type: 'object', properties: {
      flag: { type: 'boolean' },
    }, allOf: [{ controls: { active: './flag', derived: '@.read()',
      unsetOnInactive: true }, properties: { secret: { type: 'string' } } }] });
    const read = vi.fn(() => undefined);
    root.runtime.context = { read };
    loadSchemaNodeAtMount(root, { flag: true, secret: 'held' }, SetValueOption.Overwrite);
    const calls = read.mock.calls.length;
    writeSchemaNode(root.structure!.flag, false, 'input', SetValueOption.Overwrite);
    expect(read).toHaveBeenCalledTimes(calls);
    expect(root.runtime.latentRaw.has(JSON.stringify(['/secret', 'string']))).toBe(false);
  });
});
