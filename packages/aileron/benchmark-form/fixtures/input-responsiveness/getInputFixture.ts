import type { JSONSchema } from '@canard/schema-form';

import {
  buildArraySchema,
  buildFlatSchema,
} from '../../src/fixtures/scale-schemas';
import { branchFixtures } from '../equivalent/branches';
import { mountFixtures } from '../equivalent/mounts';
import type { InputFixture } from './types';

/**
 * Select the canonical equivalent schema and add only the requested browser interaction surface.
 * @param id - A case from cases.json
 * @param lane - L uses legacy controls; S/E use workspace controls
 * @returns A fresh schema and the observable DOM expectations
 * @throws When the case or equivalent fixture is absent
 */
export function getInputFixture(id: string, lane: string): InputFixture {
  const virtualized = id.endsWith('-virtualized');
  if (virtualized) id = id.slice(0, -'-virtualized'.length);
  const nested = id.includes('nested');
  const array = id.includes('array-1000');
  const fixture = mountFixtures.find(
    (row) =>
      row.name ===
      (nested ? 'nested-d5-f4' : array ? 'array-1000' : 'flat-500'),
  );
  if (!fixture) throw new Error(`Equivalent fixture missing: ${id}`);
  let schema = structuredClone(
    lane === 'L' ? fixture.legacy : fixture.workspace,
  );
  let target = nested ? '/n0/n0/n0/n0/n0' : '/field_000';
  let expectedInputs = nested ? 1024 : array ? 3000 : 500;
  if (id === 'replace-200-while-typing') {
    schema = buildArraySchema(0);
    schema.properties!.typing = buildFlatSchema(1).properties!.field_000;
    target = '/typing';
    expectedInputs = 1;
  }
  if (id === 'switch-oneOf-20') {
    const branches = branchFixtures.find((row) => row.name === 'oneOf-20')!;
    schema = structuredClone(
      lane === 'L' ? branches.legacy : branches.workspace,
    );
    schema.properties!.kind!.enum = Array.from(
      { length: 20 },
      (_, index) => `kind_${index}`,
    );
    target = '/kind';
    expectedInputs = 5;
  }
  if (id.startsWith('validation-')) {
    let leaf = schema;
    for (const segment of target.slice(1).split('/'))
      leaf = leaf.properties![segment] as JSONSchema;
    leaf.pattern = '^(?:..)*$';
  }
  return {
    id,
    schema,
    target,
    expectedInputs,
    validation:
      id === 'type-flat-500' ||
      id === 'type-nested-d5-f4' ||
      id.startsWith('validation-'),
    parentState: id.endsWith('-plain')
      ? 'plain'
      : id.endsWith('-transition')
        ? 'transition'
        : undefined,
    mount: id.startsWith('mount-'),
    virtualization:
      virtualized || (id.startsWith('mount-') && id.endsWith('-on')),
    intervalMs: id.endsWith('-nonburst') ? 100 : 0,
  };
}
