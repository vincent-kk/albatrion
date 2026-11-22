// Documentation-example conformance tests for @winglet/json (bug bounty round 3, ca1).
// Documents use subpath imports such as `@winglet/json/pointer-patch`; they re-export the
// same functions as the root entry, so every import below comes from `@/json` (the source root).
// `getJSONPointer` is not exported from the root entry (SKILL.md:98), so it is imported from its source module.
import { describe, expect, it } from 'vitest';

import * as api from '@/json';
import {
  type Patch,
  applyPatch,
  compare,
  compilePointer,
  convertJSONPathToPointer,
  convertJSONPointerToPath,
  difference,
  escapePath,
  escapeSegment,
  getJSONPath,
  getValue,
  JSONPath,
  JSONPointer,
  mergePatch,
  setValue,
  unescapePath,
  unescapeSegment,
} from '@/json';
import { getJSONPointer } from '@/json/JSONPointer/utils/getJSONPointer';

const catchError = (fn: () => unknown): any => {
  try {
    fn();
  } catch (e) {
    return e;
  }
  return undefined;
};
const specificOf = (fn: () => unknown): unknown =>
  catchError(fn)?.specific;
const loose = (fn: unknown) => fn as (...args: unknown[]) => any;

describe('README', () => {
  it('README:133 getValue returns "Vincent"', () => {
    const data = { user: { profile: { name: 'Vincent', age: 30 } } };
    const name = getValue(data, '/user/profile/name');
    expect(name).toBe('Vincent');
  });
  it('README:143 setValue returns object with email', () => {
    const data = { user: { profile: {} } };
    const result = setValue(data, '/user/profile/email', 'vincent@example.com');
    expect(result).toEqual({
      user: { profile: { email: 'vincent@example.com' } },
    });
  });
  it('README:154 escapePath', () => {
    expect(escapePath('path/with~special')).toBe('path/with~0special');
  });
  it('README:163 unescapePath', () => {
    expect(unescapePath('path~1with~0special')).toBe('path/with~special');
  });
  it('README:177 compare', () => {
    const source = { name: 'John', age: 30, city: 'NYC' };
    const target = { name: 'John', age: 31, country: 'USA' };
    expect(compare(source, target)).toEqual([
      { op: 'replace', path: '/age', value: 31 },
      { op: 'remove', path: '/city' },
      { op: 'add', path: '/country', value: 'USA' },
    ]);
  });
  it('README:197 applyPatch', () => {
    const source = { name: 'John', age: 30 };
    const patches: Patch[] = [
      { op: 'replace', path: '/age', value: 31 },
      { op: 'add', path: '/city', value: 'NYC' },
    ];
    expect(applyPatch(source, patches)).toEqual({
      name: 'John',
      age: 31,
      city: 'NYC',
    });
  });
  it('README:209 difference', () => {
    const source = { name: 'John', age: 30, city: 'NYC' };
    const target = { name: 'John', age: 31, country: 'USA' };
    expect(difference(source, target)).toEqual({
      age: 31,
      city: null,
      country: 'USA',
    });
  });
  it('README:221 mergePatch', () => {
    const source = { name: 'John', age: 30, temp: 'data' };
    const patch = { age: 31, temp: null, city: 'NYC' };
    expect(mergePatch(source, patch)).toEqual({
      name: 'John',
      age: 31,
      city: 'NYC',
    });
  });
  it('README:257 spread keeps __proto__ own data and prototype intact', () => {
    const result: any = mergePatch(
      {},
      JSON.parse('{"__proto__":{"tainted":true}}'),
    );
    const safe = { ...result };
    expect(Object.getOwnPropertyDescriptor(safe, '__proto__')?.value).toEqual({
      tainted: true,
    });
    expect(Object.getPrototypeOf(safe)).toBe(Object.prototype);
  });
  it('README:258 Object.assign replaces prototype and drops the key', () => {
    const result: any = mergePatch(
      {},
      JSON.parse('{"__proto__":{"tainted":true}}'),
    );
    const lost = Object.assign({}, result);
    expect(Object.getOwnPropertyNames(lost)).toEqual([]);
    expect(Object.getPrototypeOf(lost)).not.toBe(Object.prototype);
  });
  it('README:263 constructor own data shadows: constructor === Object is false, instanceof Object true', () => {
    const value: any = mergePatch({}, JSON.parse('{"constructor":{"a":1}}'));
    expect(value.constructor === Object).toBe(false);
    expect(Object.getPrototypeOf(value)).toBe(Object.prototype);
    expect(value instanceof Object).toBe(true);
  });
  it('README:287 Basic Usage getValue theme "dark"', () => {
    const data = {
      users: [
        { id: 1, name: 'Alice', preferences: { theme: 'dark' } },
        { id: 2, name: 'Bob', preferences: { theme: 'light' } },
      ],
      settings: { app: { version: '1.0.0' } },
    };
    expect(getValue(data, '/users/0/preferences/theme')).toBe('dark');
  });
  it('README:295 Basic Usage compare(data, updated) yields the version replace patch', () => {
    const data = {
      users: [
        { id: 1, name: 'Alice', preferences: { theme: 'dark' } },
        { id: 2, name: 'Bob', preferences: { theme: 'light' } },
      ],
      settings: { app: { version: '1.0.0' } },
    };
    const updated = setValue(data, '/settings/app/version', '1.1.0');
    const patches = compare(data, updated);
    expect(patches).toEqual([
      { op: 'replace', path: '/settings/app/version', value: '1.1.0' },
    ]);
  });
  it('README:315 Advanced applyPatch preserves original data and returns new object', () => {
    const data = { user: { role: 'user' } };
    const patches: Patch[] = [
      { op: 'add', path: '/user/permissions', value: ['read', 'write'] },
      { op: 'replace', path: '/user/role', value: 'admin' },
    ];
    const before = structuredClone(data);
    const result = applyPatch(data, patches, { immutable: true });
    expect(data).toEqual(before);
    expect(result).toEqual({
      user: { role: 'admin', permissions: ['read', 'write'] },
    });
    expect(result).not.toBe(data);
  });
  it('README:337 Merge Patch usage difference output', () => {
    const source = {
      user: { name: 'Alice', age: 25, role: 'admin', temp: 'data' },
      settings: { theme: 'dark' },
    };
    const target = {
      user: { name: 'Bob', age: 25, permissions: ['read', 'write'] },
      settings: { theme: 'light', language: 'en' },
    };
    expect(difference(source, target)).toEqual({
      user: {
        name: 'Bob',
        role: null,
        temp: null,
        permissions: ['read', 'write'],
      },
      settings: { theme: 'light', language: 'en' },
    });
  });
  it('README:345 Merge Patch usage mergePatch output', () => {
    const source = {
      user: { name: 'Alice', age: 25, role: 'admin', temp: 'data' },
      settings: { theme: 'dark' },
    };
    const target = {
      user: { name: 'Bob', age: 25, permissions: ['read', 'write'] },
      settings: { theme: 'light', language: 'en' },
    };
    const patch = difference(source, target);
    expect(mergePatch(source, patch)).toEqual({
      user: { name: 'Bob', age: 25, permissions: ['read', 'write'] },
      settings: { theme: 'light', language: 'en' },
    });
  });
  it('README:362 Array getValue "banana"', () => {
    const data = { items: ['apple', 'banana', 'cherry'] };
    expect(getValue(data, '/items/1')).toBe('banana');
  });
  it('README:366 Array setValue "-" appends', () => {
    const data = { items: ['apple', 'banana', 'cherry'] };
    const withNewItem = setValue(data, '/items/-', 'date');
    expect(withNewItem).toEqual({
      items: ['apple', 'banana', 'cherry', 'date'],
    });
  });
  it('README:374 Error Handling imports JSONPointerError from the package', () => {
    expect((api as Record<string, unknown>).JSONPointerError).toBeDefined();
  });
});

