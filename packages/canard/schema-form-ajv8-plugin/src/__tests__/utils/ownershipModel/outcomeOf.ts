/** Capture native and plugin outcomes without treating execution errors as validation verdicts. */
export const outcomeOf = async (action: () => unknown) => {
  try {
    const value = await action();
    if (Array.isArray(value))
      return {
        issues: value
          .map((issue) => ({
            keyword: issue.keyword,
            dataPath: issue.dataPath,
          }))
          .sort((a, b) => JSON.stringify(a).localeCompare(JSON.stringify(b))),
      };
    return { value };
  } catch (error) {
    if (
      error &&
      typeof error === 'object' &&
      'errors' in error &&
      Array.isArray(error.errors)
    )
      return {
        issues: error.errors
          .map((issue) => ({
            keyword: issue.keyword,
            dataPath: issue.dataPath ?? issue.instancePath,
          }))
          .sort((a, b) => JSON.stringify(a).localeCompare(JSON.stringify(b))),
      };
    return {
      error: error instanceof Error ? error.constructor.name : typeof error,
      message: error instanceof Error ? error.message : String(error),
    };
  }
};
