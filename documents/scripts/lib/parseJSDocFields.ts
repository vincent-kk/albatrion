import { parseDescription } from './parseJSDocFields/parseDescription';
import { parseExamples } from './parseJSDocFields/parseExamples';
import { parseParams } from './parseJSDocFields/parseParams';
import { parseRemarks } from './parseJSDocFields/parseRemarks';
import { parseReturns } from './parseJSDocFields/parseReturns';
import { parseTemplates } from './parseJSDocFields/parseTemplates';
import type { ParsedFunction } from './types';

/** The parts of a page that come from a JSDoc block. */
export type JSDocFields = Pick<
  ParsedFunction,
  'description' | 'params' | 'returns' | 'templates' | 'examples' | 'remarks' | 'deprecated'
>;

/** Parse every field a page takes from a JSDoc block; a missing block yields empty fields. */
export function parseJSDocFields(jsdoc: string | null): JSDocFields {
  if (!jsdoc) {
    return { description: '', params: [], returns: undefined, templates: [], examples: [], remarks: undefined, deprecated: false };
  }
  return {
    description: parseDescription(jsdoc),
    params: parseParams(jsdoc),
    returns: parseReturns(jsdoc),
    templates: parseTemplates(jsdoc),
    examples: parseExamples(jsdoc),
    remarks: parseRemarks(jsdoc),
    deprecated: isDeprecated(jsdoc),
  };
}

/** Check whether a JSDoc comment block carries the deprecation tag (the literal is kept out of this comment so TypeScript does not deprecate this helper itself). */
function isDeprecated(jsdoc: string): boolean {
  return /@deprecated\b/.test(jsdoc);
}
