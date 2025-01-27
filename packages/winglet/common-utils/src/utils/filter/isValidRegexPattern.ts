export const isValidRegexPattern = (pattern: string): pattern is string => {
  try {
    new RegExp(pattern);
    return true;
  } catch {
    return false;
  }
};
