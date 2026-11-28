import type { Nullable } from '@aileron/declare';

import type { PointerSegment } from '@/schema-form/helpers/jsonPointer';

/**
 * Effect of one schema keyword on an issue's location: `move` descends one instance token,
 * `stay` applies to the same instance, `union` is a `oneOf`/`anyOf` branch, and `jump`
 * enters a reference or a definition without touching the instance.
 */
type SchemaStepKind = 'move' | 'stay' | 'union' | 'jump';

/** Argument a keyword consumes: none, a property-like name, an array index, or an index only in the tuple form. */
type SchemaStepArgument = 'none' | 'name' | 'index' | 'optional-index';

/** One keyword of a schema location, with its argument when it has one. */
export interface SchemaStep {
  /** How the keyword relates the schema location to the instance location. */
  readonly kind: SchemaStepKind;
  /** Keyword name as written in the location. */
  readonly keyword: string;
  /** Property key, definition name or decimal index consumed with the keyword. */
  readonly argument?: string;
  /** Number of location segments up to and including this keyword and its argument. */
  readonly end: number;
}

/** Schema-location grammar: every keyword an authored location may pass through, with its kind and argument. */
const GRAMMAR = new Map<string, readonly [SchemaStepKind, SchemaStepArgument]>([
  ['properties', ['move', 'name']],
  ['patternProperties', ['move', 'name']],
  ['prefixItems', ['move', 'index']],
  ['items', ['move', 'optional-index']],
  ['additionalProperties', ['move', 'none']],
  ['additionalItems', ['move', 'none']],
  ['contains', ['move', 'none']],
  ['unevaluatedProperties', ['move', 'none']],
  ['unevaluatedItems', ['move', 'none']],
  ['dependentSchemas', ['stay', 'name']],
  ['dependencies', ['stay', 'name']],
  ['allOf', ['stay', 'index']],
  ['not', ['stay', 'none']],
  ['if', ['stay', 'none']],
  ['then', ['stay', 'none']],
  ['else', ['stay', 'none']],
  ['propertyNames', ['stay', 'none']],
  ['oneOf', ['union', 'index']],
  ['anyOf', ['union', 'index']],
  ['$defs', ['jump', 'name']],
  ['definitions', ['jump', 'name']],
  ['$ref', ['jump', 'none']],
]);

/** A decimal array index as a location segment. */
const INDEX = /^\d+$/;

/**
 * Parse the keywords of a decoded schema location by the schema-location grammar. A key
 * argument is consumed as a key whatever it is called, so `properties/oneOf` is a property.
 * @param segments - Decoded location segments after the `#`.
 * @param end - Number of leading segments to parse; an issue location passes its length minus the failing keyword.
 * @returns The keywords in order, or null when a segment is not a grammar keyword, an argument is missing or malformed, or a segment is a pointer operator.
 */
export const parseSchemaLocation = (
  segments: readonly PointerSegment[],
  end: number,
): Nullable<SchemaStep[]> => {
  const steps: SchemaStep[] = [];
  for (let index = 0; index < end; index++) {
    const keyword = segments[index];
    if (typeof keyword !== 'string') return null;
    const rule = GRAMMAR.get(keyword);
    if (!rule) return null;
    const [kind, argument] = rule;
    const next = index + 1 < end ? segments[index + 1] : undefined;
    if (
      argument === 'none' ||
      (argument === 'optional-index' &&
        (typeof next !== 'string' || !INDEX.test(next)))
    ) {
      steps.push({ kind, keyword, end: index + 1 });
      continue;
    }
    if (typeof next !== 'string') return null;
    if (argument !== 'name' && !INDEX.test(next)) return null;
    index++;
    steps.push({ kind, keyword, argument: next, end: index + 1 });
  }
  return steps;
};
