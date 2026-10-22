import { expect, it } from 'vitest';

import { WriteOption } from '@/schema-form/core/engine/types/value';

import { createTestTree } from '../../__tests__/fixtures/createTestTree';
import { mergeEffectiveSchema } from '../../blueprint';
import { getCommittedDeclarationKey } from '../../utils/controls/getCommittedDeclarationKey';
import { loadFieldNodeAtMount } from '../loadFieldNodeAtMount';
import { writeFieldNode } from '../utils/write/writeFieldNode';
import { gateTableCases } from './fixtures/gate-table/gateTableCases';

it('4d preserves schema identity for every combination of independent root buckets', () => {
  const { root } = createTestTree({
    type: 'object',
    properties: { kind: { type: 'string' }, other: { type: 'string' } },
    anyOf: [
      {
        controls: { active: "./kind === 'a'" },
        properties: { a: { type: 'string', default: 'A' } },
      },
      {
        controls: { active: "./other === 'b'" },
        properties: { b: { type: 'string', default: 'B' } },
      },
    ],
  });
  loadFieldNodeAtMount(
    root,
    { kind: 'none', other: 'none' },
    WriteOption.Overwrite,
  );
  const references = new Map<string, typeof root.schema>();
  for (let round = 0; round < 2; round++)
    for (const [kind, other] of [
      ['a', 'none'],
      ['a', 'b'],
      ['none', 'b'],
      ['none', 'none'],
    ]) {
      writeFieldNode(
        root,
        { kind, other },
        'callerReplace',
        WriteOption.Overwrite,
      );
      const key = kind + '/' + other;
      const expected = mergeEffectiveSchema(
        root.blueprintNode,
        root.runtime.committedDeclarationIds!.get(
          getCommittedDeclarationKey(root),
        )!,
        { mode: 'runtime', isAtomic: root.runtime.blueprint.isAtomic },
      );
      expect(root.schema).toBe(expected);
      if (round === 0) references.set(key, root.schema);
      else expect(root.schema).toBe(references.get(key));
    }
  expect(references.get('a/none')).not.toBe(references.get('a/b'));
  expect(references.get('none/b')).not.toBe(references.get('none/none'));
});

it('4d partitions the same root bucket by atomic predicate identity', () => {
  const { root, blueprint } = createTestTree(gateTableCases[0].schema);
  loadFieldNodeAtMount(root, { kind: 'kind_0' }, WriteOption.Overwrite);
  const firstPredicate = () => false;
  const secondPredicate = () => false;
  const references = new Map<unknown, typeof root.schema>();
  for (const predicate of [firstPredicate, secondPredicate, firstPredicate]) {
    root.runtime.blueprint = { ...blueprint, isAtomic: predicate };
    for (const kind of ['kind_4', 'kind_0'])
      writeFieldNode(
        root.structure!.kind,
        kind,
        'input',
        WriteOption.Overwrite,
      );
    const expected = mergeEffectiveSchema(
      root.blueprintNode,
      root.runtime.committedDeclarationIds!.get(
        getCommittedDeclarationKey(root),
      )!,
      { mode: 'runtime', isAtomic: predicate },
    );
    expect(root.schema).toBe(expected);
    if (references.has(predicate))
      expect(root.schema).toBe(references.get(predicate));
    else references.set(predicate, root.schema);
  }
  expect(references.get(firstPredicate)).not.toBe(
    references.get(secondPredicate),
  );
});