describe('SPEC', () => {
  it('SPEC:60 Quick Start getValue "dark"', () => {
    const document = { settings: { theme: 'dark', language: 'en' } };
    expect(getValue(document, '/settings/theme')).toBe('dark');
  });
  it('SPEC:63 Quick Start setValue mutates in place', () => {
    const document = { settings: { theme: 'dark', language: 'en' } };
    setValue(document, '/settings/theme', 'light');
    expect(document.settings.theme).toBe('light');
  });
  it('SPEC:70 Quick Start compare', () => {
    expect(
      compare(
        { name: 'Alice', age: 30 },
        { name: 'Alice', age: 31, city: 'Seoul' },
      ),
    ).toEqual([
      { op: 'replace', path: '/age', value: 31 },
      { op: 'add', path: '/city', value: 'Seoul' },
    ]);
  });
  it('SPEC:77 Quick Start applyPatch of those patches on document leaves document unchanged', () => {
    const document = {
      users: [
        { id: 1, name: 'Alice', role: 'admin' },
        { id: 2, name: 'Bob', role: 'user' },
      ],
      settings: { theme: 'dark', language: 'en' },
    };
    setValue(document, '/settings/theme', 'light');
    const patches = compare(
      { name: 'Alice', age: 30 },
      { name: 'Alice', age: 31, city: 'Seoul' },
    );
    const snapshot = structuredClone(document);
    const updated = applyPatch(document, patches);
    expect(updated).toBeDefined();
    expect(document).toEqual(snapshot);
  });
  it('SPEC:138 getValue inherited members resolve', () => {
    expect(getValue({}, '/toString')).toBe(Object.prototype.toString);
    expect(getValue({ a: [1] }, '/a/length')).toBe(1);
  });
  const doc = {
    store: {
      books: [
        { title: 'RFC 6901', author: 'IETF', price: 0 },
        { title: 'Clean Code', author: 'Martin', price: 35 },
      ],
    },
  };
  it('SPEC:154 getValue title', () => {
    expect(getValue(doc, '/store/books/0/title')).toBe('RFC 6901');
  });
  it('SPEC:155 getValue price', () => {
    expect(getValue(doc, '/store/books/1/price')).toBe(35);
  });
  it('SPEC:156 getValue "" returns entire document', () => {
    expect(getValue(doc, '')).toBe(doc);
  });
  it('SPEC:157 getValue array tokens', () => {
    expect(getValue(doc, ['store', 'books', '0'])).toEqual({
      title: 'RFC 6901',
      author: 'IETF',
      price: 0,
    });
  });
  it('SPEC:161 getValue escaped keys', () => {
    const data = { 'a/b': 'slash', 'a~b': 'tilde' };
    expect(getValue(data, '/a~1b')).toBe('slash');
    expect(getValue(data, '/a~0b')).toBe('tilde');
  });
  it('SPEC:165 getValue missing location undefined', () => {
    expect(getValue(doc, '/store/missing')).toBeUndefined();
  });
  it('SPEC:194 setValue returns same reference', () => {
    const obj = { user: {} };
    expect(setValue(obj, '/user/name', 'Alice')).toBe(obj);
  });
  it('SPEC:203 setValue basic, auto-create, append, overwrite:false, preserveNull:false', () => {
    const obj: any = { user: {} };
    setValue(obj, '/user/name', 'Alice');
    expect(obj.user.name).toBe('Alice');
    setValue(obj, '/config/db/host', 'localhost');
    expect(obj.config.db.host).toBe('localhost');
    const arr = { items: [1, 2, 3] };
    setValue(arr, '/items/-', 4);
    expect(arr.items).toEqual([1, 2, 3, 4]);
    setValue(obj, '/user/name', 'Bob', { overwrite: false });
    expect(obj.user.name).toBe('Alice');
    const nulled: any = { profile: null };
    setValue(nulled, '/profile/name', 'Alice', { preserveNull: false });
    expect(nulled.profile).toEqual({ name: 'Alice' });
  });
  it('SPEC:237 escapePath', () => {
    expect(escapePath('/users/john~doe/settings')).toBe(
      '/users/john~0doe/settings',
    );
  });
  it('SPEC:240 unescapePath', () => {
    expect(unescapePath('/users/john~0doe/settings')).toBe(
      '/users/john~doe/settings',
    );
  });
  it('SPEC:244 round trip', () => {
    const original = '/data/key~with~tildes/value';
    expect(unescapePath(escapePath(original)) === original).toBe(true);
  });
  it('SPEC:258 escapeSegment api/v1, config~prod, normal', () => {
    expect(escapeSegment('api/v1')).toBe('api~1v1');
    expect(escapeSegment('config~prod')).toBe('config~0prod');
    expect(escapeSegment('normal')).toBe('normal');
  });
  it('SPEC:265 escapeSegment pointer building', () => {
    const key = 'api/v1';
    const pointer = `/${escapeSegment(key)}/status`;
    expect(pointer).toBe('/api~1v1/status');
  });
  it('SPEC:279 convertJSONPointerToPath', () => {
    expect(convertJSONPointerToPath('/foo/bar')).toBe('.foo.bar');
    expect(convertJSONPointerToPath('/users/0/name')).toBe('.users[0].name');
    expect(convertJSONPointerToPath('/items/-/id')).toBe('.items[].id');
    expect(convertJSONPointerToPath('/a.b/c')).toBe('.[a.b].c');
    expect(convertJSONPointerToPath('/a~1b/c~0d')).toBe('.a~1b.c~0d');
    expect(convertJSONPointerToPath('')).toBe('.');
  });
  it('SPEC:270 convertJSONPointerToPath returns input starting with ".", "$." or "@." unchanged', () => {
    expect(convertJSONPointerToPath('.a.b')).toBe('.a.b');
    expect(convertJSONPointerToPath('$.a.b')).toBe('$.a.b');
    expect(convertJSONPointerToPath('@.a.b')).toBe('@.a.b');
    expect(convertJSONPointerToPath(convertJSONPointerToPath('/a/0/b'))).toBe(
      '.a[0].b',
    );
  });
  it('SPEC:325 compare', () => {
    const source = { name: 'Alice', age: 25, role: 'user' };
    const target = { name: 'Alice', age: 26, permissions: ['read'] };
    expect(compare(source, target)).toEqual([
      { op: 'replace', path: '/age', value: 26 },
      { op: 'remove', path: '/role' },
      { op: 'add', path: '/permissions', value: ['read'] },
    ]);
  });
  it('SPEC:333 compare identical empty array', () => {
    expect(compare({ x: 1 }, { x: 1 })).toEqual([]);
  });
  it('SPEC:340 compare nested', () => {
    expect(
      compare(
        { settings: { theme: 'dark', lang: 'ko' } },
        { settings: { theme: 'light', lang: 'ko' } },
      ),
    ).toEqual([{ op: 'replace', path: '/settings/theme', value: 'light' }]);
  });
  it('SPEC:369 applyPatch sequence, source unchanged', () => {
    const source = { name: 'Alice', tags: ['admin'] };
    const snapshot = structuredClone(source);
    const result = applyPatch(source, [
      { op: 'add', path: '/email', value: 'alice@example.com' },
      { op: 'replace', path: '/name', value: 'Alicia' },
      { op: 'add', path: '/tags/-', value: 'editor' },
      { op: 'remove', path: '/tags/0' },
    ]);
    expect(result).toEqual({
      name: 'Alicia',
      email: 'alice@example.com',
      tags: ['editor'],
    });
    expect(source).toEqual(snapshot);
  });
  it('SPEC:374 applyPatch move', () => {
    expect(
      applyPatch({ a: { b: 1 } }, [{ op: 'move', from: '/a/b', path: '/c' }]),
    ).toEqual({ a: {}, c: 1 });
  });
  it('SPEC:381 applyPatch test + replace', () => {
    expect(
      applyPatch({ status: 'draft' }, [
        { op: 'test', path: '/status', value: 'draft' },
        { op: 'replace', path: '/status', value: 'published' },
      ]),
    ).toEqual({ status: 'published' });
  });
  it('SPEC:401 difference add/replace', () => {
    expect(difference({ a: 1, b: 2 }, { a: 1, b: 3, c: 4 })).toEqual({
      b: 3,
      c: 4,
    });
  });
  it('SPEC:404 difference removal null', () => {
    expect(difference({ a: 1, b: 2 }, { a: 1 })).toEqual({ b: null });
  });
  it('SPEC:407 difference identical undefined', () => {
    expect(difference({ x: 1 }, { x: 1 })).toBeUndefined();
  });
  it('SPEC:410 difference arrays replaced wholesale', () => {
    expect(difference([1, 2, 3], [1, 2, 4])).toEqual([1, 2, 4]);
  });
  it('SPEC:417 difference nested', () => {
    expect(
      difference(
        { user: { name: 'Alice', role: 'admin', temp: true } },
        { user: { name: 'Bob', role: 'admin' } },
      ),
    ).toEqual({ user: { name: 'Bob', temp: null } });
  });
  it('SPEC:441 mergePatch add and replace', () => {
    expect(
      mergePatch({ name: 'Alice', age: 25 }, { age: 26, city: 'Seoul' }),
    ).toEqual({ name: 'Alice', age: 26, city: 'Seoul' });
  });
  it('SPEC:445 mergePatch remove with null', () => {
    expect(
      mergePatch({ name: 'Alice', temp: 'data' }, { temp: null }),
    ).toEqual({ name: 'Alice' });
  });
  it('SPEC:452 mergePatch nested', () => {
    expect(
      mergePatch(
        { user: { name: 'Alice', role: 'admin' } },
        { user: { role: null, email: 'alice@example.com' } },
      ),
    ).toEqual({ user: { name: 'Alice', email: 'alice@example.com' } });
  });
  it('SPEC:456 mergePatch non-object patch replaces', () => {
    expect(mergePatch({ complex: true }, 'simple')).toBe('simple');
  });
  it('SPEC:461 mergePatch mutable returns same reference', () => {
    const src = { a: 1 };
    const res = mergePatch(src, { b: 2 }, false);
    expect(src === res).toBe(true);
  });
  it('SPEC:433 mergePatch array patch replaces source entirely', () => {
    expect(mergePatch({ a: 1 }, [1, 2])).toEqual([1, 2]);
  });
  it('SPEC:434 mergePatch undefined patch returns source unchanged', () => {
    const source = { a: 1 };
    expect(mergePatch(source, undefined)).toBe(source);
  });
  it('SPEC:473 JSONPath constants', () => {
    expect(JSONPath.Root).toBe('$');
    expect(JSONPath.Current).toBe('@');
    expect(JSONPath.Child).toBe('.');
    expect(JSONPath.Filter).toBe('#');
  });
  it('SPEC:497 getJSONPath', () => {
    const doc = { a: { b: [{ c: 'value' }] } };
    expect(getJSONPath(doc, doc)).toBe('$');
    expect(getJSONPath(doc, doc.a)).toBe('$.a');
    expect(getJSONPath(doc, doc.a.b)).toBe('$.a.b');
    expect(getJSONPath(doc, doc.a.b[0])).toBe('$.a.b[0]');
    expect(getJSONPath(doc, {})).toBeNull();
  });
  it('SPEC:506 getJSONPath keys with dots', () => {
    const special = { 'key.with.dots': { nested: true } };
    expect(getJSONPath(special, special['key.with.dots'])).toBe(
      "$['key.with.dots']",
    );
  });
  it('SPEC:490 getJSONPath returns null for a primitive leaf target', () => {
    expect(getJSONPath({ a: { b: 1 } }, 1)).toBeNull();
  });
  it('SPEC:520 convertJSONPathToPointer $.foo.bar', () => {
    expect(convertJSONPathToPointer('$.foo.bar')).toBe('/foo/bar');
  });
  it('SPEC:521 convertJSONPathToPointer $.users[0].name', () => {
    expect(convertJSONPathToPointer('$.users[0].name')).toBe('/users/0/name');
  });
  it('SPEC:522 convertJSONPathToPointer $', () => {
    expect(convertJSONPathToPointer('$')).toBe('');
  });
  it('SPEC:523 convertJSONPathToPointer bracket-quoted key', () => {
    expect(convertJSONPathToPointer("$['a/b'].c")).toBe('/a~1b/c');
  });
  it('SPEC:601 reserved add /__proto__ is own data and prototype untouched', () => {
    const result = applyPatch({}, [
      { op: 'add', path: '/__proto__', value: { isAdmin: true } },
    ]);
    expect(
      (Object.getOwnPropertyDescriptor(result, '__proto__') as any)?.value,
    ).toEqual({ isAdmin: true });
    expect(Object.getPrototypeOf(result) === Object.prototype).toBe(true);
  });
  it('SPEC:606 reserved intermediate throws PATCH_PATH_INVALID_INTERMEDIATE', () => {
    expect(
      specificOf(() =>
        applyPatch({}, [
          { op: 'add', path: '/__proto__/isAdmin', value: true },
        ]),
      ),
    ).toBe('PATCH_PATH_INVALID_INTERMEDIATE');
    expect(({} as any).isAdmin).toBeUndefined();
  });
  it('SPEC:609 setValue and mergePatch observe reserved member input identically', () => {
    const viaSet: any = setValue({}, '/__proto__', { isAdmin: true });
    const viaMerge: any = mergePatch(
      {},
      JSON.parse('{"__proto__":{"isAdmin":true}}'),
    );
    for (const r of [viaSet, viaMerge]) {
      expect(Object.getOwnPropertyDescriptor(r, '__proto__')?.value).toEqual({
        isAdmin: true,
      });
      expect(Object.getPrototypeOf(r)).toBe(Object.prototype);
    }
  });
  it('SPEC:616 getValue("string") throws INVALID_INPUT', () => {
    expect(specificOf(() => getValue('string' as any, '/path'))).toBe(
      'INVALID_INPUT',
    );
  });
  it('SPEC:617 getValue(null) throws INVALID_INPUT', () => {
    expect(specificOf(() => getValue(null as any, '/path'))).toBe(
      'INVALID_INPUT',
    );
  });
  it('SPEC:618 getValue(new Map()) throws INVALID_INPUT', () => {
    expect(specificOf(() => getValue(new Map() as any, '/path'))).toBe(
      'INVALID_INPUT',
    );
  });
  it('SPEC:613 setValue rejects non-plain-object inputs', () => {
    expect(specificOf(() => setValue('x' as any, '/a', 1))).toBe(
      'INVALID_INPUT',
    );
    expect(specificOf(() => setValue(new Map() as any, '/a', 1))).toBe(
      'INVALID_INPUT',
    );
  });
  it('SPEC:625 error name, namespaced code and bare specific', () => {
    const e = catchError(() => getValue(new Map() as any, '/a'));
    expect(e).toBeInstanceOf(Error);
    expect(e.name).toBe('JSONPointer');
    expect(e.code).toBe('JSON_POINTER.INVALID_INPUT');
    expect(e.specific).toBe('INVALID_INPUT');
  });
  it('SPEC:625 applyPatch throws error named JSONPatch', () => {
    const e = catchError(() =>
      applyPatch({}, [{ op: 'remove', path: '/missing' }]),
    );
    expect(e.name).toBe('JSONPatch');
  });
  it('SPEC:625 neither error class is exported', () => {
    const a = api as Record<string, unknown>;
    expect(a.JSONPointerError).toBeUndefined();
    expect(a.JSONPatchError).toBeUndefined();
  });
  it('SPEC:630 INVALID_POINTER_TYPE for pointer without leading / or #', () => {
    expect(specificOf(() => getValue({}, 'no-slash'))).toBe(
      'INVALID_POINTER_TYPE',
    );
  });
  it('SPEC:637 getValue({}, "/missing") undefined', () => {
    expect(getValue({}, '/missing')).toBeUndefined();
  });
  it.skip('SPEC:659 Performance applyPatch(source, patches, { immutable: false }) -- no stated output', () => {});
});

