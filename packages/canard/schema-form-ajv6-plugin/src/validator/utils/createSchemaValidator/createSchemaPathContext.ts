import { collectSchemaResources } from '../schemaPath/collectSchemaResources';
import { createChildSchemaPathTest } from '../schemaPath/createChildSchemaPathTest';
import { createNotRequiredKeyLookup } from '../schemaPath/createNotRequiredKeyLookup';
import { isChildSchemaPath } from '../schemaPath/isChildSchemaPath';

/**
 * Prepare path metadata only for errors whose location depends on schema structure.
 * @param compiled - Authored snapshot retained by the compiled validator.
 * @param legacyId - Whether this native profile recognizes draft-04 identifiers.
 * @param hasResources - Whether registration found identifiers in this snapshot.
 * @returns Cached classifiers for false-schema and not.required errors.
 */
export const createSchemaPathContext = (
  compiled: object,
  legacyId: boolean,
  hasResources: boolean,
) => {
  let resources: ReturnType<typeof collectSchemaResources> | undefined;
  const getResources = () => resources ??= hasResources || legacyId
    ? collectSchemaResources(compiled, legacyId)
    : [];
  return {
    isChildPath: hasResources || legacyId
      ? createChildSchemaPathTest(getResources)
      : isChildSchemaPath,
    notRequiredKeyOf: createNotRequiredKeyLookup(compiled, getResources),
  };
};
