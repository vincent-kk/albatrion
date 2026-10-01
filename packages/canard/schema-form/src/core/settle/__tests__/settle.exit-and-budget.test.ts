import { describe, expect, it, vi } from 'vitest';

import { SetValueOption } from '../../types/value';
import { loadSchemaNodeAtMount, resetSchemaNodeForm, writeSchemaNode } from '../index';
import { getTransitionCap } from '../utils/transition/getTransitionCap';
import { createTestTree } from './fixtures/createTestTree';

// filid:contract settle-budget
describe('settle exits and budgets', () => {
  it('SETTLE-041 counts discriminator and branch active as one fragment in both budgets', () => {
    const { root, blueprint } = createTestTree({ type: 'object',
      controls: { discriminator: 'kind' },
      oneOf: [{ controls: { active: '!./x' }, properties: {
        kind: { type: 'string', const: 'a' }, x: { type: 'number' },
      } }],
    });
    expect(getTransitionCap(blueprint)).toBe(2);
    expect(() => writeSchemaNode(root, { kind: 'a', x: 1 },
      'callerReplace', SetValueOption.Overwrite)).toThrow();
    expect(root.runtime.diagnostics).toMatchObject({ cause: 'budget',
      exceededBudget: 'hostWheel', iterations: 2 });
  });

  it('SETTLE-041 counts one children active entry across its targets', () => {
    const { root, blueprint } = createTestTree({ type: 'object',
      properties: { a: { type: 'number' }, b: { type: 'number' } },
      controls: { children: [{ targets: ['a', 'b'],
        controls: { active: '!./a' } }] },
    });
    expect(getTransitionCap(blueprint)).toBe(2);
    expect(() => writeSchemaNode(root, { a: 1, b: 2 },
      'callerReplace', SetValueOption.Overwrite)).toThrow();
    expect(root.runtime.diagnostics).toMatchObject({ cause: 'budget',
      exceededBudget: 'hostWheel', iterations: 2 });
  });

  it('26C-11 attributes a self-negating fragment to the host-wheel ceiling', () => {
    const { root, blueprint } = createTestTree({ type: 'object',
      if: { not: { required: ['x'] } },
      then: { properties: { x: { type: 'number', default: 1 } } },
    });
    expect(getTransitionCap(blueprint)).toBe(2);
    expect(() => loadSchemaNodeAtMount(root, {}, SetValueOption.Overwrite))
      .toThrow();
    expect(root.runtime.diagnostics).toMatchObject({ cause: 'budget',
      exceededBudget: 'hostWheel', iterations: 2 });
  });

  it('SETTLE-005 withdraws a mid-round fill absent from the final shape', () => {
    const { root } = createTestTree({ type: 'object', properties: {
      toggle: { type: 'boolean', default: true },
      transient: { type: 'string', default: 'temporary', controls: {
        active: '!../toggle',
      } },
    } });
    loadSchemaNodeAtMount(root, {}, SetValueOption.Overwrite);
    expect(root.structure?.toggle?.raw).toBe(true);
    expect(root.structure?.transient).toBeUndefined();
    expect(root.runtime.latentRaw.has(JSON.stringify(['/transient', 'string'])))
      .toBe(false);
  });

  it('TEST-069 exit node clears its own raw while detached reads stay frozen', () => {
    const { root } = createTestTree({ type: 'object', properties: {
      flag: { type: 'boolean' },
      secret: { type: 'string', default: 'fresh', controls: {
        active: '../flag', unsetOnInactive: true,
      } },
    } });
    loadSchemaNodeAtMount(root, { flag: true, secret: 'held' }, SetValueOption.Overwrite);
    const former = root.structure!.secret;
    writeSchemaNode(root.structure!.flag, false, 'input', SetValueOption.Overwrite);
    expect(root.structure?.secret).toBeUndefined();
    expect(former.raw).toBe('held');
    expect(former.detached).toBe(true);
    expect(root.runtime.latentRaw.has(JSON.stringify(['/secret', 'string']))).toBe(false);
    writeSchemaNode(root.structure!.flag, true, 'input', SetValueOption.Overwrite);
    expect(root.structure?.secret).not.toBe(former);
    expect(root.structure?.secret?.raw).toBe('fresh');
  });

  it('WRITE-032 exit policy reads only the previous committed declarations', () => {
    const { root } = createTestTree({ type: 'object', properties: {
      flag: { type: 'boolean' }, other: { type: 'boolean' },
      secret: { type: 'string', controls: {
        active: '../flag', unsetOnInactive: true,
      } },
    }, allOf: [{ controls: { active: './other' }, properties: {
      secret: { type: 'string', controls: { unsetOnInactive: false } },
    } }] });
    loadSchemaNodeAtMount(root, { flag: true, other: false, secret: 'old' },
      SetValueOption.Overwrite);
    writeSchemaNode(root.structure!.flag, false, 'input', SetValueOption.Overwrite);
    expect(root.runtime.latentRaw.has(JSON.stringify(['/secret', 'string'])))
      .toBe(false);
  });

  it('TEST-069 exit Form clears descendants except their nearer false policy', () => {
    const { root } = createTestTree({ type: 'object', properties: {
      flag: { type: 'boolean' },
      branch: { type: 'object', controls: { active: '../flag' }, properties: {
        drop: { type: 'string' },
        keep: { type: 'string', controls: { unsetOnInactive: false } },
      } },
    } });
    root.runtime.unsetOnInactive = true;
    loadSchemaNodeAtMount(root, { flag: true, branch: { drop: 'D', keep: 'K' } },
      SetValueOption.Overwrite);
    writeSchemaNode(root.structure!.flag, false, 'input', SetValueOption.Overwrite);
    expect(root.runtime.latentRaw.has(JSON.stringify(['/branch/drop', 'string']))).toBe(false);
    expect(root.runtime.latentRaw.get(JSON.stringify(['/branch/keep', 'string']))).toBe('K');
    writeSchemaNode(root.structure!.flag, true, 'input', SetValueOption.Overwrite);
    expect(root.structure?.branch?.structure?.drop?.raw).toBeUndefined();
    expect(root.structure?.branch?.structure?.keep?.raw).toBe('K');
  });

  it('WRITE-034 clears latent descendants of an exiting declaration with false override', () => {
    const { root } = createTestTree({ type: 'object', properties: {
      flag: { type: 'boolean' },
      branch: { type: 'object', controls: { active: '../flag',
        unsetOnInactive: true }, properties: {
        show: { type: 'boolean' },
        drop: { type: 'string', controls: { active: '../show' } },
        keep: { type: 'string', controls: { active: '../show',
          unsetOnInactive: false } },
      } },
    } });
    loadSchemaNodeAtMount(root, { flag: true, branch: {
      show: true, drop: 'D', keep: 'K',
    } }, SetValueOption.Overwrite);
    writeSchemaNode(root.structure!.branch.structure!.show, false,
      'input', SetValueOption.Overwrite);
    expect(root.runtime.latentRaw.get(JSON.stringify(['/branch/drop', 'string'])))
      .toBe('D');
    writeSchemaNode(root.structure!.flag, false, 'input', SetValueOption.Overwrite);
    expect(root.runtime.latentRaw.has(JSON.stringify(['/branch/drop', 'string'])))
      .toBe(false);
    expect(root.runtime.latentRaw.get(JSON.stringify(['/branch/keep', 'string'])))
      .toBe('K');
  });

  it('WRITE-034 applies a departing declaration policy while its host stays live', () => {
    const { root } = createTestTree({ type: 'object', properties: {
      flag: { type: 'boolean' },
      addr: { type: 'object', properties: { city: { type: 'string' } } },
    }, allOf: [{ controls: { active: './flag' }, properties: {
      addr: { type: 'object', controls: { unsetOnInactive: true },
        properties: { zip: { type: 'string' } } },
    } }] });
    loadSchemaNodeAtMount(root, { flag: true, addr: {
      city: 'C', zip: 'Z',
    } }, SetValueOption.Overwrite);
    expect(root.structure?.addr?.structure?.zip?.raw).toBe('Z');
    writeSchemaNode(root.structure!.flag, false, 'input', SetValueOption.Overwrite);
    expect(root.structure?.addr).toBeDefined();
    expect(root.structure?.addr?.structure?.zip).toBeUndefined();
    expect(root.runtime.latentRaw.has(JSON.stringify(['/addr/zip', 'string'])))
      .toBe(false);
  });

  it('WRITE-031 exit clearing leaves an exited object node extras unchanged', () => {
    const { root } = createTestTree({ type: 'object', properties: {
      flag: { type: 'boolean' },
      branch: { type: 'object', controls: { active: '../flag',
        unsetOnInactive: true }, properties: { kept: { type: 'string' } } },
    } });
    loadSchemaNodeAtMount(root, { flag: true, branch: { kept: 'K', extra: 'E' } },
      SetValueOption.Overwrite);
    const former = root.structure!.branch;
    const extras = former.extras;
    writeSchemaNode(root.structure!.flag, false, 'input', SetValueOption.Overwrite);
    expect(former.extras).toBe(extras);
    expect(former.extras).toEqual({ extra: 'E' });
  });

  it('SETTLE-011 and ERROR-204 retain degraded diagnostics until form load', () => {
    const { root } = createTestTree({ type: 'object', properties: {
      a: { type: ['string', 'boolean'] },
    }, allOf: [
      { controls: { active: './a === "0"' }, properties: { a: { type: 'boolean' } } },
      { controls: { active: './a !== "0"' }, properties: { a: { type: 'string' } } },
    ] });
    expect(() => writeSchemaNode(root, { a: 0 }, 'callerReplace', SetValueOption.Overwrite))
      .toThrow();
    expect(root.structure?.a?.raw).toBe(0);
    expect(root.runtime.typeMismatchPaths.has('/a')).toBe(true);
    expect(root.runtime.diagnostics).toMatchObject({ status: 'degraded',
      cause: 'budget', exceededBudget: 'transition', iterations: expect.any(Number),
      commit: 1 });
    writeSchemaNode(root.structure!.a, 1, 'input', SetValueOption.Overwrite);
    expect(root.runtime.diagnostics.status).toBe('degraded');
    resetSchemaNodeForm(root, { a: 'x' }, SetValueOption.Overwrite);
    expect(root.runtime.diagnostics.status).toBe('stable');
  });

  it('TEST-067 recursion expansion commits Source B and records recursion', () => {
    const schema = { $defs: { Node: { type: 'object', properties: {
      hasChild: { type: 'boolean' },
    }, if: { not: { properties: { hasChild: { const: false } },
      required: ['hasChild'] } }, then: {
      properties: { child: { $ref: '#/$defs/Node' } },
    } } }, $ref: '#/$defs/Node' };
    const { root } = createTestTree(schema);
    expect(() => writeSchemaNode(root, { hasChild: true }, 'callerReplace',
      SetValueOption.Overwrite)).toThrow();
    expect(root.runtime.diagnostics).toMatchObject({ status: 'degraded',
      cause: 'budget', exceededBudget: 'recursion' });
  });

  it('SETTLE-011 host wheel budget commits explicit raw before throwing', () => {
    const { root } = createTestTree({ type: 'object', properties: {
      a: { type: 'boolean', controls: { active: '!../b' } },
      b: { type: 'boolean', controls: { active: '../a' } },
    } });
    expect(() => writeSchemaNode(root, { a: true, b: true },
      'callerReplace', SetValueOption.Overwrite)).toThrow();
    expect(root.raw).toBeUndefined();
    expect(root.structure?.a?.raw).toBe(true);
    expect(root.structure?.b?.raw).toBe(true);
    expect(root.runtime.diagnostics).toMatchObject({ status: 'degraded',
      cause: 'budget', exceededBudget: 'hostWheel', commit: 1 });
  });

  it('ERROR-070 throws at the end of settlement in production too', () => {
    const { root } = createTestTree({ type: 'object', properties: {
      a: { type: 'boolean', controls: { active: '!../b' } },
      b: { type: 'boolean', controls: { active: '../a' } },
    } });
    vi.stubEnv('NODE_ENV', 'production');
    try {
      expect(() => writeSchemaNode(root, { a: true, b: true },
        'callerReplace', SetValueOption.Overwrite)).toThrow();
      expect(root.runtime.commitNumber).toBe(1);
      expect(root.runtime.diagnostics.status).toBe('degraded');
    } finally {
      vi.unstubAllEnvs();
    }
  });

  it('SETTLE-047 reuses cleared work containers after success and failure', () => {
    const ordinary = createTestTree({ type: 'string' }).root;
    writeSchemaNode(ordinary, 'first', 'input', SetValueOption.Overwrite);
    const scratch = ordinary.runtime.settlementScratch;
    expect(scratch?.inUse).toBe(false);
    expect(scratch?.entered.size).toBe(0);
    expect(scratch?.writtenInputs.size).toBe(0);
    writeSchemaNode(ordinary, 'second', 'input', SetValueOption.Overwrite);
    expect(ordinary.runtime.settlementScratch).toBe(scratch);

    const unstable = createTestTree({ type: 'object', properties: {
      a: { type: 'boolean', controls: { active: '!../b' } },
      b: { type: 'boolean', controls: { active: '../a' } },
    } }).root;
    expect(() => writeSchemaNode(unstable, { a: true, b: true },
      'callerReplace', SetValueOption.Overwrite)).toThrow();
    expect(unstable.runtime.settlementScratch?.inUse).toBe(false);
    expect(unstable.runtime.settlementScratch?.entered.size).toBe(0);
    expect(unstable.runtime.settlementScratch?.automaticLog).toHaveLength(0);
    expect(unstable.runtime.settlementScratch?.changedNodes.size).toBe(0);
  });
});
