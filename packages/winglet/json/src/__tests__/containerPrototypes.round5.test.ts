import { expect, it } from 'vitest';
import { applyPatch, mergePatch, setValue, type Patch } from '../index';

/** Build the same own-data document with either supported dictionary prototype. */
const dictionary = (nullPrototype: boolean): Record<string, unknown> => Object.assign(
  Object.create(nullPrototype ? null : Object.prototype), { value: 1, sibling: { retained: true } },
);

it('preserves the input container prototype across write modes, depths and rebuild entry points', () => {
  for (const nullPrototype of [false, true]) {
    for (const nested of [false, true]) {
      for (const operation of ['add', 'replace', 'remove', 'copy', 'move', 'test']) {
        const prefix = nested ? '/child' : '';
        const patch: Patch = operation === 'copy' || operation === 'move'
          ? { op: operation, from: prefix + '/value', path: prefix + '/result' }
          : operation === 'remove'
            ? { op: operation, path: prefix + '/value' }
            : { op: operation === 'test' ? 'test' : operation === 'add' ? 'add' : 'replace', path: prefix + '/value', value: operation === 'test' ? 1 : 2 };
        const make = () => nested ? { child: dictionary(nullPrototype) } : dictionary(nullPrototype);
        const immutable = applyPatch<Record<string, unknown>>(make(), [patch]);
        const mutable = applyPatch<Record<string, unknown>>(make(), [patch], { immutable: false });
        expect(immutable).toEqual(mutable);
        expect(Object.getPrototypeOf(nested ? immutable.child : immutable), `${operation}, nested=${nested}`).toBe(
          Object.getPrototypeOf(nested ? mutable.child : mutable),
        );
      }
      for (const immutable of [false, true]) {
        const target = dictionary(nullPrototype);
        const source = nested ? { child: target } : target;
        const result = mergePatch(source, nested ? { child: { value: 2 } } : { value: 2 }, immutable);
        if (result === null || typeof result !== 'object') throw new Error('missing merged container');
        expect(Object.getPrototypeOf(nested ? Reflect.get(result, 'child') : result)).toBe(Object.getPrototypeOf(target));
      }
      const target = dictionary(nullPrototype);
      const source = nested ? { child: target } : target;
      const result = setValue(source, nested ? '/child/value' : '/value', 2);
      expect(Object.getPrototypeOf(nested ? Reflect.get(result, 'child') : result)).toBe(Object.getPrototypeOf(target));
    }
  }
});

it('keeps replacement-root ownership lazy and preserves the prototype when a later write owns it', () => {
  for (const nullPrototype of [false, true]) {
    const root = dictionary(nullPrototype);
    expect(applyPatch({}, [{ op: 'replace', path: '', value: root }])).toBe(root);
    const result = applyPatch({}, [{ op: 'replace', path: '', value: root }, { op: 'replace', path: '/value', value: 2 }]);
    expect(Object.getPrototypeOf(result)).toBe(Object.getPrototypeOf(root));
    expect(root.value).toBe(1);
    expect(result.sibling).toBe(root.sibling);
  }
});
