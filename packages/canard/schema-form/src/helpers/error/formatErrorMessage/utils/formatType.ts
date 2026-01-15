/**
 * Formats a type value (handles array types like ['string', 'null']).
 * @param type - Type value (string or array)
 * @param fallback - Fallback value if type is undefined
 * @returns Formatted type string
 */
export const formatType = (type: unknown, fallback = '(undefined)'): string => {
  if (type === undefined || type === null) return fallback;
  if (Array.isArray(type)) return type.join(' | ');
  return String(type);
};
