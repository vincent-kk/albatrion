import { describe, expect, it } from 'vitest';

import { nodeFromJSONSchema } from '@/schema-form/__tests__/fixtures/nodeFromJSONSchema';
import { ValidationMode } from '@/schema-form/core/engine';
import { type FieldNode, adoptFieldNodeTree } from '@/schema-form/core/surface';

const createRoot = (): FieldNode =>
  nodeFromJSONSchema({
    jsonSchema: {
      type: 'object',
      properties: { field: { type: 'string' }, other: { type: 'string' } },
    },
    validationMode: ValidationMode.None,
  });

describe('external error attribution across adoption (208C-01)', () => {
  it('clears a cross-path child contribution from the new root list after adoption', () => {
    const root = createRoot();
    const cross = { dataPath: '/other', message: 'cross' };
    root.find('/field')!.setExternalErrors([cross]);
    expect(root.errors).toEqual([cross]);
    const replacement = createRoot();
    adoptFieldNodeTree(root, replacement);
    expect(replacement.errors).toEqual([cross]);
    replacement.find('/field')!.clearExternalErrors();
    expect(replacement.errors).toEqual([]);
  });

  it('replaces a cross-path child contribution in the new root list after adoption', () => {
    const root = createRoot();
    const first = { dataPath: '/other', message: 'a' };
    const second = { dataPath: '/elsewhere', message: 'b' };
    root.find('/field')!.setExternalErrors([first]);
    const replacement = createRoot();
    adoptFieldNodeTree(root, replacement);
    replacement.find('/field')!.setExternalErrors([second]);
    expect(replacement.errors).toEqual([second]);
  });
});
