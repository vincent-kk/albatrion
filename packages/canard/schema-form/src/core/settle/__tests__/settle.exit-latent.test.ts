import { describe, expect, it } from 'vitest';

import { SetValueOption } from '../../types/value';
import { loadSchemaNodeAtMount, writeSchemaNode } from '../index';
import { createTestTree } from './fixtures/createTestTree';

describe('latent descendant exit policies', () => {
  it('WRITE-038 updates a node expression while that node remains in shape', () => {
    const { root } = createTestTree({ type: 'object', properties: {
      flag: { type: 'boolean' }, clear: { type: 'boolean' },
      secret: { type: 'string', controls: {
        active: '../flag', unsetOnInactive: '../clear',
      } },
    } });
    loadSchemaNodeAtMount(root, { flag: true, clear: false, secret: 'held' },
      SetValueOption.Overwrite);
    writeSchemaNode(root.structure!.clear, true, 'input', SetValueOption.Overwrite);
    writeSchemaNode(root.structure!.flag, false, 'input', SetValueOption.Overwrite);
    expect(root.runtime.latentRaw.has(JSON.stringify(['/secret', 'string'])))
      .toBe(false);
  });

  it('WRITE-034 keeps a latent kind beside a live different kind', () => {
    const { root } = createTestTree({ type: 'object', properties: {
      show: { type: 'boolean' }, outer: { type: 'object', controls: {
        active: '../show', discriminator: 'kind', unsetOnInactive: true,
      }, properties: { kind: { type: 'string' } }, oneOf: [
        { properties: { kind: { type: 'string', const: 'a' },
          value: { type: 'string', controls: { unsetOnInactive: false } } } },
        { properties: { kind: { type: 'string', const: 'b' },
          value: { type: 'number', controls: { unsetOnInactive: true } } } },
      ] },
    } });
    loadSchemaNodeAtMount(root, { show: true, outer: { kind: 'a', value: 'held' } },
      SetValueOption.Overwrite);
    writeSchemaNode(root.structure!.outer.structure!.kind, 'b', 'input',
      SetValueOption.Overwrite);
    expect(root.runtime.latentRaw.get(JSON.stringify(['/outer/value', 'string'])))
      .toBe('held');
    writeSchemaNode(root.structure!.show, false, 'input', SetValueOption.Overwrite);
    expect(root.runtime.latentRaw.get(JSON.stringify(['/outer/value', 'string'])))
      .toBe('held');
  });

  it('WRITE-034 uses the last live expression after a suppressed exit', () => {
    const { root } = createTestTree({ type: 'object', properties: {
      show: { type: 'boolean' }, branch: { type: 'object', controls: {
        active: '../show', unsetOnInactive: true,
      }, properties: { gate: { type: 'boolean' },
        secret: { type: 'string', controls: {
          active: '../gate', unsetOnInactive: '../gate',
        } },
      } },
    } });
    loadSchemaNodeAtMount(root, { show: true, branch: {
      gate: true, secret: 'held',
    } }, SetValueOption.Overwrite);
    writeSchemaNode(root.structure!.branch.structure!.gate, false, 'input',
      SetValueOption.DisableAutomaticWrites);
    expect(root.runtime.latentRaw.get(JSON.stringify(['/branch/secret', 'string'])))
      .toBe('held');
    expect([...root.runtime.committedRuleValues?.keys() ?? []].some((key) =>
      key.startsWith('["/branch/secret",'))).toBe(false);
    writeSchemaNode(root.structure!.show, false, 'input', SetValueOption.Overwrite);
    expect(root.runtime.latentRaw.has(JSON.stringify(['/branch/secret', 'string'])))
      .toBe(false);
  });
});
