import { appendSegment } from '@/schema-form/helpers/jsonPointer';

import { FormErrorCode } from '../../../../errors';
import type { AnalysisContext } from '../types/analysis';
import { readSchemaObject } from '../utils/analyze/readSchemaObject';
import { throwBlueprintError } from '../utils/diagnostics/throwBlueprintError';

/**
 * Validate direct-child names against complete real, lifted, and virtual shape.
 * @param context - Completed finite graph and authored diagnostics context
 * @returns Nothing; reports nonexistent targets even when their declarations are gated
 */
export const validateChildTargets = (context: AnalysisContext): void => {
  for (const node of context.nodes) {
    let discriminator: string | undefined;
    for (const declaration of node.declarations) {
      const controls = readSchemaObject(declaration.schema).controls;
      if (controls?.discriminator !== undefined) {
        if (
          discriminator !== undefined &&
          discriminator !== controls.discriminator
        )
          throwBlueprintError(
            FormErrorCode.DiscriminatorMismatch,
            declaration.schemaPath,
            {
              propertyName: discriminator,
              other: controls.discriminator,
              reason: 'key',
            },
            context.options,
          );
        discriminator = controls.discriminator;
      }
      (() => {
        const values = controls?.fields;
        if (values == null) return undefined;
        for (
          let position = 0, limit = values.length;
          position < limit;
          position++
        ) {
          if (!(position in values)) continue;
          const item = values[position];
          const entry: { targets: string[] } = item;
          const index: number = position;
          {
            for (const target of entry.targets)
              if (
                node.strategy === 'terminal' ||
                !(() => {
                  const items = node.childEntries;
                  for (
                    let index = 0, count = items.length;
                    index < count;
                    index++
                  ) {
                    if (!(index in items)) continue;
                    const edge = items[index];
                    if (edge.name === target) return true;
                  }
                  return false;
                })()
              )
                throwBlueprintError(
                  FormErrorCode.ChildrenTargetNotFound,
                  appendSegment(
                    appendSegment(
                      appendSegment(declaration.schemaPath, 'controls'),
                      'fields',
                    ),
                    index,
                  ),
                  { target },
                  context.options,
                );
          }
        }
      })();
    }
  }
};
