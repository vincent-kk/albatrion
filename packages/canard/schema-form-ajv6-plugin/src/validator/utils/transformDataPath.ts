import type { ValidationIssue } from '@canard/schema-form';
import { convertJSONPathToPointer } from '@winglet/json/path-common';
import type { ErrorObject } from 'ajv';

/** Normalize Ajv 6 paths and attach the key rejected by a constraint. */
export const transformDataPath = (errors: ErrorObject[], root?: object): ValidationIssue[] => {
  const result = new Array<ValidationIssue>(errors.length);
  for (let i = 0, l = errors.length; i < l; i++) {
    const ajvError = errors[i];
    let convertedDataPath = convertJSONPathToPointer(ajvError.dataPath || '');
    if (convertedDataPath === '/') convertedDataPath = '';
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
    if (ajvError.keyword === 'false schema' && convertedDataPath) {
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
    if (ajvError.keyword === 'not' && root && ajvError.schemaPath.startsWith('#')) {
      const segments = ajvError.schemaPath.slice(2).split('/');
      let target: unknown = root;
      for (const segment of segments) {
        if (typeof target !== 'object' || target === null) break;
        target = (target as Record<string, unknown>)[segment.replace(/~1/g, '/').replace(/~0/g, '~')];
      }
      if (typeof target === 'object' && target !== null && 'required' in target &&
          Array.isArray(target.required) && target.required.length === 1 &&
          typeof target.required[0] === 'string') rejectedKey = target.required[0];
    }
    result[i] = {
      dataPath: convertedDataPath,
      schemaPath: ajvError.schemaPath,
      keyword: ajvError.keyword,
      message: ajvError.message,
      details: { ...ajvError.params },
      source: ajvError,
      ...(rejectedKey === undefined ? {} : { rejectedKey }),
    };
  }
  return result;
};