describe('SKILL', () => {
  it('SKILL:14 applyPatch test guard on drifted document throws PATCH_TEST_FAILED', () => {
    const e = catchError(() =>
      applyPatch({ v: 999 }, [
        { op: 'test', path: '/v', value: 1 },
        { op: 'replace', path: '/v', value: 2 },
      ]),
    );
    expect(e.specific).toBe('PATCH_TEST_FAILED');
    expect(e.code).toBe('JSON_PATCH.PATCH_TEST_FAILED');
  });
  it('SKILL:17 compare never mutates; immutable:false aliases source in patch; setValue mutates', () => {
    const source = { a: { x: 1 } };
    const target = { a: { x: 1 }, b: { y: 2 } };
    const s = structuredClone(source);
    const t = structuredClone(target);
    const cloned = compare(source, target);
    expect(source).toEqual(s);
    expect(target).toEqual(t);
    expect((cloned[0] as any).value).not.toBe(target.b);
    const aliased = compare(source, target, { immutable: false });
    expect((aliased[0] as any).value).toBe(target.b);
    expect(setValue(source, '/z', 1)).toBe(source);
  });
  it('SKILL:46 reserved names are opaque own data in setValue', () => {
    const r: any = setValue({}, '/__proto__/pwn', true);
    expect(Object.getPrototypeOf(r)).toBe(Object.prototype);
    expect(Object.getOwnPropertyDescriptor(r, '__proto__')?.value).toEqual({
      pwn: true,
    });
  });
  it('SKILL:52 getValue missing returns undefined; throws on non-plain input or malformed pointer', () => {
    expect(getValue({ a: 1 }, '/b/c')).toBeUndefined();
    expect(specificOf(() => getValue(1 as any, '/a'))).toBe('INVALID_INPUT');
    expect(specificOf(() => getValue({}, 'a'))).toBe('INVALID_POINTER_TYPE');
  });
  it('SKILL:53 getValue inherited ordinary keys', () => {
    expect(getValue({}, '/toString')).toBe(Object.prototype.toString);
    expect(getValue({ a: [1] }, '/a/length')).toBe(1);
  });
  it('SKILL:53 getValue reserved names are own-only', () => {
    expect(getValue({}, '/constructor')).toBeUndefined();
    expect(getValue({}, '/__proto__')).toBeUndefined();
  });
  it('SKILL:54 err.code is namespaced and bare code is on .specific', () => {
    const e = catchError(() => getValue(1 as any, '/a'));
    expect(e.code).toBe('JSON_POINTER.INVALID_INPUT');
    expect(e.specific).toBe('INVALID_INPUT');
  });
  it('SKILL:55 JSONPointerError / isJSONPointerError are not exported', () => {
    const a = api as Record<string, unknown>;
    expect(a.JSONPointerError).toBeUndefined();
    expect(a.isJSONPointerError).toBeUndefined();
  });
  it('SKILL:56 compare strict emits test before replace and remove but not add', () => {
    expect(
      compare({ a: 1, b: 2 }, { a: 5, c: 3 }, { strict: true }),
    ).toEqual([
      { op: 'test', path: '/a', value: 1 },
      { op: 'replace', path: '/a', value: 5 },
      { op: 'test', path: '/b', value: 2 },
      { op: 'remove', path: '/b' },
      { op: 'add', path: '/c', value: 3 },
    ]);
  });
  it('SKILL:57 applyPatch strict:true does not change behavior; replace of missing member throws', () => {
    expect(
      specificOf(() =>
        applyPatch({}, [{ op: 'replace', path: '/a', value: 1 }], {
          strict: true,
        }),
      ),
    ).toBe('PATCH_OBJECT_PROPERTY_NOT_FOUND');
  });
  it('SKILL:58 applyPatch strict:false still throws on failing test, missing remove, index out of bounds', () => {
    const opts = { strict: false };
    expect(
      specificOf(() =>
        applyPatch({ a: 1 }, [{ op: 'test', path: '/a', value: 2 }], opts),
      ),
    ).toBe('PATCH_TEST_FAILED');
    expect(
      catchError(() =>
        applyPatch({ a: 1 }, [{ op: 'test', path: '/b', value: 2 }], opts),
      ),
    ).toBeDefined();
    expect(
      catchError(() =>
        applyPatch({ a: 1 }, [{ op: 'remove', path: '/b' }], opts),
      ),
    ).toBeDefined();
    expect(
      specificOf(() =>
        applyPatch({ a: [1] }, [{ op: 'remove', path: '/a/5' }], opts),
      ),
    ).toBe('PATCH_ARRAY_INDEX_OUT_OF_BOUNDS');
  });
  it('SKILL:59 escapePath("config/database") unchanged', () => {
    expect(escapePath('config/database')).toBe('config/database');
  });
  it('SKILL:60 unescapeSegment is the same function object as unescapePath', () => {
    expect(unescapeSegment).toBe(unescapePath);
  });
  it('SKILL:61 setValue writes reserved keys as own data (no skip)', () => {
    const r: any = setValue({}, '/constructor', { x: 1 });
    expect(Object.getOwnPropertyDescriptor(r, 'constructor')?.value).toEqual({
      x: 1,
    });
  });
  it('SKILL:62 difference returns undefined for identical inputs', () => {
    expect(difference({ a: 1 }, { a: 1 })).toBeUndefined();
  });
  it('SKILL:63 "-" is an ordinary key for getValue/remove/replace', () => {
    expect(getValue({ '-': 5 }, '/-')).toBe(5);
    expect(
      applyPatch({ '-': 1 }, [{ op: 'replace', path: '/-', value: 2 }]),
    ).toEqual({ '-': 2 });
    expect(applyPatch({ '-': 1, k: 1 }, [{ op: 'remove', path: '/-' }])).toEqual(
      { k: 1 },
    );
  });
  it('SKILL:64 getJSONPath finds primitives with ===', () => {
    expect(getJSONPath({ a: 'x', b: 'x' }, 'x')).toBe('$.a');
  });
  it('SKILL:65 convertJSONPointerToPath returns dot/bracket string', () => {
    expect(convertJSONPointerToPath('/users/0/name')).toBe('.users[0].name');
    expect(typeof convertJSONPointerToPath('/a')).toBe('string');
  });
  it('SKILL:66 convertJSONPathToPointer treats "$" as an ordinary key', () => {
    expect(convertJSONPathToPointer('$.users[1]')).toBe('/$/users/1');
  });
  it('SKILL:67 compare never emits move or copy on relocation', () => {
    const ops = compare({ a: { v: 1 } }, { b: { v: 1 } }).map((p) => p.op);
    expect(ops).not.toContain('move');
    expect(ops).not.toContain('copy');
    expect([...ops].sort()).toEqual(['add', 'remove']);
  });
  it('SKILL:68 setValue(doc, ptr, undefined) deletes the key', () => {
    const doc: any = { a: 1, b: 2 };
    setValue(doc, '/a', undefined);
    expect('a' in doc).toBe(false);
    expect(doc).toEqual({ b: 2 });
  });
  it('SKILL:69 protectPrototype option does not exist; reserved intermediate fails as PATCH_PATH_INVALID_INTERMEDIATE', () => {
    expect(
      specificOf(() =>
        applyPatch({}, [{ op: 'add', path: '/__proto__/x', value: 1 }], {
          protectPrototype: true,
        } as any),
      ),
    ).toBe('PATCH_PATH_INVALID_INTERMEDIATE');
  });
  it('SKILL:70 mergePatch replaces arrays at every depth', () => {
    expect(mergePatch({ a: { b: [1, 2, 3] } }, { a: { b: [9] } })).toEqual({
      a: { b: [9] },
    });
  });
  it('SKILL:72 JSONPointerError exposes exactly INVALID_INPUT and INVALID_POINTER_TYPE (no INVALID_POINTER / PROPERTY_NOT_FOUND)', () => {
    const seen = new Set<unknown>([
      specificOf(() => getValue(1 as any, '/a')),
      specificOf(() => getValue({}, 'a')),
      specificOf(() => getValue({}, 5 as any)),
      specificOf(() => setValue({}, 'a', 1)),
    ]);
    expect([...seen].sort()).toEqual(['INVALID_INPUT', 'INVALID_POINTER_TYPE']);
  });
  it('SKILL:85 main entry exports every listed name', () => {
    const a = api as Record<string, unknown>;
    for (const name of [
      'getValue',
      'setValue',
      'compare',
      'applyPatch',
      'difference',
      'mergePatch',
      'escapePath',
      'escapeSegment',
      'unescapePath',
      'unescapeSegment',
      'convertJSONPointerToPath',
      'convertJSONPathToPointer',
      'getJSONPath',
      'compilePointer',
      'JSONPointer',
      'JSONPath',
    ])
      expect(a[name], name).toBeDefined();
  });
  it('SKILL:98 getJSONPointer is not reachable from the main entry', () => {
    expect((api as Record<string, unknown>).getJSONPointer).toBeUndefined();
  });
  it('SKILL:103 calls: getValue/setValue/compare/applyPatch/difference/mergePatch/escapeSegment', () => {
    const doc: any = { users: [{ name: 'n' }] };
    expect(getValue(doc, '/users/0/name')).toBe('n');
    expect(getValue(doc, '/nope/0')).toBeUndefined();
    setValue(doc, '/settings/theme', 'dark');
    expect(doc.settings.theme).toBe('dark');
    setValue(doc, '/items/-', 'item');
    expect(doc.items).toEqual(['item']);
    const before = { v: 1 };
    const after = { v: 2 };
    const patches = compare(before, after, { strict: true });
    expect(applyPatch(before, patches)).toEqual({ v: 2 });
    expect(before).toEqual({ v: 1 });
    expect(difference(before, { v: 1 })).toBeUndefined();
    expect(mergePatch(before, difference(before, after))).toEqual({ v: 2 });
    expect(`/config/${escapeSegment('a/b~c')}`).toBe('/config/a~1b~0c');
  });
});

