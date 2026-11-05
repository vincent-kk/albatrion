import { describe, expect, it } from 'vitest';

import { createDispatchTree } from '@/schema-form/core/engine/__tests__/fixtures/createDispatchTree';
import { dispatchMount } from '@/schema-form/core/engine/write';

import { readFieldNodeErrors } from '../utils/read/readFieldNodeErrors';
import { routeValidationIssues } from '../utils/route/routeValidationIssues';

// filid:contract validation-route
describe('validation issue attribution', () => {
  it('VALIDATE-043 FRAGMENT-053 assigns rejected keys to their host and terminal descendants to the terminal', () => {
    const { root, runtime } = createDispatchTree({
      type: 'object',
      properties: {
        host: { type: 'object', properties: { known: { type: 'string' } } },
        terminal: { type: 'string' },
      },
    });
    dispatchMount(root, { host: { known: 'a' }, terminal: 'b' });
    const issues = [
      { dataPath: '/host', rejectedKey: 'extra', message: 'extra' },
      { dataPath: '/terminal/deep', message: 'inner' },
      { dataPath: '/absent', message: 'ownerless' },
    ];
    routeValidationIssues([root], issues);
    expect(runtime.globalErrors).toBe(issues);
    expect(
      readFieldNodeErrors(root.structure?.host ?? root).map(
        (issue) => issue.message,
      ),
    ).toEqual(['extra']);
    expect(
      readFieldNodeErrors(root.structure?.terminal ?? root).map(
        (issue) => issue.message,
      ),
    ).toEqual(['inner']);
    expect(readFieldNodeErrors(root)).toEqual([]);
  });

  it('VALIDATE-051 climbs a non-empty rejected-key issue from a non-root terminal object to its branch parent and keeps an empty key on the terminal', () => {
    const { root } = createDispatchTree({
      type: 'object',
      properties: {
        held: {
          type: 'object',
          options: { terminal: true },
          properties: { name: { type: 'string' } },
        },
      },
    });
    dispatchMount(root, { held: { name: 'a' } });
    const held = root.structure?.held ?? root;
    expect(held).not.toBe(root);
    expect(held.structure).toBeNull();
    const inner = { dataPath: '/held', message: 'inner' };
    const rejected = {
      dataPath: '/held',
      rejectedKey: 'extra',
      message: 'rejected',
    };
    const emptyKey = { dataPath: '/held', rejectedKey: '', message: 'empty' };
    routeValidationIssues([root], [inner, rejected, emptyKey]);
    expect(readFieldNodeErrors(held)).toEqual([inner, emptyKey]);
    expect(readFieldNodeErrors(root)).toEqual([rejected]);
  });

  it('VALIDATE-051 keeps a union host keyword on its data node', () => {
    const { root } = createDispatchTree({ type: ['string', 'number'] });
    dispatchMount(root, 'x');
    routeValidationIssues([root], [
      {
        dataPath: '',
        keyword: 'oneOf',
        schemaPath: '#/oneOf',
        message: 'host',
      },
    ]);
    expect(readFieldNodeErrors(root).map((issue) => issue.message)).toEqual([
      'host',
    ]);
  });

  it('VALIDATE-043 keeps allOf, if, and controls.active issues visible', () => {
    const { root } = createDispatchTree({
      type: 'object',
      properties: { flag: { type: 'boolean' }, value: { type: 'string' } },
      allOf: [{ properties: { value: { minLength: 3 } } }],
      if: { properties: { flag: { const: true } } },
      then: { properties: { value: { pattern: '^A' } } },
    });
    dispatchMount(root, { flag: true, value: 'b' });
    routeValidationIssues([root], [
      {
        dataPath: '/value',
        schemaPath: '#/allOf/0/properties/value/minLength',
      },
      { dataPath: '/value', schemaPath: '#/then/properties/value/pattern' },
      { dataPath: '/value', schemaPath: '#/properties/value/controls/active' },
    ]);
    expect(readFieldNodeErrors(root.structure?.value ?? root)).toHaveLength(3);
  });

  describe('terminal roots', () => {
    it('VALIDATE-043 routes an inner issue of a terminal object root to the root unchanged', () => {
      const { root, runtime } = createDispatchTree({
        type: 'object',
        options: { terminal: true },
        properties: { name: { type: 'string' } },
      });
      dispatchMount(root, { name: 'a' });
      const issue = { dataPath: '/name', message: 'short' };
      routeValidationIssues([root], [issue]);
      expect(root.structure).toBeNull();
      expect(readFieldNodeErrors(root)).toEqual([issue]);
      expect(readFieldNodeErrors(root)[0].dataPath).toBe('/name');
      expect(runtime.globalErrors).toEqual([issue]);
    });

    it('VALIDATE-043 routes an issue whose dataPath has an undecodable percent escape to a terminal root unchanged', () => {
      const { root } = createDispatchTree({
        type: 'object',
        options: { terminal: true },
        properties: { name: { type: 'string' } },
      });
      dispatchMount(root, { name: 'a' });
      const issue = { dataPath: '#/na%me', message: 'malformed' };
      routeValidationIssues([root], [issue]);
      expect(readFieldNodeErrors(root)).toEqual([issue]);
      expect(readFieldNodeErrors(root)[0].dataPath).toBe('#/na%me');
    });

    it('VALIDATE-051 keeps a rejected-key issue on a terminal root because it has no parent to climb to', () => {
      const { root } = createDispatchTree({
        type: 'object',
        options: { terminal: true },
        properties: { name: { type: 'string' } },
      });
      dispatchMount(root, { name: 'a' });
      const issue = { dataPath: '', rejectedKey: 'extra', message: 'rejected' };
      routeValidationIssues([root], [issue]);
      expect(readFieldNodeErrors(root)).toEqual([issue]);
    });

    it('VALIDATE-043 routes an item issue of a terminal array root to the root', () => {
      const { root } = createDispatchTree({
        type: 'array',
        items: { type: 'string' },
        options: { terminal: true },
      });
      dispatchMount(root, ['a']);
      const issue = { dataPath: '/0', message: 'item' };
      routeValidationIssues([root], [issue]);
      expect(root.structure).toBeNull();
      expect(readFieldNodeErrors(root)).toEqual([issue]);
    });

    it('VALIDATE-043 routes an inner issue of a multi-kind union root to the root', () => {
      const { root } = createDispatchTree({ type: ['object', 'string'] });
      dispatchMount(root, { name: 'a' });
      const issue = { dataPath: '/name', message: 'inner' };
      routeValidationIssues([root], [issue]);
      expect(root.structure).toBeNull();
      expect(readFieldNodeErrors(root)).toEqual([issue]);
    });

    it('VALIDATE-043 assigns the same inner issue to a non-root terminal the same way', () => {
      const { root } = createDispatchTree({
        type: 'object',
        properties: {
          held: {
            type: 'object',
            options: { terminal: true },
            properties: { name: { type: 'string' } },
          },
        },
      });
      dispatchMount(root, { held: { name: 'a' } });
      const issue = { dataPath: '/held/name', message: 'short' };
      routeValidationIssues([root], [issue]);
      const held = root.structure?.held ?? root;
      expect(held).not.toBe(root);
      expect(readFieldNodeErrors(held)).toEqual([issue]);
      expect(readFieldNodeErrors(root)).toEqual([]);
    });

    it('VALIDATE-043 keeps every issue once and in order on a terminal root', () => {
      const { root, runtime } = createDispatchTree({
        type: 'object',
        options: { terminal: true },
        properties: { name: { type: 'string' } },
      });
      dispatchMount(root, { name: 'a' });
      const issues = [
        { dataPath: '/name', message: 'first' },
        { dataPath: '', message: 'second' },
        { dataPath: '/name/deeper', message: 'third' },
      ];
      routeValidationIssues([root], issues);
      expect(runtime.globalErrors).toBe(issues);
      expect(readFieldNodeErrors(root)).toEqual(issues);
    });
  });

  describe('unresolved paths on a branch root', () => {
    it('VALIDATE-043 still drops an issue whose first segment names no child', () => {
      const { root, runtime } = createDispatchTree({
        type: 'object',
        properties: { name: { type: 'string' } },
      });
      dispatchMount(root, { name: 'a' });
      const issues = [
        { dataPath: '/absent', message: 'ownerless' },
        { dataPath: '/name', message: 'named' },
      ];
      routeValidationIssues([root], issues);
      expect(readFieldNodeErrors(root)).toEqual([]);
      expect(readFieldNodeErrors(root.structure?.name ?? root)).toEqual([
        issues[1],
      ]);
      expect(runtime.globalErrors).toBe(issues);
    });

    it('VALIDATE-043 routes the empty-name slash path to the empty-name child', () => {
      const { root } = createDispatchTree({
        type: 'object',
        properties: { '': { type: 'string' }, name: { type: 'string' } },
      });
      dispatchMount(root, { '': 'empty', name: 'ordinary' });
      const issue = { dataPath: '/', message: 'empty-name issue' };
      routeValidationIssues([root], [issue]);
      expect(readFieldNodeErrors(root.structure?.[''] ?? root)).toEqual([
        issue,
      ]);
      expect(readFieldNodeErrors(root)).toEqual([]);
    });
  });
});
