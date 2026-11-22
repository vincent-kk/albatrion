import { expect, it } from 'vitest';
import { applyPatch, convertJSONPathToPointer, convertJSONPointerToPath } from '@/json';
it('RG3: repeated and trailing empty tokens survive every canonical nonnumeric position', () => {
  for (let left = 0; left < 8; left++) for (let right = 0; right < 8; right++) {
    const pointer = '/' + [...Array(left).fill(''), 'key', ...Array(right).fill('')].join('/');
    expect(convertJSONPathToPointer(convertJSONPointerToPath(pointer)), pointer).toBe(pointer);
  }
});
it('RG1: sequential immutable patches preserve null containers through copy and move', () => {
  for (const op of ['copy', 'move'] as const) {
    const root = Object.assign(Object.create(null), { a: Object.assign(Object.create(null), { x: 1 }), b: Object.create(null) });
    const output = applyPatch(root, [{ op, from: '/a', path: '/b/copied' }, { op: 'replace', path: '/b/copied/x', value: 2 }]);
    expect(Object.getPrototypeOf(output)).toBeNull();
    expect(Object.getPrototypeOf(output.b)).toBeNull();
    expect(Object.getPrototypeOf(output.b.copied)).toBeNull();
    expect(root.a.x).toBe(1);
  }
});