describe('PATCHING', () => {
  it('PATCHING:11 payload /__proto__/isAdmin fails with PATCH_PATH_INVALID_INTERMEDIATE', () => {
    expect(
      specificOf(() =>
        applyPatch({}, [{ op: 'add', path: '/__proto__/isAdmin', value: true }]),
      ),
    ).toBe('PATCH_PATH_INVALID_INTERMEDIATE');
    expect(({} as any).isAdmin).toBeUndefined();
  });
  it('PATCHING:13 payload /constructor/prototype/isAdmin fails with PATCH_PATH_INVALID_INTERMEDIATE', () => {
    expect(
      specificOf(() =>
        applyPatch({}, [
          { op: 'add', path: '/constructor/prototype/isAdmin', value: true },
        ]),
      ),
    ).toBe('PATCH_PATH_INVALID_INTERMEDIATE');
    expect(({} as any).isAdmin).toBeUndefined();
  });
  it('PATCHING:18 getValue/setValue reject Map, Set, function, class instance, primitives', () => {
    class Foo {}
    for (const bad of [new Map(), new Set(), () => 1, new Foo(), 1, 'x']) {
      expect(specificOf(() => getValue(bad as any, '/a'))).toBe('INVALID_INPUT');
      expect(specificOf(() => setValue(bad as any, '/a', 1))).toBe(
        'INVALID_INPUT',
      );
    }
  });
  it('PATCHING:21 writing /__proto__ directly succeeds as own data', () => {
    const r: any = applyPatch({}, [
      { op: 'add', path: '/__proto__', value: { a: 1 } },
    ]);
    expect(Object.getOwnPropertyDescriptor(r, '__proto__')?.value).toEqual({
      a: 1,
    });
    expect(Object.getPrototypeOf(r)).toBe(Object.prototype);
  });
  it('PATCHING:21 setValue creates a missing own reserved-name container', () => {
    const r: any = setValue({}, '/__proto__/pwn', true);
    expect(Object.getOwnPropertyDescriptor(r, '__proto__')?.value).toEqual({
      pwn: true,
    });
    expect(({} as any).pwn).toBeUndefined();
  });
  it('PATCHING:23 spread / JSON round-trip / structuredClone preserve own __proto__; Object.assign swaps prototype', () => {
    const x: any = JSON.parse('{"__proto__":{"k":1}}');
    for (const copy of [
      { ...x },
      JSON.parse(JSON.stringify(x)),
      structuredClone(x),
    ]) {
      expect(Object.getOwnPropertyDescriptor(copy, '__proto__')?.value).toEqual(
        { k: 1 },
      );
    }
    const assigned = Object.assign({}, x);
    expect(Object.getOwnPropertyDescriptor(assigned, '__proto__')).toBeUndefined();
  });
  it('PATCHING:33 compare strict test + replace', () => {
    expect(compare({ v: 1 }, { v: 2 }, { strict: true })).toEqual([
      { op: 'test', path: '/v', value: 1 },
      { op: 'replace', path: '/v', value: 2 },
    ]);
  });
  it('PATCHING:41 guarded applyPatch({v:1}) gives {v:2}', () => {
    const guarded = compare({ v: 1 }, { v: 2 }, { strict: true });
    expect(applyPatch({ v: 1 }, guarded)).toEqual({ v: 2 });
  });
  it('PATCHING:42 guarded applyPatch({v:999}) throws PATCH_TEST_FAILED', () => {
    const guarded = compare({ v: 1 }, { v: 2 }, { strict: true });
    expect(specificOf(() => applyPatch({ v: 999 }, guarded))).toBe(
      'PATCH_TEST_FAILED',
    );
  });
  it('PATCHING:45 applyPatch strict option changes nothing', () => {
    const guarded = compare({ v: 1 }, { v: 2 }, { strict: true });
    expect(
      specificOf(() => applyPatch({ v: 999 }, guarded, { strict: false })),
    ).toBe('PATCH_TEST_FAILED');
    expect(
      specificOf(() => applyPatch({ v: 999 }, guarded, { strict: true })),
    ).toBe('PATCH_TEST_FAILED');
  });
  describe('PATCHING:47 always-throwing applyPatch cases', () => {
    const throws = (label: string, doc: any, patch: any) =>
      it(`PATCHING:47 ${label} throws`, () => {
        expect(catchError(() => applyPatch(doc, [patch]))).toBeDefined();
      });
    throws('remove of missing property', { a: 1 }, { op: 'remove', path: '/b' });
    throws('replace of missing property', { a: 1 }, {
      op: 'replace',
      path: '/b',
      value: 1,
    });
    throws('test naming a missing property', { a: 1 }, {
      op: 'test',
      path: '/b',
      value: 1,
    });
    throws('array index out of bounds', { a: [1] }, {
      op: 'replace',
      path: '/a/5',
      value: 1,
    });
    throws('non-numeric array index', { a: [1] }, {
      op: 'replace',
      path: '/a/x',
      value: 1,
    });
    throws('leading-zero array index /a/01', { a: [1, 2] }, {
      op: 'replace',
      path: '/a/01',
      value: 1,
    });
    throws('index past 4294967294', { a: [1] }, {
      op: 'add',
      path: '/a/4294967295',
      value: 1,
    });
    throws('unknown op', { a: 1 }, { op: 'bogus', path: '/a' });
    throws('move whose from does not exist', { a: 1 }, {
      op: 'move',
      from: '/x',
      path: '/y',
    });
    throws('copy whose from does not exist', { a: 1 }, {
      op: 'copy',
      from: '/x',
      path: '/y',
    });
    throws('move into own descendant', { a: { b: 1 } }, {
      op: 'move',
      from: '/a',
      path: '/a/c',
    });
    it('PATCHING:47 move whose from is a member set to undefined exists', () => {
      expect(
        catchError(() =>
          applyPatch({ a: undefined } as any, [
            { op: 'move', from: '/a', path: '/b' },
          ]),
        ),
      ).toBeUndefined();
    });
    it('PATCHING:47 move onto its own from leaves document unchanged', () => {
      expect(
        applyPatch({ a: 1 }, [{ op: 'move', from: '/a', path: '/a' }]),
      ).toEqual({ a: 1 });
    });
    it('PATCHING:47 copy has no location restriction (into own descendant)', () => {
      expect(
        catchError(() =>
          applyPatch({ a: { b: 1 } }, [
            { op: 'copy', from: '/a', path: '/a/c' },
          ]),
        ),
      ).toBeUndefined();
    });
  });
  it('PATCHING:55 setValue always mutates and returns same reference', () => {
    const doc = { a: 1 };
    expect(setValue(doc, '/a', 2)).toBe(doc);
    expect(doc.a).toBe(2);
  });
  it('PATCHING:56 applyPatch immutable default clones; immutable:false mutates and returns same ref', () => {
    const doc = { a: 1 };
    const next = applyPatch(doc, [{ op: 'replace', path: '/a', value: 2 }]);
    expect(next).not.toBe(doc);
    expect(doc.a).toBe(1);
    const same = applyPatch(doc, [{ op: 'replace', path: '/a', value: 2 }], {
      immutable: false,
    });
    expect(same).toBe(doc);
    expect(doc.a).toBe(2);
  });
  it('PATCHING:57 mergePatch third positional argument immutable', () => {
    const doc: any = { a: 1 };
    const next = mergePatch(doc, { a: 2 });
    expect(next).not.toBe(doc);
    expect(doc.a).toBe(1);
    expect(mergePatch(doc, { a: 2 }, false)).toBe(doc);
    expect(doc.a).toBe(2);
  });
  it('PATCHING:54 compare and difference never mutate', () => {
    const s = { a: { b: 1 }, c: [1] };
    const t = { a: { b: 2 }, d: 1 };
    const s0 = structuredClone(s);
    const t0 = structuredClone(t);
    compare(s, t);
    compare(s, t, { strict: true, immutable: false });
    difference(s, t);
    expect(s).toEqual(s0);
    expect(t).toEqual(t0);
  });
  it('PATCHING:59 compare immutable:false aliases data in the patch', () => {
    const source: any = { a: 1 };
    const target: any = { a: 1, o: { k: 1 } };
    const patches = compare(source, target, { immutable: false });
    target.o.k = 99;
    expect((patches[0] as any).value).toEqual({ k: 99 });
    const safe = compare(source, { a: 1, o: { k: 1 } });
    expect((safe[0] as any).value).toEqual({ k: 1 });
  });
  it('PATCHING:73 immutable:false leaves partial writes when a later operation throws', () => {
    const doc = { a: 1, b: 2 };
    catchError(() =>
      applyPatch(
        doc,
        [
          { op: 'replace', path: '/a', value: 99 },
          { op: 'remove', path: '/missing' },
        ],
        { immutable: false },
      ),
    );
    expect(doc).toEqual({ a: 99, b: 2 });
  });
  it('PATCHING:76 default immutable:true leaves original untouched on failure', () => {
    const doc = { a: 1, b: 2 };
    expect(
      catchError(() =>
        applyPatch(doc, [
          { op: 'replace', path: '/a', value: 99 },
          { op: 'remove', path: '/missing' },
        ]),
      ),
    ).toBeDefined();
    expect(doc).toEqual({ a: 1, b: 2 });
  });
  it('PATCHING:80 move /foo/1 to /foo/3 yields reordered array', () => {
    expect(
      applyPatch({ foo: ['all', 'grass', 'cows', 'eat'] }, [
        { op: 'move', from: '/foo/1', path: '/foo/3' },
      ]),
    ).toEqual({ foo: ['all', 'cows', 'eat', 'grass'] });
  });
  it('PATCHING:80 copy at an array index inserts rather than overwrites', () => {
    expect(
      applyPatch({ foo: ['a', 'b', 'c'] }, [
        { op: 'copy', from: '/foo/0', path: '/foo/1' },
      ]),
    ).toEqual({ foo: ['a', 'a', 'b', 'c'] });
  });
  it('PATCHING:82 compare serializes toJSON objects before comparison', () => {
    class Model {
      constructor(
        public internal: number,
        public label: string,
      ) {}
      toJSON() {
        return { label: this.label };
      }
    }
    const patches = compare(
      { m: new Model(1, 'x') } as any,
      { m: new Model(2, 'x') } as any,
    );
    expect(patches).toEqual([]);
  });
  it('PATCHING:86 difference identical returns undefined, not {}', () => {
    expect(difference({ a: 1 }, { a: 1 })).toBeUndefined();
    expect(difference({ a: 1 }, { a: 1 })).not.toEqual({});
  });
  it('PATCHING:91 mergePatch non-object bodies replace the source', () => {
    expect(mergePatch({ complex: 'object' }, 'simple')).toBe('simple');
    expect(mergePatch({ a: { b: 1 } }, [1, 2])).toEqual([1, 2]);
    expect(mergePatch({ a: 1 }, null as any)).toBeNull();
  });
  it('PATCHING:93 mergePatch undefined body returns {a:1}', () => {
    expect(mergePatch({ a: 1 }, undefined)).toEqual({ a: 1 });
  });
  it('PATCHING:96 null deletes key; difference of array change returns whole {a:[1,2]}', () => {
    expect(mergePatch({ a: 1, b: 2 }, { b: null })).toEqual({ a: 1 });
    expect(difference({ a: [1] }, { a: [1, 2] })).toEqual({ a: [1, 2] });
  });
  it('PATCHING:100 JSONPatch error shape: name, namespaced code, specific, details with patch and index', () => {
    const patches: Patch[] = [
      { op: 'replace', path: '/v', value: 1 },
      { op: 'test', path: '/v', value: 5 },
    ];
    const e = catchError(() => applyPatch({ v: 1 }, patches));
    expect(e.name).toBe('JSONPatch');
    expect(e.code).toBe('JSON_PATCH.PATCH_TEST_FAILED');
    expect(e.specific).toBe('PATCH_TEST_FAILED');
    expect(e.details).toBeDefined();
    const values = Object.values(e.details);
    expect(values).toContainEqual(patches[1]);
    expect(values).toContain(1);
  });
  it('PATCHING:108 documented specific codes are PATCH_TEST_FAILED and PATCH_PATH_INVALID_INTERMEDIATE', () => {
    expect(
      specificOf(() =>
        applyPatch({ v: 1 }, [{ op: 'test', path: '/v', value: 2 }]),
      ),
    ).toBe('PATCH_TEST_FAILED');
    expect(
      specificOf(() =>
        applyPatch({}, [{ op: 'add', path: '/a/b', value: 1 }]),
      ),
    ).toBe('PATCH_PATH_INVALID_INTERMEDIATE');
  });
});

