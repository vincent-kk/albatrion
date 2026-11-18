import { describe, expect, it } from 'vitest';
import { getValue } from '../utils/manipulator/getValue';
import { setValue } from '../utils/manipulator/setValue';
import { compilePointer } from '../utils/manipulator/utils/compileSegments';
import { applyPatch } from '../utils/patch/applyPatch/applyPatch';

describe('round-2 json 8: fragment and plain pointer equivalence', () => {
  it.each(['a b', 'a/b', 'a~b'])('decodes the fragment for %s', (key) => {
    const doc = { [key]: 1 };
    const plain = '/' + key.replace(/~/g, '~0').replace(/\//g, '~1');
    const fragment = '#' + encodeURI(plain);
    expect(getValue(doc, fragment)).toBe(getValue(doc, plain));
    expect(setValue({}, fragment, 2)).toEqual(setValue({}, plain, 2));
    expect(compilePointer(fragment).slice(1)).toEqual(compilePointer(plain).slice(1));
  });
  it('decodes escaped percent characters once', () => {
    expect(getValue({ '%20': 1 }, '#/%2520')).toBe(getValue({ '%20': 1 }, '/%20'));
  });
  it('uses the same decoded paths for patch targets and move sources', () => {
    const source = { 'a b': 1, out: 0 };
    expect(applyPatch(source, [{ op: 'replace', path: '#/a%20b', value: 2 }])).toEqual(applyPatch(source, [{ op: 'replace', path: '/a b', value: 2 }]));
    expect(applyPatch(source, [{ op: 'move', from: '#/a%20b', path: '/out' }])).toEqual(applyPatch(source, [{ op: 'move', from: '/a b', path: '/out' }]));
  });
});


describe('round-2 json 8: malformed fragment failures', () => {
  it.each(['#/%', '#/%E0%A4%A'])('reports structured errors for %s', pointer => {
    expect(() => getValue({}, pointer)).toThrow();
    expect(() => setValue({}, pointer, 1)).toThrow();
    expect(() => applyPatch({}, [{ op: 'add', path: pointer, value: 1 }])).toThrow();
  });
  it('rejects moves into the same decoded descendant across pointer forms', () => {
    const doc = { 'a b': { child: 1 } };
    expect(() => applyPatch(doc, [{ op: 'move', from: '#/a%20b', path: '/a b/child' }])).toThrow();
  });
});
