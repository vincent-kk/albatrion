import type { Token, TraversalState } from '../type';
import { getGraphKind } from './getGraphKind';

/** Discovers references once and encodes scalars; rejects unsupported values. */
export function toToken(value: unknown, state: TraversalState): Token {
  if (value === null) return ['null'];
  switch (typeof value) {
    case 'undefined':
      return ['undefined'];
    case 'boolean':
      return ['boolean', value];
    case 'string':
      return ['string', value];
    case 'number':
      return [
        'number',
        Object.is(value, -0)
          ? '-0'
          : Number.isFinite(value)
            ? value
            : String(value),
      ];
    case 'bigint':
      return ['bigint', String(value)];
    case 'function':
    case 'symbol':
      if (state.options.opaque) return ['opaque', state.options.opaque(value)];
      throw new TypeError('Unsupported graph value');
    case 'object': {
      if (!getGraphKind(value)) {
        if (state.options.opaque)
          return ['opaque', state.options.opaque(value)];
        throw new TypeError('Unsupported graph object');
      }
      let index = state.seen.get(value);
      if (index === undefined) {
        index = state.objects.length;
        if (index >= 100000) throw new TypeError('Graph node limit exceeded');
        state.seen.set(value, index);
        state.objects.push(value);
      }
      return ['ref', index];
    }
    default:
      throw new TypeError('Unsupported graph value');
  }
}
