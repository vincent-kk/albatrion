/** Entire JSON number text, excluding legacy octal and non-finite spellings. */
const JSON_NUMBER = /^-?(0|[1-9]\d*)(\.\d+)?([eE][+-]?\d+)?$/;

/** Parse a whole numeric string while rejecting unsafe integer notation. */
export const parseNumber = (value: string): number | undefined => {
  const text = value.trim();
  if (!JSON_NUMBER.test(text)) return undefined;
  const parsed = Number(text);
  if (!Number.isFinite(parsed)) return undefined;
  if (!/[.eE]/.test(text) && !Number.isSafeInteger(parsed)) return undefined;
  return parsed;
};
