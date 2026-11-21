import { escapeSegment } from '@/schema-form/helpers/jsonPointer';

/** Fast detection leaves ordinary identifiers untouched. */
// eslint-disable-next-line no-control-regex -- Encode HTML-unsafe code units deliberately.
const UNSAFE_TEST = /[\u0000-\u0020\u007F-\u009F\uD800-\uDFFF]/;

/** DOM delimiters and lone surrogates cannot survive HTML parsing unchanged. */
// eslint-disable-next-line no-control-regex -- Encode HTML-unsafe code units deliberately.
const UNSAFE_CHARACTER = /[\uD800-\uDBFF][\uDC00-\uDFFF]|[\u0000-\u0020\u007F-\u009F\uD800-\uDFFF]/g;

/**
 * Resolve the opaque identifiers of one field; no caller constructs a related id.
 * @param formId - Already pointer-escaped React Form scope.
 * @param path - Canonical JSON Pointer of the current field.
 * @param keyed - False skips the unused callback allocation for title-only consumers.
 * @returns Primary control, title and keyed control identifiers; keys compare as strings.
 */
export function resolveFieldIdentifiers(formId: string, path: string, keyed: false): { inputId: string; labelId: string };
/** Resolve identifiers including a callback bound to this field address. */
export function resolveFieldIdentifiers(formId: string, path: string, keyed?: true): { inputId: string; labelId: string; getInputId: (key: string | number) => string };
/** One construction site serves both title consumers and input bindings. */
export function resolveFieldIdentifiers(formId: string, path: string, keyed = true) {
  const base = escapeCharacters(formId + ':' + path);
  const inputId = base + '~input';
  const labelId = base + '~label';
  if (!keyed) return { inputId, labelId };
  const keyedPrefix = inputId + '.';
  return {
    inputId,
    labelId,
    getInputId: (key: string | number): string =>
      keyedPrefix + (typeof key === 'number' ? key : escapeCharacters(escapeSegment(String(key)))),
  };
}

/**
 * Encode HTML-unsafe code units without interpreting the identifier's contents.
 * @param value - Any identifier text, including controls and lone surrogates.
 * @returns Safe text with valid surrogate pairs preserved; the input is unchanged.
 */
const escapeCharacters = (value: string): string =>
  UNSAFE_TEST.test(value) ? value.replace(UNSAFE_CHARACTER, character => character.length === 2
    ? character
    : '~u' + character.charCodeAt(0).toString(16).padStart(4, '0')) : value;
