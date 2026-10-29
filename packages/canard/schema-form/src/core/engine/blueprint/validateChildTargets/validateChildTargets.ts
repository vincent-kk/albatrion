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
      {
        const values = controls?.fields;
        if (values != null) {
          for (let index = 0, limit = values.length; index < limit; index++) {
            if (!(index in values)) continue;
            const entry: { targets: string[] } = values[index];

            {
              for (const target of entry.targets) {
                let matchesEither = node.strategy === 'terminal';
                if (!matchesEither) {
                  let hasMatch = false;
                  for (const edge of node.childEntries) {
                    if (edge.name === target) {
                      hasMatch = true;
                      break;
                    }
                  }
                  matchesEither = !hasMatch;
                }
                if (matchesEither) {
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
    }
  }
};
