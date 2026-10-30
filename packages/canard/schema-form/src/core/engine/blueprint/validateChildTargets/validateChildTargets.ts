import type { Optional } from '@aileron/declare';

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
    let discriminator: Optional<string>;
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

      const controlFields = controls?.fields;
      if (controlFields != null) {
        for (
          let index = 0, limit = controlFields.length;
          index < limit;
          index++
        ) {
          if (!(index in controlFields)) continue;
          const entry: { targets: string[] } = controlFields[index];

          for (const target of entry.targets) {
            let hasMissingTarget = node.strategy === 'terminal';
            if (!hasMissingTarget) {
              let hasNamedChild = false;
              for (const edge of node.childEntries) {
                if (edge.name === target) {
                  hasNamedChild = true;
                  break;
                }
              }
              hasMissingTarget = !hasNamedChild;
            }
            if (hasMissingTarget) {
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
        }
      }
    }
  }
};
