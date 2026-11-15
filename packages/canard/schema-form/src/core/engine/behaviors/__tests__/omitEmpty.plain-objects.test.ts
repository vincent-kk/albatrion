import { describe, expect, it } from 'vitest';

import { createTestTree } from '../../__tests__/fixtures/createTestTree';
import { blueprint } from '../../blueprint';
import { loadFieldNodeAtMount } from '../../settle';
import { WriteOption } from '../../types/value';
import { isOmittedEmpty } from '../utils/options/isOmittedEmpty';

// filid:contract empty-values
describe('omitEmpty counts only plain objects as empty', () => {
  it('empty-values emits a Date held by string, union and terminal object nodes', () => {
    const { root } = createTestTree({
      type: 'object',
      properties: {
        text: { type: 'string' },
        either: { type: ['string', 'number'] },
        meta: { type: 'object', options: { terminal: true } },
      },
    });
    const date = new Date(0);
    loadFieldNodeAtMount(
      root,
      { text: date, either: date, meta: date },
      WriteOption.Overwrite,
    );
    expect(root.structure!.text.emit).toBe(date);
    expect(root.structure!.either.emit).toBe(date);
    expect(root.structure!.meta.emit).toBe(date);
  });

  it('empty-values still omits empty strings and empty plain objects', () => {
    const { root } = createTestTree({
      type: 'object',
      properties: {
        text: { type: 'string' },
        either: { type: ['string', 'number'] },
        meta: { type: 'object', options: { terminal: true } },
      },
    });
    loadFieldNodeAtMount(
      root,
      { text: '', either: Object.create(null), meta: {} },
      WriteOption.Overwrite,
    );
    expect(root.structure!.text.emit).toBeUndefined();
    expect(root.structure!.either.emit).toBeUndefined();
    expect(root.structure!.meta.emit).toBeUndefined();
  });

  it('empty-values predicts the same emission for latent leaves', () => {
    const template = blueprint({ type: 'string' }).root;
    expect(isOmittedEmpty(template, new Date(0))).toBe(false);
    expect(isOmittedEmpty(template, {})).toBe(true);
    expect(isOmittedEmpty(template, Object.create(null))).toBe(true);
    expect(isOmittedEmpty(template, '')).toBe(true);
  });
});
