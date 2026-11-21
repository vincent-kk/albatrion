import type { ValidationIssue } from '@canard/schema-form';
import { toJSONPointer } from './dataPath/toJSONPointer';
import type { ErrorObject } from 'ajv';

import type { Dictionary } from '@aileron/declare';

import { isChildSchemaPath } from './isChildSchemaPath';
import { collectSchemaResources, type SchemaResource } from './schemaPath/collectSchemaResources';
import { localizeSchemaPath } from './schemaPath/localizeSchemaPath';

/** Normalize Ajv 6 paths and attach the key rejected by a constraint. */
export const transformDataPath = (errors: ErrorObject[], root?: object, schemaId?: string): ValidationIssue[] => {
  let resources: SchemaResource[] | undefined;
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
    const path = ajvError.schemaPath;
    const routed = ajvError.keyword === 'not' || ajvError.keyword === 'false schema';
    const local = routed && root && !path.startsWith('#/')
      ? localizeSchemaPath(path, resources ??= collectSchemaResources(root, schemaId))
      : undefined;
    if (ajvError.keyword === 'false schema' && convertedDataPath && isChildSchemaPath(local?.path ?? path)) {
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
    if (ajvError.keyword === 'not' && (local || path.startsWith('#/'))) {
      const segments = (local?.path ?? path).slice(2).split('/');
      let target: unknown = local?.schema ?? root;
      for (const segment of segments) {
        const token = segment.includes('%') ? decodeURIComponent(segment) : segment;
        target = typeof target === 'object' && target !== null
          ? (target as Dictionary<unknown>)[token.replace(/~1/g, '/').replace(/~0/g, '~')]
          : undefined;
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
