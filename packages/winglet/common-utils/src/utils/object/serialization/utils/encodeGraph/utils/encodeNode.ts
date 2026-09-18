import type { GraphNode, TraversalState } from '../type';
import { getGraphKind } from './getGraphKind';
import { readProperties } from './readProperties';
import { toToken } from './toToken';

/** Encodes a discovered node and accounts for retained edges and array capacity. */
export function encodeNode(value: object, state: TraversalState): GraphNode {
  if (Object.getOwnPropertySymbols(value).length)
    throw new TypeError('Unsupported symbol property');
  const kind = getGraphKind(value);
  if (kind === 'object')
    return [
      'object',
      Object.getPrototypeOf(value) === null ? 'null' : 'plain',
      readProperties(value, state),
    ];
  if (kind === 'array') {
    const length = (value as unknown[]).length;
    state.arrayLength += length;
    if (state.arrayLength > 1000000)
      throw new TypeError('Graph array length limit exceeded');
    return ['array', length, readProperties(value, state)];
  }
  if (Object.keys(value).length)
    throw new TypeError('Unsupported extra builtin properties');
  switch (kind) {
    case 'date':
      return ['date', toToken(Date.prototype.getTime.call(value), state)];
    case 'map': {
      const entries = [];
      for (const [key, item] of Map.prototype.entries.call(value)) {
        if (++state.entries > 1000000)
          throw new TypeError('Graph entry limit exceeded');
        entries.push([toToken(key, state), toToken(item, state)]);
      }
      return ['map', entries];
    }
    case 'set': {
      const entries = [];
      for (const item of Set.prototype.values.call(value)) {
        if (++state.entries > 1000000)
          throw new TypeError('Graph entry limit exceeded');
        entries.push(toToken(item, state));
      }
      return ['set', entries];
    }
    case 'regexp': {
      const source = Object.getOwnPropertyDescriptor(
        RegExp.prototype,
        'source',
      )!.get!.call(value);
      let flags = '';
      for (const [name, flag] of [
        ['hasIndices', 'd'],
        ['global', 'g'],
        ['ignoreCase', 'i'],
        ['multiline', 'm'],
        ['dotAll', 's'],
        ['unicode', 'u'],
        ['unicodeSets', 'v'],
        ['sticky', 'y'],
      ]) {
        if (
          Object.getOwnPropertyDescriptor(RegExp.prototype, name)?.get?.call(
            value,
          )
        )
          flags += flag;
      }
      return [
        'regexp',
        source,
        flags,
        toToken(
          Object.getOwnPropertyDescriptor(value, 'lastIndex')!.value,
          state,
        ),
      ];
    }
    default:
      throw new TypeError('Unsupported graph node');
  }
}
