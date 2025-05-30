import { getKeys, hasOwnProperty } from '@/common-utils';

// Dirty check if obj is different from mirror, generate patches and update mirror
function _generate(
  mirror: any,
  obj: any,
  patches: any,
  path: any,
  invertible: any,
) {
  if (obj === mirror) {
    return;
  }

  if (typeof obj.toJSON === 'function') {
    obj = obj.toJSON();
  }

  var newKeys = getKeys(obj);
  var oldKeys = getKeys(mirror);
  var changed = false;
  var deleted = false;

  //if ever "move" operation is implemented here, make sure this test runs OK: "should not generate the same patch twice (move)"

  for (var t = oldKeys.length - 1; t >= 0; t--) {
    var key = oldKeys[t];
    var oldVal = mirror[key];

    if (
      hasOwnProperty(obj, key) &&
      !(
        obj[key] === undefined &&
        oldVal !== undefined &&
        Array.isArray(obj) === false
      )
    ) {
      var newVal = obj[key];

      if (
        typeof oldVal == 'object' &&
        oldVal != null &&
        typeof newVal == 'object' &&
        newVal != null &&
        Array.isArray(oldVal) === Array.isArray(newVal)
      ) {
        _generate(
          oldVal,
          newVal,
          patches,
          path + '/' + escapePointer(key),
          invertible,
        );
      } else {
        if (oldVal !== newVal) {
          changed = true;
          if (invertible) {
            patches.push({
              op: 'test',
              path: path + '/' + escapePointer(key),
              value: _deepClone(oldVal),
            });
          }
          patches.push({
            op: 'replace',
            path: path + '/' + escapePointer(key),
            value: _deepClone(newVal),
          });
        }
      }
    } else if (Array.isArray(mirror) === Array.isArray(obj)) {
      if (invertible) {
        patches.push({
          op: 'test',
          path: path + '/' + escapePointer(key),
          value: _deepClone(oldVal),
        });
      }
      patches.push({
        op: 'remove',
        path: path + '/' + escapePointer(key),
      });
      deleted = true; // property has been deleted
    } else {
      if (invertible) {
        patches.push({ op: 'test', path, value: mirror });
      }
      patches.push({ op: 'replace', path, value: obj });
      changed = true;
    }
  }

  if (!deleted && newKeys.length == oldKeys.length) {
    return;
  }

  for (var t = 0; t < newKeys.length; t++) {
    var key = newKeys[t];
    if (!hasOwnProperty(mirror, key) && obj[key] !== undefined) {
      patches.push({
        op: 'add',
        path: path + '/' + escapePointer(key),
        value: _deepClone(obj[key]),
      });
    }
  }
}
/**
 * Create an array of patches from the differences in two objects
 */
export function compare(
  tree1: Object | Array<any>,
  tree2: Object | Array<any>,
  invertible = false,
): Operation[] {
  const patches: Operation[] = [];
  _generate(tree1, tree2, patches, '', invertible);
  return patches;
}

export type Operation =
  | AddOperation<any>
  | RemoveOperation
  | ReplaceOperation<any>
  | MoveOperation
  | CopyOperation
  | TestOperation<any>
  | GetOperation<any>;

export interface Validator<T> {
  (
    operation: Operation,
    index: number,
    document: T,
    existingPathFragment: string,
  ): void;
}

export interface OperationResult<T> {
  removed?: any;
  test?: boolean;
  newDocument: T;
}

export interface BaseOperation {
  path: string;
}

export interface AddOperation<T> extends BaseOperation {
  op: 'add';
  value: T;
}

export interface RemoveOperation extends BaseOperation {
  op: 'remove';
}

export interface ReplaceOperation<T> extends BaseOperation {
  op: 'replace';
  value: T;
}

export interface MoveOperation extends BaseOperation {
  op: 'move';
  from: string;
}

export interface CopyOperation extends BaseOperation {
  op: 'copy';
  from: string;
}

export interface TestOperation<T> extends BaseOperation {
  op: 'test';
  value: T;
}

export interface GetOperation<T> extends BaseOperation {
  op: '_get';
  value: T;
}

export function _deepClone(obj: any) {
  switch (typeof obj) {
    case 'object':
      return JSON.parse(JSON.stringify(obj)); //Faster than ES5 clone - http://jsperf.com/deep-cloning-of-objects/5
    case 'undefined':
      return null; //this is how JSON.stringify behaves for array items
    default:
      return obj; //no need to clone primitives
  }
}
export function escapePointer(path: string): string {
  if (path.indexOf('/') === -1 && path.indexOf('~') === -1) return path;
  return path.replace(/~/g, '~0').replace(/\//g, '~1');
}
