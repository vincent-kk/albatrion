// Deprecated alias coverage — Removed in 0.16.0 together with the aliases.
import { describe, expect, it } from 'vitest';

import {
  convertJSONPathToPointer,
  convertJsonPathToPointer,
} from '../JSONPath/index';
import { convertJsonPathToPointer as convertJsonPathToPointerFromCommon } from '../JSONPath/utils/common';
import {
  convertJSONPointerToPath,
  convertJsonPointerToPath,
} from '../JSONPointer/index';
import { convertJsonPointerToPath as convertJsonPointerToPathFromCommon } from '../JSONPointer/utils/common';
import {
  convertJsonPathToPointer as convertJsonPathToPointerFromRoot,
  convertJsonPointerToPath as convertJsonPointerToPathFromRoot,
} from '../index';

describe('deprecated alias exports', () => {
  it('resolves convertJsonPathToPointer to the same function as convertJSONPathToPointer', () => {
    expect(convertJsonPathToPointer).toBe(convertJSONPathToPointer);
    expect(convertJsonPathToPointerFromRoot).toBe(convertJSONPathToPointer);
    expect(convertJsonPathToPointerFromCommon).toBe(convertJSONPathToPointer);
  });

  it('resolves convertJsonPointerToPath to the same function as convertJSONPointerToPath', () => {
    expect(convertJsonPointerToPath).toBe(convertJSONPointerToPath);
    expect(convertJsonPointerToPathFromRoot).toBe(convertJSONPointerToPath);
    expect(convertJsonPointerToPathFromCommon).toBe(convertJSONPointerToPath);
  });
});
