import type { ErrorObject } from 'ajv';

export const transformDataPath = (errors: ErrorObject[]): ErrorObject[] => {
  for (let i = 0; i < errors.length; i++) {
    const error = errors[i];
    if (error.keyword === 'required' && 'missingProperty' in error.params) {
      const dataPath = error.dataPath || '';
      error.dataPath = dataPath
        ? dataPath + '.' + error.params.missingProperty
        : '.' + error.params.missingProperty;
    } else error.dataPath = error.dataPath || '';
  }
  return errors;
};
