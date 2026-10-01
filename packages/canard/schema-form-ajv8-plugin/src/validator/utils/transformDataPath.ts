import type { ErrorObject } from 'ajv';

/**
 * Converts an AJV instance path to the node that owns the issue.
 * @param error - AJV issue with its original instance pointer.
 * @param rejectedKey - Property represented separately from the host pointer.
 * @returns A JSON Pointer, including an empty pointer for the root.
 */
export const transformDataPath = (error: ErrorObject, rejectedKey: string | undefined): string => {
  if (error.keyword === 'required' && typeof error.params.missingProperty === 'string')
    return `${error.instancePath ?? ''}/${error.params.missingProperty.replace(/~/g, '~0').replace(/\//g, '~1')}`;
  if (error.keyword === 'false schema' && rejectedKey !== undefined)
    return error.instancePath.slice(0, error.instancePath.lastIndexOf('/'));
  return error.instancePath ?? '';
};
