import { describe, expect, it, vi } from 'vitest';

import { createDispatchTree } from '../../__tests__/fixtures/createDispatchTree';
import type { BlueprintSchema } from '../../blueprint';
import { WriteOption } from '../../types/value';
import {
  dispatchMount,
  dispatchWriteInput,
  subscribeFieldNode,
} from '../../write';
import * as copying from '../utils/input/nextExtras';
import { observeArraySelection } from './fixtures/observeArraySelection';
import { referenceNextExtras } from './fixtures/referenceNextExtras';

describe('extras copy settlement equivalence', () => {
  it.each([false, true])(
    'retains full observations and deliveries with declared child=%s',
    (declared) => {
      const schema: BlueprintSchema = {
        type: 'object',
        properties: {
          flag: { type: 'boolean' },
          h: {
            type: 'object',
            properties: declared ? { known: { type: 'number' } } : {},
            allOf: [
              {
                controls: { active: '../flag' },
                properties: { gated: { type: 'string' } },
              },
            ],
          },
        },
      };
      const histories: unknown[][] = [];
      for (const reference of [false, true]) {
        const copy = vi.spyOn(copying, 'nextExtras');
        if (reference) copy.mockImplementation(referenceNextExtras);
        try {
          const { root } = createDispatchTree(schema);
          const delivered: unknown[] = [];
          const changed: unknown[] = [];
          root.runtime.onChange = (value) => changed.push(value);
          const listen = (node: typeof root) =>
            subscribeFieldNode(node, (event) => {
              delivered.push({ path: node.path, event });
            });
          listen(root);
          const factory = root.runtime.nodeFactory;
          root.runtime.nodeFactory = (entry, parent, runtime) => {
            const node = factory(entry, parent, runtime);
            listen(node);
            return node;
          };
          const history: unknown[] = [];
          const inputs = [
            {
              flag: true,
              h: JSON.parse(
                '{"known":1,"gated":"G","first":2,"__proto__":{"safe":true}}',
              ),
            },
            { flag: true, h: { known: 2, next: 3, first: 4 } },
            { flag: false, h: { last: 5 } },
            { flag: true, h: { known: 2, next: 3, first: 4, last: 5 } },
            { flag: true, h: { known: 2, next: 3, first: 4, last: 5 } },
            { flag: true, h: {} },
          ];
          for (let index = 0; index < inputs.length; index++) {
            delivered.length = 0;
            changed.length = 0;
            const before = structuredClone(inputs[index]);
            const oldOutput = root.emit;
            const oldExtras = root.structure?.h?.undeclaredValues;
            if (index === 0) dispatchMount(root, inputs[index]);
            else
              dispatchWriteInput(
                root,
                inputs[index],
                index < 4 ? WriteOption.Merge : WriteOption.Overwrite,
              );
            expect(inputs[index]).toStrictEqual(before);
            const host = root.structure!.h;
            history.push({
              observation: observeArraySelection(root),
              delivered: [...delivered],
              changed: [...changed],
              keys: Object.keys(Object(host.emit)),
              extraKeys: Object.keys(Object(host.undeclaredValues)),
              sameOutput: root.emit === oldOutput,
              sameExtras: host.undeclaredValues === oldExtras,
            });
          }
          histories.push(history);
        } finally {
          copy.mockRestore();
        }
      }
      expect(histories[0]).toStrictEqual(histories[1]);
    },
  );
});