describe('POINTERS', () => {
  it('POINTERS:10 getValue missing path no throw', () => {
    expect(getValue({ a: 1 }, '/b/c')).toBeUndefined();
  });
  it('POINTERS:11 getValue(null) throws INVALID_INPUT', () => {
    expect(specificOf(() => getValue(null as any, '/foo'))).toBe(
      'INVALID_INPUT',
    );
  });
  it('POINTERS:12 getValue({}, "no-slash") throws INVALID_POINTER_TYPE', () => {
    expect(specificOf(() => getValue({}, 'no-slash'))).toBe(
      'INVALID_POINTER_TYPE',
    );
  });
  it('POINTERS:7 non-string non-array pointer throws INVALID_POINTER_TYPE', () => {
    expect(specificOf(() => loose(getValue)({}, 5))).toBe(
      'INVALID_POINTER_TYPE',
    );
    expect(specificOf(() => loose(getValue)({}, { a: 1 }))).toBe(
      'INVALID_POINTER_TYPE',
    );
  });
  it('POINTERS:15 empty pointer string or array returns the whole document', () => {
    const doc = { a: 1 };
    expect(getValue(doc, '')).toBe(doc);
    expect(getValue(doc, [])).toBe(doc);
  });
  it('POINTERS:15 array pointer prefix convention and escape of empty / # keys', () => {
    const doc = { '': 1, '#': 2, a: 3 };
    expect(getValue(doc, ['', ''])).toBe(1);
    expect(getValue(doc, ['', '#'])).toBe(2);
    expect(getValue(doc, '/')).toBe(1);
    expect(getValue(doc, '/#')).toBe(2);
    expect(getValue(doc, [''])).toBe(doc);
    expect(getValue(doc, ['#'])).toBe(doc);
  });
  it('POINTERS:15 array string tokens are unescaped for you', () => {
    expect(getValue({ 'a/b': 1 }, ['a~1b'])).toBe(1);
  });
  it('POINTERS:17 URI fragment percent-decodes once; plain pointer keeps percent text', () => {
    expect(getValue({ 'a b': 1 }, '#/a%20b')).toBe(1);
    expect(getValue({ 'a%20b': 2 }, '/a%20b')).toBe(2);
  });
  it('POINTERS:17 malformed fragment escapes throw INVALID_POINTER_TYPE', () => {
    expect(specificOf(() => getValue({}, '#/a%zz'))).toBe(
      'INVALID_POINTER_TYPE',
    );
  });
  it('POINTERS:24 setValue auto-vivification: array for index or "-", object otherwise', () => {
    expect(setValue({}, '/a/b/c', 42)).toEqual({ a: { b: { c: 42 } } });
    expect(setValue({}, '/a/0', 1)).toEqual({ a: [1] });
    expect(setValue({}, '/a/-', 1)).toEqual({ a: [1] });
  });
  it('POINTERS:28 setValue({}, "/a/b/c", 42)', () => {
    expect(setValue({}, '/a/b/c', 42)).toEqual({ a: { b: { c: 42 } } });
  });
  it('POINTERS:29 setValue items append', () => {
    expect(setValue({ items: [1, 2] }, '/items/-', 3)).toEqual({
      items: [1, 2, 3],
    });
  });
  it('POINTERS:30 setValue null profile abandoned', () => {
    expect(setValue({ profile: null }, '/profile/name', 'A')).toEqual({
      profile: null,
    });
  });
  it('POINTERS:31 setValue /__proto__/pwn own data, prototype unchanged', () => {
    const r: any = setValue({ x: 1 }, '/__proto__/pwn', true);
    expect(Object.getOwnPropertyDescriptor(r, '__proto__')?.value).toEqual({
      pwn: true,
    });
    expect(Object.getPrototypeOf(r)).toBe(Object.prototype);
  });
  it('POINTERS:34 overwrite:false skips existing key, even when existing value is undefined', () => {
    expect(setValue({ a: 1 }, '/a', 2, { overwrite: false })).toEqual({ a: 1 });
    const doc: any = { a: undefined };
    setValue(doc, '/a', 2, { overwrite: false });
    expect(doc.a).toBeUndefined();
    expect('a' in doc).toBe(true);
  });
  it('POINTERS:34 setValue with undefined value deletes the key', () => {
    const doc: any = { a: 1 };
    setValue(doc, '/a', undefined);
    expect('a' in doc).toBe(false);
  });
  it('POINTERS:36 "-" is honored by setValue and add; ordinary key in getValue, remove, replace', () => {
    expect(getValue({ '-': 7 }, '/-')).toBe(7);
    expect(
      applyPatch({ a: [1] }, [{ op: 'add', path: '/a/-', value: 2 }]),
    ).toEqual({ a: [1, 2] });
    expect(
      applyPatch({ '-': 1 }, [{ op: 'replace', path: '/-', value: 2 }]),
    ).toEqual({ '-': 2 });
    expect(applyPatch({ '-': 1 }, [{ op: 'remove', path: '/-' }])).toEqual({});
  });
  it('POINTERS:47 escapePath("config/database") unchanged', () => {
    expect(escapePath('config/database')).toBe('config/database');
  });
  it('POINTERS:48 escapeSegment("config/database")', () => {
    expect(escapeSegment('config/database')).toBe('config~1database');
  });
  it('POINTERS:49 escapePath jane~doe', () => {
    expect(escapePath('/users/jane~doe/settings')).toBe(
      '/users/jane~0doe/settings',
    );
  });
  it('POINTERS:55 pointer from escapeSegment(userKey)', () => {
    const userKey = 'a/b';
    expect(`/config/${escapeSegment(userKey)}`).toBe('/config/a~1b');
  });
  it('POINTERS:58 unescapePath leaves ~2 and trailing ~ alone', () => {
    expect(unescapePath('a~2b')).toBe('a~2b');
    expect(unescapePath('a~')).toBe('a~');
    expect(unescapePath('a~0b~1c')).toBe('a~b/c');
  });
  it('POINTERS:58 unescapeSegment is an alias for the same function', () => {
    expect(unescapeSegment).toBe(unescapePath);
  });
  it('POINTERS:63 compilePointer("/a~1b/c~0d")', () => {
    expect(compilePointer('/a~1b/c~0d')).toEqual(['', 'a/b', 'c~d']);
  });
  it('POINTERS:64 compilePointer("")', () => {
    expect(compilePointer('')).toEqual([]);
  });
  it('POINTERS:73 getJSONPointer(doc, doc.a.b[2])', () => {
    const doc = { a: { b: [1, 2, { c: 'x' }] } };
    expect(getJSONPointer(doc, doc.a.b[2])).toBe('/a/b/2');
  });
  it('POINTERS:74 getJSONPointer(doc, doc) is ""', () => {
    const doc = { a: { b: [1, 2, { c: 'x' }] } };
    expect(getJSONPointer(doc, doc)).toBe('');
  });
  it('POINTERS:75 getJSONPointer(doc, {}) null', () => {
    const doc = { a: { b: [1, 2, { c: 'x' }] } };
    expect(getJSONPointer(doc, {})).toBeNull();
  });
  it('POINTERS:78 getJSONPointer escapes keys', () => {
    const escaped = { 'a/b': { v: 1 } };
    expect(getJSONPointer(escaped, escaped['a/b'])).toBe('/a~1b');
  });
  it('POINTERS:81 getJSONPath "$.a.b[2]" and "$" and null', () => {
    const doc = { a: { b: [1, 2, { c: 'x' }] } };
    expect(getJSONPath(doc, doc.a.b[2])).toBe('$.a.b[2]');
    expect(getJSONPath(doc, doc)).toBe('$');
    expect(getJSONPath(doc, {})).toBeNull();
  });
  it('POINTERS:83 getJSONPath primitives', () => {
    expect(getJSONPath({ a: 'x', b: 'x' }, 'x')).toBe('$.a');
  });
  it('POINTERS:86 getJSONPath bracket-and-quote form', () => {
    const v = { n: 1 };
    expect(getJSONPath({ 'key.with.dots': v }, v)).toBe("$['key.with.dots']");
  });
  it('POINTERS:93 convertJSONPathToPointer users[0].name', () => {
    expect(convertJSONPathToPointer('users[0].name')).toBe('/users/0/name');
  });
  it('POINTERS:94 convertJSONPathToPointer users[]', () => {
    expect(convertJSONPathToPointer('users[]')).toBe('/users/-');
  });
  it('POINTERS:95 convertJSONPathToPointer ""', () => {
    expect(convertJSONPathToPointer('')).toBe('/');
  });
  it('POINTERS:96 convertJSONPathToPointer "$"', () => {
    expect(convertJSONPathToPointer('$')).toBe('/$');
  });
  it('POINTERS:97 convertJSONPathToPointer a~b.c', () => {
    expect(convertJSONPathToPointer('a~b.c')).toBe('/a~b/c');
  });
  it('POINTERS:98 convertJSONPathToPointer quoted key', () => {
    expect(convertJSONPathToPointer("['key.with.dots']")).toBe(
      "/'key.with.dots'",
    );
  });
  it('POINTERS:105 getJSONPath result piped into convertJSONPathToPointer misses', () => {
    const doc = { users: [{ n: 'a' }, { n: 'b' }] };
    const jsonPath = getJSONPath(doc, doc.users[1]);
    expect(jsonPath).toBe('$.users[1]');
    expect(convertJSONPathToPointer(jsonPath as string)).toBe('/$/users/1');
    expect(
      getValue(doc, convertJSONPathToPointer(jsonPath as string)),
    ).toBeUndefined();
  });
  it('POINTERS:108 double conversion is safe', () => {
    expect(convertJSONPointerToPath(convertJSONPointerToPath('/a/0'))).toBe(
      '.a[0]',
    );
    expect(convertJSONPathToPointer(convertJSONPathToPointer('a[0]'))).toBe(
      '/a/0',
    );
  });
  it('POINTERS:111 convertJSONPointerToPath /users/0/name', () => {
    expect(convertJSONPointerToPath('/users/0/name')).toBe('.users[0].name');
  });
  it('POINTERS:112 convertJSONPathToPointer .users[0].name round-trips', () => {
    expect(convertJSONPathToPointer('.users[0].name')).toBe('/users/0/name');
  });
  it('POINTERS:113 convertJSONPointerToPath("/")', () => {
    expect(convertJSONPointerToPath('/')).toBe('.');
  });
  it('POINTERS:120 constants', () => {
    expect({ ...JSONPointer }).toEqual({ Root: '', Fragment: '#', Separator: '/' });
    expect({ ...JSONPath }).toEqual({
      Root: '$',
      Current: '@',
      Child: '.',
      Filter: '#',
    });
  });
  it('POINTERS:120 "/" addresses member named with the empty string', () => {
    expect(getValue({ '': 'empty' }, '/')).toBe('empty');
  });
});

