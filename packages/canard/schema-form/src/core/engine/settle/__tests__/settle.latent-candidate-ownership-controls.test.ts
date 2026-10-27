import { describe, expect, it } from 'vitest';

import { pinLatentBaseline } from '../../../__tests__/fixtures/pinLatentBaseline';
import { createDispatchTree } from '../../__tests__/fixtures/createDispatchTree';
import { WriteOption } from '../../types/value';
import {
  dispatchMount,
  dispatchResetForm,
  dispatchResetSubtree,
  dispatchSetValue,
} from '../../write';
import { writeFieldNode } from '../utils/write/writeFieldNode';
import { getDispatchNode } from './fixtures/getDispatchNode';

describe('candidate cleanup preserves broad clearing contracts', () => {
  it.each([
    'whole-write',
    'merge',
    'load',
    'subtree-reset',
    'form-reset',
  ] as const)(
    '[control] %s erases in-scope sources and retains out-of-scope sources',
    (operation) => {
      // These assertions inspect the latent-store baseline directly.
      pinLatentBaseline();
      const { root } = createDispatchTree({
        type: 'object',
        properties: {
          a: { type: 'boolean' },
          b: { type: 'boolean' },
          box: {
            type: 'object',
            allOf: [
              {
                controls: { active: '../a' },
                properties: {
                  v: { type: 'object', properties: { x: { type: 'number' } } },
                },
              },
              {
                controls: { active: '../b' },
                properties: { v: { type: 'array', items: { type: 'number' } } },
              },
            ],
          },
          outside: {
            type: 'object',
            properties: {
              show: { type: 'boolean' },
              hidden: { type: 'number', controls: { active: '../show' } },
            },
          },
        },
      });
      dispatchMount(root, {
        a: true,
        b: false,
        box: { v: { x: 1 } },
        outside: { show: true, hidden: 7 },
      });
      dispatchSetValue(getDispatchNode(root, 'box', 'v', 'x'), 5);
      dispatchSetValue(getDispatchNode(root, 'a'), false);
      dispatchSetValue(getDispatchNode(root, 'outside', 'show'), false);
      const inScope = JSON.stringify(['/box/v/x', 'number']);
      const outside = JSON.stringify(['/outside/hidden', 'number']);
      expect(root.runtime.latentRaw.get(inScope)).toBe(5);
      expect(root.runtime.latentRaw.get(outside)).toBe(7);
      const outsideMetadata = root.runtime.latentRawMetadata?.get(outside);
      const box = getDispatchNode(root, 'box');
      switch (operation) {
        case 'whole-write':
          dispatchSetValue(box, {});
          break;
        case 'merge':
          dispatchSetValue(box, { v: undefined }, WriteOption.Merge);
          break;
        case 'load':
          writeFieldNode(box, {}, 'load', WriteOption.Overwrite);
          break;
        case 'subtree-reset':
          dispatchResetSubtree(box);
          break;
        case 'form-reset':
          dispatchResetForm(root, {
            a: false,
            b: false,
            box: {},
            outside: { show: false },
          });
          break;
      }
      expect(root.runtime.latentRaw.get(inScope)).toBe(
        operation === 'subtree-reset' ? 1 : undefined,
      );
      expect(root.runtime.latentRaw.get(outside)).toBe(
        operation === 'form-reset' ? undefined : 7,
      );
      if (operation !== 'form-reset')
        expect(root.runtime.latentRawMetadata?.get(outside)).toEqual(
          outsideMetadata,
        );
      dispatchSetValue(getDispatchNode(root, 'a'), true);
      expect(getDispatchNode(root, 'box', 'v').local).toEqual(
        operation === 'subtree-reset' ? { x: 1 } : {},
      );
      dispatchSetValue(getDispatchNode(root, 'outside', 'show'), true);
      expect(getDispatchNode(root, 'outside', 'hidden').raw).toBe(
        operation === 'form-reset' ? undefined : 7,
      );
    },
  );
});
