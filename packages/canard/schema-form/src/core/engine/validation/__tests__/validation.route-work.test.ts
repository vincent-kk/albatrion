import { expect, it, vi } from 'vitest';

import type { BlueprintSchema } from '@/schema-form/core/engine/blueprint';
import * as pointer from '@/schema-form/helpers/jsonPointer';

import { readFieldNodeErrors } from '../utils/read/readFieldNodeErrors';
import { requestFieldNodeValidation } from '../utils/run/requestFieldNodeValidation';
import { createRoutingTree } from './fixtures/createRoutingTree';

it('builds active IDs and resolves each issue once for one merged validation run', async () => {
  const properties = Object.fromEntries(
    Array.from({ length: 6 }, (_, i): [string, BlueprintSchema] => [
      'p' + i,
      { type: 'string', controls: { active: 'true' } },
    ]),
  );
  const issues = Object.keys(properties).map((name) => ({
    dataPath: '/' + name,
    message: name,
  }));
  const root = createRoutingTree({
    jsonSchema: { type: 'object', properties },
    defaultValue: Object.fromEntries(
      Object.keys(properties).map((name) => [name, 'a']),
    ),
    validationMode: 1,
    validator: { compile: () => () => issues, compileGuard: () => () => true },
  });
  for (const target of root.children ?? [])
    requestFieldNodeValidation(target, () => {});
  root.runtime.validationCadence?.cancel();
  const declarations = root.runtime.committedDeclarationIds;
  if (!declarations) throw new Error('Fixture has no active declarations');
  const activeIds = vi.spyOn(declarations, 'values');
  const paths = vi.spyOn(pointer, 'parsePointer');
  try {
    expect(root.runtime.validationRun?.()).toBe(true);
    await new Promise<void>((resolve) => setImmediate(resolve));
    expect(root.runtime.validationPending).toBe(false);
    expect(
      (root.children ?? []).every(
        (child) => readFieldNodeErrors(child).length === 1,
      ),
    ).toBe(true);
    expect(activeIds.mock.calls.length).toBeLessThanOrEqual(1);
    expect(paths.mock.calls.length).toBeLessThanOrEqual(issues.length);
  } finally {
    vi.restoreAllMocks();
  }
});
