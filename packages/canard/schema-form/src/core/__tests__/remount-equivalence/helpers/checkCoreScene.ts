import { compareObservations } from '@/schema-form/__tests__/fixtures/remountEquivalence/compareObservations';
import { encodeValue } from '@/schema-form/__tests__/fixtures/remountEquivalence/encodeValue';
import { locateNode } from '@/schema-form/__tests__/fixtures/remountEquivalence/locateNode';
import { prepareMasks } from '@/schema-form/__tests__/fixtures/remountEquivalence/prepareMasks';
import { readObservation } from '@/schema-form/__tests__/fixtures/remountEquivalence/readObservation';
import type {
  ObservationMask,
  RemountMismatch,
  RemountScene,
} from '@/schema-form/__tests__/fixtures/remountEquivalence/types';
import type { FieldNode } from '@/schema-form/core/surface';

import { applyCoreWrite } from './applyCoreWrite';
import { mountScene } from './mountScene';

/**
 * Compare every write prefix with a new mount of the public output.
 * @param scene - Deterministic schema, values and public write sequence.
 * @param report - Emit raw diagnostics when no task metadata sink is used.
 * @returns Every mismatch, including thrown operations and automatic validation.
 */
export async function checkCoreScene(
  scene: RemountScene,
  report = true,
): Promise<RemountMismatch[]> {
  const mismatches: RemountMismatch[] = [];
  const retained = new Map<string, FieldNode>();
  let updated: ReturnType<typeof mountScene>;
  try {
    updated = mountScene(scene, scene.initialValue);
  } catch (error) {
    return [
      {
        scene: scene.id,
        seed: scene.seed,
        prefix: 0,
        differences: [
          { path: '/mount', updated: String(error), fresh: 'mounted' },
        ],
      },
    ];
  }
  let firstDegraded = -1;
  for (let prefix = 0; prefix <= scene.writes.length; prefix++) {
    try {
      if (prefix)
        applyCoreWrite(updated.root, scene.writes[prefix - 1], retained);
      const masks = prepareMasks(
        scene,
        prefix,
        (path) => locateNode(updated.root, path)?.jsonSchema,
      );
      const fresh = mountScene(
        scene,
        updated.root.outputValue,
        updated.root.context,
      );
      await new Promise((resolve) => setImmediate(resolve));
      const automaticErrors = updated.root.globalErrors;
      const applied: Partial<Record<ObservationMask['category'], number>> = {};
      const differences = compareObservations(
        automaticErrors,
        fresh.root.globalErrors,
      ).map((difference) => ({
        ...difference,
        path: `/automaticErrors${difference.path}`,
      }));
      await updated.root.validate();
      await fresh.root.validate();
      differences.push(
        ...compareObservations(
          readObservation(updated.root),
          readObservation(fresh.root),
          masks,
          applied,
        ),
      );
      for (const category of [
        'omitEmpty',
        'omitTrailing',
        'fill',
        'lifecycle',
      ] as const) {
        const expected = masks.filter(
          (mask) => mask.category === category,
        ).length;
        if ((applied[category] ?? 0) !== expected)
          differences.push({
            path: `/maskCount/${category}`,
            updated: applied[category] ?? 0,
            fresh: expected,
          });
      }
      const degraded = updated.root.diagnostics.status === 'degraded';
      if (degraded && firstDegraded < 0) firstDegraded = prefix;
      if (
        fresh.root.diagnostics.status === 'degraded' ||
        firstDegraded === prefix
      )
        differences.push({
          path: '/diagnostics',
          updated: updated.root.diagnostics,
          fresh: fresh.root.diagnostics,
        });
      for (const warning of fresh.records.filter(
        (record) => record.level === 'warning',
      ))
        if (
          !updated.records.some(
            (record) =>
              record.code === warning.code && record.path === warning.path,
          )
        )
          differences.push({
            path: '/warnings',
            updated: updated.records,
            fresh: warning,
          });
      if (differences.length)
        mismatches.push({
          scene: scene.id,
          seed: scene.seed,
          prefix,
          differences,
        });
    } catch (error) {
      mismatches.push({
        scene: scene.id,
        seed: scene.seed,
        prefix,
        differences: [
          { path: '/operation', updated: String(error), fresh: 'completed' },
        ],
      });
    }
  }
  if (report && mismatches.length)
    console.log('REMOUNT_MISMATCH', JSON.stringify(encodeValue(mismatches)));
  return mismatches;
}
