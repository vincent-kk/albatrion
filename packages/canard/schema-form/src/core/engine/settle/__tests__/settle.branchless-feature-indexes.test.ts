import { describe, expect, it } from 'vitest';

import { nodeFromJSONSchema } from '@/schema-form/__tests__/fixtures/nodeFromJSONSchema';
import {
  blueprint,
  getFeatureNodeIndex,
} from '@/schema-form/core/engine/blueprint';

import { getDeriveRuleTable } from '../derive';
import { getDependencyIndex } from '../utils/write/getDependencyIndex';

describe('branchless and generic observable equivalence', () => {
  it('builds derive/watch/state and reverse dependencies independently of branch absence', () => {
    const root = nodeFromJSONSchema({
      validationMode: 0,
      jsonSchema: {
        type: 'object',
        properties: {
          source: { type: 'number', default: 2 },
          target: {
            type: 'number',
            controls: {
              derived: '(/source) * 2',
              watch: ['/source'],
              visible: '(/source) > 0',
            },
          },
        },
      },
    });
    const analysis = Reflect.get(root, 'runtime').blueprint;
    expect(analysis.capabilities.branchless).toBe(true);
    expect(getDeriveRuleTable(analysis).rules).toHaveLength(1);
    const target = root.find('/target')!;
    const index = getFeatureNodeIndex(analysis);
    expect(
      index.stateKeyNodes.has(Reflect.get(target, 'blueprintNode').id),
    ).toBe(true);
    expect(index.watchNodes.has(Reflect.get(target, 'blueprintNode').id)).toBe(
      true,
    );
    expect(
      getDependencyIndex(analysis).affected(
        '/source',
        Reflect.get(root as object, 'rootNode'),
      ),
    ).toContain('/target');
    root.find('/source')!.setValue(3);
    expect(target.value).toBe(6);
    root.find('/source')!.setValue(-1);
    expect(target.value).toBe(-2);
    expect(target.visible).toBe(false);
  });

  it('shares empty rule tables only when derive absence is proven as a capability', () => {
    const first = blueprint({ type: 'string', controls: { derived: '' } });
    const second = blueprint({ type: 'number', controls: { derived: '' } });
    expect(first.capabilities.hasDerive).toBe(true);
    expect(second.capabilities.hasDerive).toBe(true);
    const firstTable = getDeriveRuleTable(first);
    const secondTable = getDeriveRuleTable(second);
    expect(firstTable.rules).toHaveLength(0);
    expect(secondTable.rules).toHaveLength(0);
    expect(firstTable).not.toBe(secondTable);
    expect(getDeriveRuleTable(first)).toBe(firstTable);
    const absent = getDeriveRuleTable(blueprint({ type: 'boolean' }));
    expect(getDeriveRuleTable(blueprint({ type: 'null' }))).toBe(absent);
    expect(Reflect.get(absent.byDeclaration, 'set')).toBeUndefined();
  });
});
