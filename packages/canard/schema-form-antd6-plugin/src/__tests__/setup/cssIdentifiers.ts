import { afterEach, beforeEach } from 'vitest';

/** CSS identifier escapes used by JSDOM's selector engine for scoped control addresses. */
const escapeIdentifier = (value: string) =>
  Array.from(
    String(value),
    (character) => `\\${(character.codePointAt(0) || 0xfffd).toString(16)} `,
  ).join('');

const originalEscape = globalThis.escape;

// NWSAPI builds :scope selectors with global escape; URI escapes are not CSS identifiers.
beforeEach(() => {
  globalThis.escape = escapeIdentifier;
});
afterEach(() => {
  globalThis.escape = originalEscape;
});
