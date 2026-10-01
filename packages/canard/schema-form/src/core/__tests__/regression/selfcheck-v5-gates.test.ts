import { describe, expect, it } from 'vitest';

import { makeSchemaNodeTree } from '../makeSchemaNodeTree';

const overlayTree = () => {
  const { root } = makeSchemaNodeTree({ type: 'object', properties: {
    flag: { type: 'string' },
    child: { type: 'object', properties: { p: { type: 'string' } },
      allOf: [{ controls: { active: './q !== undefined' }, properties: {
        r: { type: 'string', default: 'R' },
      } }],
    },
  }, allOf: [{ controls: { active: './flag !== undefined' }, properties: {
    child: { type: 'object', properties: {
      q: { type: 'string', default: 'Q' },
    } },
  } }] });
  root.setValue({ flag: 'on', child: { p: 'P' } });
  return root;
};

// filid:contract factory-single-path
describe('selfcheck-v5 lifted and budget gates', () => {
  it('selfcheck-v5.mjs:211 exposes an active constraint without emitting a value', () => {
    const { root } = makeSchemaNodeTree({ type: 'object',
      if: { not: { required: ['x'] } }, then: { required: ['y'] },
    });
    root.setValue({});
    expect(root.outputValue).toEqual({});
    expect(root.jsonSchema).toMatchObject({ required: ['y'] });
  });

  it('selfcheck-v5.mjs:204 lets the later birth turn the earlier negated gate off', () => {
    const { root } = makeSchemaNodeTree({ type: 'object', properties: {
      mode: { type: 'string' },
    }, allOf: [
      { controls: { active: './extra === undefined' }, properties: {
        fallback: { type: 'string', default: 'F' },
      } },
      { controls: { active: './mode === "full"' }, properties: {
        extra: { type: 'string', default: 'E' },
      } },
    ] });
    root.setValue({ mode: 'full' });
    expect(root.outputValue).toEqual({ mode: 'full', extra: 'E' });
    expect(root.find('/fallback')).toBeNull();
    expect(root.diagnostics.status).toBe('stable');
  });

  it('selfcheck-v5.mjs:263 compares a lifted guard against the projected host in five cases', () => {
    const guard = (input: unknown) => {
      if (input === null || typeof input !== 'object' || !('addr' in input))
        return true;
      const addr = input.addr;
      return addr !== null && typeof addr === 'object' && 'zip' in addr;
    };
    for (const input of [{}, { addr: {} }, { addr: null },
      { addr: { city: 'Seoul' } }, { addr: { zip: '1' } }]) {
      const { root } = makeSchemaNodeTree({ type: 'object', properties: {
        addr: { type: ['object', 'null'], properties: {
          city: { type: 'string' }, zip: { type: 'string' },
        } },
      }, if: { anyOf: [
        { not: { required: ['addr'] } },
        { properties: { addr: { type: 'object', required: ['zip'] } },
          required: ['addr'] },
      ] }, then: { properties: {
        zipNote: { type: 'string', default: 'has zip' },
      } } });
      root.setValue(input);
      expect(root.find('/zipNote') !== null).toBe(guard(root.outputValue));
    }
  });

  it('selfcheck-v5.mjs:635 chains a lifted child declaration to its own guard', () => {
    expect(overlayTree().outputValue).toEqual({
      flag: 'on', child: { p: 'P', r: 'R', q: 'Q' },
    });
  });

  it('selfcheck-v5.mjs:637 hides lifted descendants while retaining their raw', () => {
    const root = overlayTree();
    root.find('/flag')?.setValue(undefined);
    expect(root.outputValue).toEqual({ child: { p: 'P' } });
    expect(root.inactiveValues).toContainEqual({ path: '/child/q', value: 'Q' });
  });

  it('selfcheck-v5.mjs:639 restores lifted descendants on reactivation', () => {
    const root = overlayTree();
    root.find('/flag')?.setValue(undefined);
    root.find('/flag')?.setValue('on');
    expect(root.outputValue).toEqual({
      flag: 'on', child: { p: 'P', r: 'R', q: 'Q' },
    });
  });
});
