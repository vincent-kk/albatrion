import {
  type FieldNode,
  type JSONSchema,
  ShowError,
  ValidationMode,
} from '@/schema-form';
import { compareObservations } from '@/schema-form/__tests__/fixtures/remountEquivalence/compareObservations';
import { createSceneValidator } from '@/schema-form/__tests__/fixtures/remountEquivalence/createSceneValidator';
import { locateNode } from '@/schema-form/__tests__/fixtures/remountEquivalence/locateNode';
import { prepareMasks } from '@/schema-form/__tests__/fixtures/remountEquivalence/prepareMasks';
import { readObservation } from '@/schema-form/__tests__/fixtures/remountEquivalence/readObservation';
import type {
  ObservationMask,
  RemountMismatch,
  RemountScene,
} from '@/schema-form/__tests__/fixtures/remountEquivalence/types';
import { renderForm } from '@/schema-form/__tests__/renderForm';

import { applyRenderWrite } from './applyRenderWrite';
import { readDomObservation } from './readDomObservation';

/**
 * Replay all prefixes through screen inputs and compare DOM plus FormHandle results.
 * @param scene - The same schema and writes used by the core corpus.
 * @returns Mismatches and writes the rendered readonly/disabled input ignored.
 */
export async function checkRenderScene(scene: RemountScene) {
  const mismatches: RemountMismatch[] = [];
  const ignored: number[] = [];
  const retained = new Map<string, FieldNode>();
  const updated = await renderForm(scene.schema as JSONSchema, {
    defaultValue: scene.initialValue,
    context: scene.context,
    validatorFactory: createSceneValidator(scene),
    showError: ShowError.Always,
    validationMode: ValidationMode.OnChange,
  });
  let firstDegraded = -1;
  try {
    for (let prefix = 0; prefix <= scene.writes.length; prefix++) {
      try {
        if (
          prefix &&
          !(await applyRenderWrite(updated, scene.writes[prefix - 1], retained))
        )
          ignored.push(prefix);
        await updated.flush();
        const masks = prepareMasks(
          scene,
          prefix,
          (path) => locateNode(updated.node('')!, path)?.jsonSchema,
        );
        const fresh = await renderForm(scene.schema as JSONSchema, {
          defaultValue: updated.handle.getValue(),
          context: updated.node('')!.context,
          validatorFactory: createSceneValidator(scene),
          showError: ShowError.Always,
          validationMode: ValidationMode.OnChange,
        });
        try {
          const differences = compareObservations(
            updated.handle.getErrors(),
            fresh.handle.getErrors(),
          ).map((difference) => ({
            ...difference,
            path: `/automaticErrors${difference.path}`,
          }));
          await updated.validate();
          await fresh.validate();
          const applied: Partial<Record<ObservationMask['category'], number>> =
            {};
          differences.push(
            ...compareObservations(
              readObservation(updated.node('')!),
              readObservation(fresh.node('')!),
              masks,
              applied,
            ),
          );
          differences.push(
            ...compareObservations(
              {
                value: updated.handle.getValue(),
                errors: updated.handle.getErrors(),
              },
              {
                value: fresh.handle.getValue(),
                errors: fresh.handle.getErrors(),
              },
            ).map((difference) => ({
              ...difference,
              path: `/handle${difference.path}`,
            })),
          );
          differences.push(
            ...compareObservations(
              readDomObservation(updated.container),
              readDomObservation(fresh.container),
            ).map((difference) => ({
              ...difference,
              path: `/dom${difference.path}`,
            })),
          );
          for (const category of [
            'omitEmpty',
            'omitTrailing',
            'fill',
            'lifecycle',
          ] as const)
            if (
              (applied[category] ?? 0) !==
              masks.filter((mask) => mask.category === category).length
            )
              differences.push({
                path: `/maskCount/${category}`,
                updated: applied[category] ?? 0,
                fresh: masks.filter((mask) => mask.category === category)
                  .length,
              });
          const degraded = updated.node('')!.diagnostics.status === 'degraded';
          if (degraded && firstDegraded < 0) firstDegraded = prefix;
          if (
            fresh.node('')!.diagnostics.status === 'degraded' ||
            firstDegraded === prefix
          )
            differences.push({
              path: '/diagnostics',
              updated: updated.node('')!.diagnostics,
              fresh: fresh.node('')!.diagnostics,
            });
          for (const warning of fresh
            .errorRecords()
            .filter((record) => record.level === 'warning'))
            if (
              !updated
                .errorRecords()
                .some(
                  (record) =>
                    record.code === warning.code &&
                    record.path === warning.path,
                )
            )
              differences.push({
                path: '/warnings',
                updated: updated.errorRecords(),
                fresh: warning,
              });
          if (differences.length)
            mismatches.push({
              scene: scene.id,
              seed: scene.seed,
              prefix,
              differences,
            });
        } finally {
          fresh.unmount();
        }
      } catch (error) {
        mismatches.push({
          scene: scene.id,
          seed: scene.seed,
          prefix,
          differences: [
            {
              path: '/operation',
              updated: {
                message: String(error),
                details:
                  error instanceof Error
                    ? Reflect.get(error, 'details')
                    : undefined,
              },
              fresh: 'completed',
            },
          ],
        });
      }
    }
  } finally {
    updated.unmount();
  }
  return { mismatches, ignored };
}
