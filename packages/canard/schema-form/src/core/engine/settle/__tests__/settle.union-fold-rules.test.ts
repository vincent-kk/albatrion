import { describe, expect, it } from 'vitest';

import { createTestTree } from '../../__tests__/fixtures/createTestTree';
import { WriteOption } from '../../types/value';
import { loadFieldNodeAtMount } from '../loadFieldNodeAtMount';
import { writeFieldNode } from '../utils/write/writeFieldNode';
import { createUnionFoldTree } from './fixtures/createUnionFoldTree';
import {
  hasRetainedSlotOwnSource,
  readRetainedSlotRaw,
} from './fixtures/readRetainedSlotRaw';

describe('union fold committed rule identities', () => {
  it('commits derive source and target fold keys while switching derived nodes', () => {
    const { root } = createUnionFoldTree({
      left: { type: ['string', 'number'], controls: { derived: '../source' } },
      right: {
        type: ['string', 'boolean'],
        controls: { derived: '../source' },
      },
    });
    loadFieldNodeAtMount(
      root,
      { left: true, right: false, source: 'first' },
      WriteOption.Overwrite,
    );
    expect(root.structure?.shared?.raw).toBe('first');
    expect(
      [...root.runtime.committedRuleValues!.keys()]
        .map((key) => JSON.parse(key))
        .some(
          (key) =>
            key[0] === '/shared' &&
            key[1] === 'union:3' &&
            key[6] === 'union:3',
        ),
    ).toBe(true);
    writeFieldNode(
      root,
      { left: false, right: true, source: 'second' },
      'callerPartial',
      WriteOption.Merge,
    );
    expect(root.structure?.shared?.raw).toBe('second');
    const keys = [...root.runtime.committedRuleValues!.keys()]
      .map((key) => JSON.parse(key))
      .filter((key) => key[0] === '/shared');
    expect(
      keys.some((key) => key[1] === 'union:5' && key[6] === 'union:5'),
    ).toBe(true);
    expect(root.runtime.diagnostics.status).toBe('stable');
  });

  it('keeps declaration, policy and latent metadata keys separate for keep and clear folds', () => {
    const { root } = createUnionFoldTree({
      left: {
        type: ['string', 'number'],
        controls: { unsetOnInactive: '../clear' },
      },
      right: {
        type: ['string', 'boolean'],
        controls: { unsetOnInactive: '../clear' },
      },
    });
    loadFieldNodeAtMount(
      root,
      { left: true, right: false, clear: false, shared: 17 },
      WriteOption.Overwrite,
    );
    expect(
      root.runtime.committedDeclarationIds?.has(
        JSON.stringify(['/shared', 'union:3']),
      ),
    ).toBe(true);
    expect(
      [...root.runtime.committedRuleValues!.keys()]
        .map((key) => JSON.parse(key))
        .some(
          (key) =>
            key[0] === '/shared' &&
            key[1] === 'union:3' &&
            key[3].endsWith('/unsetOnInactive'),
        ),
    ).toBe(true);
    writeFieldNode(
      root,
      { left: false, right: true },
      'callerPartial',
      WriteOption.Merge,
    );
    writeFieldNode(
      root,
      { clear: true, shared: true },
      'callerPartial',
      WriteOption.Merge,
    );
    expect(
      [...root.runtime.committedRuleValues!.keys()]
        .map((key) => JSON.parse(key))
        .some((key) => key[0] === '/shared' && key[1] === 'union:5'),
    ).toBe(true);
    writeFieldNode(root, { right: false }, 'callerPartial', WriteOption.Merge);
    expect(hasRetainedSlotOwnSource(root, '/shared', 'union:5')).toBe(false);
    expect(readRetainedSlotRaw(root, '/shared', 'union:3')).toBe(17);
    writeFieldNode(root, { left: true }, 'callerPartial', WriteOption.Merge);
    expect(root.structure?.shared?.raw).toBe(17);
  });

  it('fills each union fold once when a sibling default changes the selected fold', () => {
    const { root } = createTestTree({
      type: 'object',
      properties: { chooseLater: { type: 'boolean', default: true } },
      allOf: [
        {
          controls: { active: './chooseLater !== true' },
          properties: { shared: { type: ['string', 'number'], default: 17 } },
        },
        {
          controls: { active: './chooseLater === true' },
          properties: {
            shared: { type: ['string', 'boolean'], default: true },
          },
        },
      ],
    });
    loadFieldNodeAtMount(root, {}, WriteOption.Overwrite);
    expect(root.structure?.shared?.schemaType).toEqual(['string', 'boolean']);
    expect(root.structure?.shared?.raw).toBe(true);
    expect(root.runtime.diagnostics.status).toBe('stable');
  });
});