describe('JSDOC', () => {
  it('JSDOC applyPatch:68 object patches', () => {
    const source = { name: 'John', age: 30, hobbies: ['reading'] };
    const patches: Patch[] = [
      { op: 'replace', path: '/age', value: 31 },
      { op: 'add', path: '/city', value: 'NYC' },
      { op: 'add', path: '/hobbies/-', value: 'coding' },
    ];
    expect(applyPatch(source, patches)).toEqual({
      name: 'John',
      age: 31,
      city: 'NYC',
      hobbies: ['reading', 'coding'],
    });
  });
  it('JSDOC applyPatch:80 array patches', () => {
    const patches: Patch[] = [
      { op: 'replace', path: '/1', value: 5 },
      { op: 'add', path: '/3', value: 4 },
    ];
    expect(applyPatch([1, 2, 3], patches)).toEqual([1, 5, 3, 4]);
  });
  it.skip('JSDOC applyPatch:86 mutating in place -- uses undefined variables and states no result', () => {});
  it('JSDOC compare:43 object compare', () => {
    expect(
      compare(
        { name: 'John', age: 30, city: 'NYC' },
        { name: 'John', age: 31, country: 'USA' },
      ),
    ).toEqual([
      { op: 'replace', path: '/age', value: 31 },
      { op: 'remove', path: '/city' },
      { op: 'add', path: '/country', value: 'USA' },
    ]);
  });
  it.skip('JSDOC compare:57 array compare -- result only described as "index-based changes"', () => {});
  it('JSDOC difference:44 object', () => {
    expect(
      difference(
        { name: 'John', age: 30, city: 'NYC' },
        { name: 'John', age: 31, country: 'USA' },
      ),
    ).toEqual({ age: 31, city: null, country: 'USA' });
  });
  it('JSDOC difference:54 primitive replacement', () => {
    expect(difference('old value', 'new value')).toBe('new value');
  });
  it('JSDOC difference:64 array replacement', () => {
    expect(difference([1, 2, 3], [1, 3, 4])).toEqual([1, 3, 4]);
  });
  it('JSDOC difference:74 no changes', () => {
    expect(
      difference({ unchanged: 'data' }, { unchanged: 'data' }),
    ).toBeUndefined();
  });
  it('JSDOC difference:84 nested', () => {
    expect(
      difference(
        { user: { name: 'Alice', age: 25, temp: 'data' } },
        { user: { name: 'Bob', age: 25 } },
      ),
    ).toEqual({ user: { name: 'Bob', temp: null } });
  });
  it('JSDOC mergePatch:52 add and modify', () => {
    expect(
      mergePatch({ name: 'John', age: 30 }, { age: 31, city: 'NYC' }),
    ).toEqual({ name: 'John', age: 31, city: 'NYC' });
  });
  it('JSDOC mergePatch:62 null removal', () => {
    expect(
      mergePatch(
        { name: 'John', age: 30, temp: 'data' },
        { age: 31, temp: null },
      ),
    ).toEqual({ name: 'John', age: 31 });
  });
  it('JSDOC mergePatch:72 complete replacement', () => {
    expect(mergePatch({ complex: 'object' }, 'simple string')).toBe(
      'simple string',
    );
  });
  it('JSDOC mergePatch:82 nested merging', () => {
    expect(
      mergePatch(
        { user: { name: 'Alice', age: 25, role: 'admin' } },
        { user: { age: 26, role: null } },
      ),
    ).toEqual({ user: { name: 'Alice', age: 26 } });
  });
  it('JSDOC mergePatch:92 mutable operation', () => {
    const source = { data: 'original' };
    const patch = { data: 'modified', new: 'value' };
    const result = mergePatch(source, patch, false);
    expect(source === result).toBe(true);
    expect(result).toEqual({ data: 'modified', new: 'value' });
  });
  it('JSDOC getValue:72 basic access', () => {
    const obj = { foo: { bar: 'baz' } };
    expect(getValue(obj, '/foo/bar')).toBe('baz');
    expect(getValue(obj, ['foo', 'bar'])).toBe('baz');
  });
  it('JSDOC getValue:89 array index access', () => {
    const data = {
      users: [
        { name: 'Alice', age: 30 },
        { name: 'Bob', age: 25 },
      ],
    };
    expect(getValue(data, '/users/0/name')).toBe('Alice');
    expect(getValue(data, '/users/1/age')).toBe(25);
  });
  it('JSDOC getValue:101 root access', () => {
    const document = { title: 'Document', content: '...' };
    expect(getValue(document, '')).toEqual({
      title: 'Document',
      content: '...',
    });
    expect(getValue(document, [])).toEqual({
      title: 'Document',
      content: '...',
    });
  });
  it('JSDOC getValue:116 escaped characters', () => {
    const obj = { 'foo/bar': 'value1', 'foo~bar': 'value2' };
    expect(getValue(obj, '/foo~1bar')).toBe('value1');
    expect(getValue(obj, '/foo~0bar')).toBe('value2');
  });
  it('JSDOC getValue:137 complex nested', () => {
    const complex = {
      api: {
        v1: {
          endpoints: [
            { path: '/users', methods: ['GET', 'POST'] },
            { path: '/posts', methods: ['GET'] },
          ],
        },
      },
    };
    expect(getValue(complex, '/api/v1/endpoints/0/methods/1')).toBe('POST');
  });
  it('JSDOC setValue:96 basic property setting', () => {
    const obj = { foo: { bar: 'baz' } };
    expect(setValue(obj, '/foo/bar', 'qux')).toEqual({ foo: { bar: 'qux' } });
    expect(setValue(obj, ['foo', 'newProp'], 'value')).toEqual({
      foo: { bar: 'qux', newProp: 'value' },
    });
  });
  it('JSDOC setValue:112 array manipulation', () => {
    const data = { users: [{ name: 'Alice', age: 30 }] };
    expect(setValue(data, '/users/0/age', 31)).toEqual({
      users: [{ name: 'Alice', age: 31 }],
    });
    expect(setValue(data, '/users/1', { name: 'Bob', age: 25 })).toEqual({
      users: [
        { name: 'Alice', age: 31 },
        { name: 'Bob', age: 25 },
      ],
    });
  });
  it('JSDOC setValue:124 automatic path creation', () => {
    const obj = {};
    expect(setValue(obj, '/nested/deep/property', 'value')).toEqual({
      nested: { deep: { property: 'value' } },
    });
    expect(setValue(obj, '/array/0/item', 'first')).toEqual({
      nested: { deep: { property: 'value' } },
      array: [{ item: 'first' }],
    });
  });
  it('JSDOC setValue:139 overwrite control', () => {
    const obj = { existing: 'original', other: 'data' };
    expect(setValue(obj, '/existing', 'modified', { overwrite: true })).toEqual({
      existing: 'modified',
      other: 'data',
    });
    expect(setValue(obj, '/existing', 'ignored', { overwrite: false })).toEqual(
      { existing: 'modified', other: 'data' },
    );
    expect(setValue(obj, '/new', 'value', { overwrite: false })).toEqual({
      existing: 'modified',
      other: 'data',
      new: 'value',
    });
  });
  it('JSDOC setValue:155 null preservation', () => {
    const obj = { profile: null };
    expect(setValue(obj, '/profile/name', 'John')).toEqual({ profile: null });
    const obj2 = { profile: null };
    expect(
      setValue(obj2, '/profile/name', 'John', { preserveNull: false }),
    ).toEqual({ profile: { name: 'John' } });
    const obj3 = { profile: { name: 'John' } };
    expect(setValue(obj3, '/profile/name', null)).toEqual({
      profile: { name: null },
    });
  });
  it('JSDOC setValue:174 escaped characters', () => {
    const obj = {};
    expect(setValue(obj, '/foo~1bar', 'slash')).toEqual({ 'foo/bar': 'slash' });
    expect(setValue(obj, '/foo~0bar', 'tilde')).toEqual({
      'foo/bar': 'slash',
      'foo~bar': 'tilde',
    });
  });
  it('JSDOC setValue:186 root replacement', () => {
    const obj = { old: 'data' };
    expect(setValue(obj, '', { completely: 'new' })).toEqual({
      completely: 'new',
    });
  });
  it('JSDOC getJSONPointer:21', () => {
    const obj = { a: { b: [1, 2, { c: 'found' }] } };
    expect(getJSONPointer(obj, obj.a.b[2])).toBe('/a/b/2');
  });
  it('JSDOC getJSONPath:34', () => {
    const obj = { a: { b: [1, 2, { c: 'found' }] } };
    expect(getJSONPath(obj, obj.a.b[2])).toBe('$.a.b[2]');
  });
  it('JSDOC getJSONPath:38', () => {
    const obj = { 'key.with.dots': { value: 'found' } };
    expect(getJSONPath(obj, obj['key.with.dots'])).toBe("$['key.with.dots']");
  });
  it('JSDOC convertJSONPathToPointer:9-12', () => {
    expect(convertJSONPathToPointer('data.users[0].name')).toBe(
      '/data/users/0/name',
    );
    expect(convertJSONPathToPointer('items[].id')).toBe('/items/-/id');
    expect(convertJSONPathToPointer('[0].value')).toBe('/0/value');
    expect(convertJSONPathToPointer('')).toBe('/');
  });
  it('JSDOC convertJSONPointerToPath:11-14', () => {
    expect(convertJSONPointerToPath('/data/users/0/name')).toBe(
      '.data.users[0].name',
    );
    expect(convertJSONPointerToPath('/items/-/id')).toBe('.items[].id');
    expect(convertJSONPointerToPath('/0/value')).toBe('.[0].value');
    expect(convertJSONPointerToPath('/')).toBe('.');
  });
  it('JSDOC escapePath:46-50 tildes in segments', () => {
    expect(escapePath('/users/john~doe/settings')).toBe(
      '/users/john~0doe/settings',
    );
    expect(escapePath('/config/app~name/value')).toBe(
      '/config/app~0name/value',
    );
  });
  it('JSDOC escapePath:56-60 separators not escaped', () => {
    expect(escapePath('/files/config/database')).toBe(
      '/files/config/database',
    );
    expect(escapePath('/docs/api/endpoints')).toBe('/docs/api/endpoints');
  });
  it('JSDOC escapePath:66-70 multiple segments', () => {
    expect(escapePath('/app~config/database~host/connection')).toBe(
      '/app~0config/database~0host/connection',
    );
    expect(escapePath('/users/~/profile/~/settings')).toBe(
      '/users/~0/profile/~0/settings',
    );
  });
  it('JSDOC escapePath:76-86 edge cases', () => {
    expect(escapePath('')).toBe('');
    expect(escapePath('/')).toBe('/');
    expect(escapePath('segment~name')).toBe('segment~0name');
    expect(escapePath('/multiple~tildes~~~in~segment/normal')).toBe(
      '/multiple~0tildes~0~0~0in~0segment/normal',
    );
  });
  it('JSDOC escapePath:92-102 real-world', () => {
    expect(escapePath('/users/jane.doe@company.com/preferences')).toBe(
      '/users/jane.doe@company.com/preferences',
    );
    expect(escapePath('/env/production/database~config/host')).toBe(
      '/env/production/database~0config/host',
    );
    expect(escapePath('/uploads/backup~2023/archive')).toBe(
      '/uploads/backup~02023/archive',
    );
  });
  it('JSDOC escapePath:113-117 dynamic path building', () => {
    const buildUserSettingPath = (userId: string, setting: string) =>
      escapePath(`/users/${userId}/settings/${setting}`);
    expect(buildUserSettingPath('user~123', 'theme~dark')).toBe(
      '/users/user~0123/settings/theme~0dark',
    );
    expect(buildUserSettingPath('normaluser', 'normalsetting')).toBe(
      '/users/normaluser/settings/normalsetting',
    );
  });
  it('JSDOC escapePath:123-131 RFC 6901 examples', () => {
    expect(escapePath('/foo/bar')).toBe('/foo/bar');
    expect(escapePath('/a~b')).toBe('/a~0b');
    expect(escapePath('/special!@#$%^&*()/chars')).toBe(
      '/special!@#$%^&*()/chars',
    );
  });
  it('JSDOC escapeSegment:44-48 basic', () => {
    expect(escapeSegment('foo~bar')).toBe('foo~0bar');
    expect(escapeSegment('foo/bar')).toBe('foo~1bar');
  });
  it('JSDOC escapeSegment:54-58 multiple', () => {
    expect(escapeSegment('path~with/both~chars')).toBe('path~0with~1both~0chars');
    expect(escapeSegment('~/~/~/')).toBe('~0~1~0~1~0~1');
  });
  it('JSDOC escapeSegment:64-71 edge cases', () => {
    expect(escapeSegment('')).toBe('');
    expect(escapeSegment('normal_key_123')).toBe('normal_key_123');
    expect(escapeSegment('user@domain.com')).toBe('user@domain.com');
  });
  it('JSDOC escapeSegment:78-85 real-world', () => {
    expect(escapeSegment('config/database')).toBe('config~1database');
    expect(escapeSegment('backup~2023-12-01.json')).toBe(
      'backup~02023-12-01.json',
    );
  });
  it('JSDOC escapeSegment:97-102 integration with pointer operations', () => {
    const data = {
      'files/docs': { size: 1024 },
      'config~prod': { database: 'localhost' },
    };
    const filePointer = `/${escapeSegment('files/docs')}/size`;
    const configPointer = `/${escapeSegment('config~prod')}/database`;
    expect(filePointer).toBe('/files~1docs/size');
    expect(configPointer).toBe('/config~0prod/database');
    expect(getValue(data, filePointer)).toBe(1024);
    expect(getValue(data, configPointer)).toBe('localhost');
  });
  it('JSDOC unescapePath:50-54 basic', () => {
    expect(unescapePath('foo~0bar')).toBe('foo~bar');
    expect(unescapePath('foo~1bar')).toBe('foo/bar');
  });
  it('JSDOC unescapePath:60-64 multiple', () => {
    expect(unescapePath('path~0with~1both~0chars')).toBe('path~with/both~chars');
    expect(unescapePath('~0~1~0~1~0~1')).toBe('~/~/~/');
  });
  it('JSDOC unescapePath:70-77 edge cases', () => {
    expect(unescapePath('')).toBe('');
    expect(unescapePath('normal_key_123')).toBe('normal_key_123');
    expect(unescapePath('user@domain.com')).toBe('user@domain.com');
  });
  it('JSDOC unescapePath:83-90 malformed sequences', () => {
    expect(unescapePath('invalid~2sequence')).toBe('invalid~2sequence');
    expect(unescapePath('incomplete~sequence')).toBe('incomplete~sequence');
    expect(unescapePath('mixed~0valid~2invalid~1valid')).toBe(
      'mixed~valid~2invalid/valid',
    );
  });
  it('JSDOC unescapePath:96-104 real-world', () => {
    expect(unescapePath('config~1database')).toBe('config/database');
    expect(unescapePath('backup~02023-12-01.json')).toBe(
      'backup~2023-12-01.json',
    );
  });
  it('JSDOC unescapePath:116-125 integration', () => {
    const data: Record<string, any> = {
      'files/docs': { size: 1024 },
      'config~prod': { database: 'localhost' },
    };
    expect(data[unescapePath('files~1docs')].size).toBe(1024);
    expect(data[unescapePath('config~0prod')].database).toBe('localhost');
  });
});
