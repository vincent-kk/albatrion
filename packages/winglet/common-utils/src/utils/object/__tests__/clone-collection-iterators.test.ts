import { runInNewContext } from 'node:vm';
import { expect, it } from 'vitest';

import { clone } from '../clone';

/** Identical local and foreign subclasses expose only public entries when iterated. */
const source = `class PublicMap extends Map {
  *[Symbol.iterator]() { for (const entry of super.entries()) if (!entry[0].startsWith('_')) yield entry; }
}; new PublicMap([['public', 1], ['_internal', 2]])`;

it('local Map subclass clone retains native entries hidden by its iterator', () => {
  const LocalMap = class extends Map<string, number> {
    *[Symbol.iterator](): MapIterator<[string, number]> {
      for (const entry of super.entries())
        if (!entry[0].startsWith('_')) yield entry;
    }
  };
  const original = new LocalMap([
    ['public', 1],
    ['_internal', 2],
  ]);
  const copy = clone(original);
  expect({ size: copy.size, hidden: copy.get('_internal') }).toEqual({
    size: 2,
    hidden: 2,
  });
});

it('control: foreign Map subclass clone retains native entries hidden by its iterator', () => {
  const original = runInNewContext(source);
  const copy = clone(original);
  expect({ size: copy.size, hidden: copy.get('_internal') }).toEqual({
    size: 2,
    hidden: 2,
  });
});

it('local Set subclass clone retains members hidden by its iterator', () => {
  class PublicSet extends Set<string> {
    *[Symbol.iterator](): SetIterator<string> {
      for (const value of super.values())
        if (!value.startsWith('_')) yield value;
    }
  }
  const original = new PublicSet(['public', '_internal']);
  const copy = clone(original);
  expect({ size: copy.size, hidden: copy.has('_internal') }).toEqual({
    size: 2,
    hidden: true,
  });
});
