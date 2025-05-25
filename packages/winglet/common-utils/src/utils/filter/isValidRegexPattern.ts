/**
 * Function to check if a regex pattern is valid
 * @param pattern - Regex pattern to check
 * @returns true if the regex pattern is valid, false otherwise
 */
export const isValidRegexPattern = (pattern: string): pattern is string => {
  try {
    new RegExp(pattern);
    return true;
  } catch {
    return false;
  }
};
