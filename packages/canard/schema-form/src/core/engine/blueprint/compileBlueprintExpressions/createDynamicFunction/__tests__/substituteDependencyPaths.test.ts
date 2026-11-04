import { describe, expect, it } from 'vitest';

import { JSON_POINTER_PATH_REGEX } from '../../../utils/expressions/regex';
import { substituteDependencyPaths } from '../utils/substituteDependencyPaths';
import { getPathManager } from '../../getPathManager';

describe('dependency substitution identity', () => {
  it.each([
    " ./kind === 'a'; ",
    './a + ./b + ./a',
    "'./inside' === ./outside",
    '../x === #/root',
    '@ === ./a',
    '{ return ./a; }',
    '   ',
    './a;;',
  ])('retains the inline chain and numbering for %s', (source) => {
    const expectedManager = getPathManager();
    const expected = source
      .replace(JSON_POINTER_PATH_REGEX, (path) => {
        expectedManager.set(path);
        return 'dependencies[' + expectedManager.findIndex(path) + ']';
      })
      .trim()
      .replace(/;$/, '');
    const manager = getPathManager();
    expect(substituteDependencyPaths(manager, source)).toBe(expected);
    expect(manager.get()).toEqual(expectedManager.get());
  });
});
