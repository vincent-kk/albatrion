import Ajv2019 from 'ajv/dist/2019.js';
import { describe, expect, it } from 'vitest';

import { resolveAjvConstructor } from '../../resolveAjvConstructor';
import { collectGuardDynamicAnchors } from '../collectGuardDynamicAnchors';

// Round-3 class 24 sibling: anchor names have the same own-key semantics as enum labels.
describe.each([
  'toString',
  'constructor',
  'hasOwnProperty',
  'valueOf',
  '__proto__',
])('dynamic anchor own binding: %s', (name) => {
  it('stores a declared prototype name like an ordinary anchor', () => {
    const observe = (anchor: string) => {
      const root = {
        $defs: { box: { $dynamicAnchor: anchor, type: 'number', minimum: 2 } },
        properties: { value: { $dynamicRef: `#${anchor}` } },
      };
      const ajv = createInstance();
      ajv.addSchema(root, 'https://example.test/anchor-scope');
      const anchors = collectGuardDynamicAnchors(
        root,
        'https://example.test/anchor-scope',
        '/properties/value',
        ajv,
      );
      const own = Object.prototype.hasOwnProperty.call(anchors, anchor);
      return {
        own,
        verdicts: own ? [anchors[anchor](1), anchors[anchor](2)] : [],
      };
    };
    const ordinary = observe('ordinary');
    expect(ordinary).toEqual({ own: true, verdicts: [false, true] });
    expect(observe(name)).toEqual(ordinary);
  });

  it('refuses an undeclared prototype name like an ordinary anchor', () => {
    const observe = (anchor: string) => {
      const root = { properties: { value: { $dynamicRef: `#${anchor}` } } };
      const ajv = createInstance();
      ajv.addSchema(root, 'https://example.test/missing-anchor');
      try {
        collectGuardDynamicAnchors(
          root,
          'https://example.test/missing-anchor',
          '/properties/value',
          ajv,
        );
        return false;
      } catch (error) {
        if (!(error instanceof Error)) throw error;
        expect(error.message).toContain('is not bound');
        return true;
      }
    };
    const ordinary = observe('ordinary');
    expect(ordinary).toBe(true);
    expect(observe(name)).toBe(ordinary);
  });
});

const createInstance = () =>
  new (resolveAjvConstructor(Ajv2019))({ strict: false });
