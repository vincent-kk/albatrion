import { FormErrorCode } from '../../../../../../../errors';
import type { AnalysisContext } from '../../../../types/analysis';
import { throwBlueprintError } from '../../../../utils/diagnostics/throwBlueprintError';

/**
 * Validate and normalize a resource identifier under its enclosing base.
 * @param identifier - Authored resource URI, without a non-empty fragment.
 * @param base - Enclosing resource URI, or the root's synthetic base.
 * @param schemaPath - Authored position used by construction diagnostics.
 * @param context - Analysis options controlling diagnostic handling.
 * @returns Absolute resource identity without an empty fragment marker.
 */
export const resolveResourceIdentifier = (
  identifier: string,
  base: string,
  schemaPath: string,
  context: AnalysisContext,
): string => {
  try {
    const uri = new URL(identifier, base);
    if (uri.hash)
      throw new Error(
        'A schema resource identifier cannot contain a non-empty fragment.',
      );
    return uri.href.replace(/#$/, '');
  } catch (cause) {
    return throwBlueprintError(
      FormErrorCode.UnknownJsonSchema,
      schemaPath,
      {
        identifier,
        cause,
        guidance:
          'The identifier must establish a valid local schema resource base.',
      },
      context.options,
    );
  }
};
