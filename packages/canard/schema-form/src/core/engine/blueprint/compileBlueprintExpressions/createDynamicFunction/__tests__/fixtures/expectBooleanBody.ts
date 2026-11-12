import { expect } from 'vitest';

/**
 * Compare generated boolean code with the authored JavaScript result.
 * @param body - Original statements evaluated inside the same sample lexical context
 * @param transformed - Compiler output whose observable result is checked
 */
export const expectBooleanBody = (body: string, transformed: string): void => {
  const prelude = `const a = 1, b = 2, c = 3, d = 4, e = 5, v = 1;
    const x = 1, y = 2, value = 1, result = 1, valid = true, cond = true;
    const name = "sample", fallback = "fallback", func = () => 2, cleanup = () => {};
    const obj = { prop: 1, method: () => ({ chain: () => 2 }) };`;
  const original = new Function('dependencies', prelude + '\nreturn (() => {\n' + body + '\n})();');
  const compiled = new Function('dependencies', prelude + '\n' + transformed);
  for (const dependencies of [[1, 2, 3], [0, 0, 0], ['premium', 200], ['admin', 50], [{ active: true }, 1], ['', 1]])
    expect(compiled(dependencies)).toBe(!!original(dependencies));
};
