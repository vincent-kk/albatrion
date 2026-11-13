import { clone } from '@winglet/common-utils/object';
import { escapeSegment } from '@winglet/json/pointer';

import { JSONSchemaScanError } from '../JSONSchemaScanner/utils/error/JSONSchemaScanError';
import { writeProperty } from './writeProperty';

/** A checkpoint belongs to one active container on the clone's explicit DFS stack. */
interface CloneCheckpoint {
  /** Explicit stack depth, always a power of two at least 256. */
  depth: number;
  /** Source container compared with deeper source values. */
  schema: object;
}

/**
 * Clone plain JSON containers iteratively, with separate copies for repeated occurrences.
 * @param input Value to copy; non-plain values delegate to the generic clone.
 * @param inspect Optional preparation hook called before copying each plain container.
 * @returns A copy retaining array holes and own __proto__ data, without symbol keys on plain containers.
 * @throws JSONSchemaScanError when a plain-container ancestry contains a physical cycle.
 */
export function cloneSchema<Type>(
  input: Type,
  inspect?: (
    source: object,
    target: object,
    path: string,
    keys: readonly string[],
  ) => void,
): Type {
  if (input === null || typeof input !== 'object') return input;
  const prototype = Object.getPrototypeOf(input);
  if (
    !Array.isArray(input) &&
    prototype !== Object.prototype &&
    prototype !== null
  )
    return clone(input);
  let source = input as Record<string, unknown>;
  let target = (
    Array.isArray(input)
      ? new Array(input.length)
      : prototype === null
        ? Object.create(null)
        : {}
  ) as Record<string, unknown>;
  const output = target;
  let keys = Object.keys(source);
  let index = 0;
  let path = '#';
  let paths: string[] | undefined;
  if (inspect) inspect(source, target, path, keys);
  let sources: Record<string, unknown>[] | undefined;
  let targets: Record<string, unknown>[] | undefined;
  let keyLists: string[][] | undefined;
  let indices: number[] | undefined;
  let depth = 0;
  let checkpoints: CloneCheckpoint[] | undefined;
  let checkpoint: CloneCheckpoint | undefined;
  while (true) {
    if (index === keys.length) {
      if (
        depth >= 256 &&
        checkpoint !== undefined &&
        checkpoint.depth === depth
      ) {
        checkpoints!.pop();
        checkpoint = checkpoints![checkpoints!.length - 1];
      }
      if (sources === undefined || sources.length === 0) return output as Type;
      source = sources.pop()!;
      target = targets!.pop()!;
      keys = keyLists!.pop()!;
      index = indices!.pop()!;
      if (inspect) path = paths!.pop()!;
      depth--;
      continue;
    }
    const key = keys[index++];
    const value = source[key];
    if (value === null || typeof value !== 'object') {
      writeProperty(target, key, value);
      continue;
    }
    const childPrototype = Object.getPrototypeOf(value);
    if (
      !Array.isArray(value) &&
      childPrototype !== Object.prototype &&
      childPrototype !== null
    ) {
      writeProperty(target, key, clone(value));
      continue;
    }
    if (sources === undefined) {
      sources = [];
      targets = [];
      keyLists = [];
      indices = [];
    }
    if (depth >= 256) {
      if ((depth & (depth - 1)) === 0 && checkpoint?.depth !== depth) {
        checkpoint = { depth, schema: source };
        (checkpoints ??= []).push(checkpoint);
      }
      if (checkpoint !== undefined && value === checkpoint.schema)
        throw new JSONSchemaScanError(
          'schema-cycle',
          'Physical cycle while copying a schema value',
        );
    }
    const child = (
      Array.isArray(value)
        ? new Array(value.length)
        : childPrototype === null
          ? Object.create(null)
          : {}
    ) as Record<string, unknown>;
    writeProperty(target, key, child);
    sources.push(source);
    targets!.push(target);
    keyLists!.push(keys);
    indices!.push(index);
    if (inspect) {
      (paths ??= []).push(path);
      path += '/' + escapeSegment(key);
    }
    source = value as Record<string, unknown>;
    target = child;
    keys = Object.keys(source);
    index = 0;
    if (inspect) inspect(source, target, path, keys);
    depth++;
  }
}
