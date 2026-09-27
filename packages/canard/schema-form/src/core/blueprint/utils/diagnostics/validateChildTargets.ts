import { readSchemaObject } from '../analyze/readSchemaObject';
import type { AnalysisContext } from '../analyze/type';
import { BlueprintErrorCode } from './constant';
import { throwBlueprintError } from './throwBlueprintError';

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
            BlueprintErrorCode.DiscriminatorMismatch,
            declaration.schemaPath,
            { discriminator, other: controls.discriminator },
            context.options,
          );
        discriminator = controls.discriminator;
      }
      controls?.children?.forEach(
        (entry: { targets: string[] }, index: number) => {
          for (const target of entry.targets)
            if (
              node.strategy === 'terminal' ||
              !node.childEntries.some((edge) => edge.name === target)
            )
              throwBlueprintError(
                BlueprintErrorCode.ChildrenTargetNotFound,
                `${declaration.schemaPath}/controls/children/${index}`,
                { target },
                context.options,
              );
        },
      );
    }
  }
};
