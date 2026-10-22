import type { RemountScene } from '@/schema-form/__tests__/fixtures/remountEquivalence/types';
import { type AuthoredSchema, ValidationMode } from '@/schema-form/core/engine';
import { buildFieldNodeTree, mountFieldNode } from '@/schema-form/core/surface';

import { createTestValidator } from '../../fixtures/createTestValidator';

/**
 * Compile and mount a wholly independent tree; no blueprint is reused.
 * @param scene - Authored schema and initial context.
 * @param value - Value loaded by this tree's mount.
 * @param context - Current context, shared as immutable data only.
 * @returns Public root and all reported warnings/errors for that lifetime.
 */
export function mountScene(
  scene: RemountScene,
  value: unknown,
  context = scene.context ?? {},
) {
  const records: { code: string; path?: string; level: string }[] = [];
  const root = buildFieldNodeTree({
    jsonSchema: scene.schema as AuthoredSchema,
    defaultValue: value,
    context,
    validationMode: ValidationMode.OnChange,
    validator: createTestValidator(),
    errorReporter: {
      hasConsumer: () => true,
      report: (record) => records.push(record),
    },
  });
  mountFieldNode(root);
  return { root, records };
}
