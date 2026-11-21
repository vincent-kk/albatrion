import type { ValidationIssue } from '@canard/schema-form';
import { toJSONPointer } from './dataPath/toJSONPointer';
import { isChildSchemaPath } from './schemaPath/isChildSchemaPath';
import type { ErrorObject } from 'ajv';

/**
 * Normalize Ajv 6 paths and attach the key rejected by a constraint.
 * @param errors - AJV6 issues of one validation run.
 * @param isChildPath - Classifier of a `false schema` issue's schema path: `isChildSchemaPath` for
 *   a root without resources, which is the default, or `createChildSchemaPathTest` for one with them.
 * @param notRequiredKeyOf - Lookup from a `not` issue's schema path to the single name its schema
 *   requires (see `createNotRequiredKeyLookup`); without it `not` issues carry no rejected key.
 * @param getContext - Lazy metadata for special schema-dependent paths, unused by ordinary errors.
 * @returns One issue per AJV6 issue, in order, with a JSON Pointer data path.
 */
export const transformDataPath = (
  errors: ErrorObject[],
  isChildPath: (schemaPath: string) => boolean = isChildSchemaPath,
  notRequiredKeyOf?: (schemaPath: string) => string | undefined,
  getContext?: () => {
    isChildPath: (schemaPath: string) => boolean;
    notRequiredKeyOf: (schemaPath: string) => string | undefined;
  },
): ValidationIssue[] => {
  const result = new Array<ValidationIssue>(errors.length);
  for (let i = 0, l = errors.length; i < l; i++) {
    const ajvError = errors[i];
    let convertedDataPath = toJSONPointer(ajvError.dataPath || '');
    let rejectedKey: string | undefined;
    if (
      ajvError.keyword === 'required' &&
      ajvError.params &&
      'missingProperty' in ajvError.params
    ) {
      const missingProperty = ajvError.params.missingProperty;
      if (typeof missingProperty === 'string')
        convertedDataPath += `/${missingProperty.replace(/~/g, '~0').replace(/\//g, '~1')}`;
    }
    if (ajvError.keyword === 'false schema' && convertedDataPath &&
      (getContext?.().isChildPath ?? isChildPath)(ajvError.schemaPath)) {
      const lastSlash = convertedDataPath.lastIndexOf('/');
      rejectedKey = convertedDataPath.slice(lastSlash + 1)
        .replace(/~1/g, '/').replace(/~0/g, '~');
      convertedDataPath = convertedDataPath.slice(0, lastSlash);
    }
    if (ajvError.keyword === 'additionalProperties' && 'additionalProperty' in ajvError.params)
      rejectedKey = String(ajvError.params.additionalProperty);
    if (ajvError.keyword === 'unevaluatedProperties' && 'unevaluatedProperty' in ajvError.params)
      rejectedKey = String(ajvError.params.unevaluatedProperty);
    if (ajvError.keyword === 'propertyNames' && 'propertyName' in ajvError.params)
      rejectedKey = String(ajvError.params.propertyName);
    if (typeof ajvError.propertyName === 'string')
      rejectedKey = ajvError.propertyName;
    if (ajvError.keyword === 'not')
      rejectedKey = (notRequiredKeyOf ?? getContext?.().notRequiredKeyOf)?.(ajvError.schemaPath) ?? rejectedKey;
    const issue: ValidationIssue = {
      dataPath: convertedDataPath,
      schemaPath: ajvError.schemaPath,
      keyword: ajvError.keyword,
      message: ajvError.message,
      details: { ...ajvError.params },
      source: ajvError,
    };
    if (rejectedKey !== undefined) issue.rejectedKey = rejectedKey;
    result[i] = issue;
  }
  return result;
};
