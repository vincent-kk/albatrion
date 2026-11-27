import { beforeEach, expect, it } from 'vitest';

import { locateNode } from '@/schema-form/__tests__/fixtures/remountEquivalence/locateNode';
import { prepareMasks } from '@/schema-form/__tests__/fixtures/remountEquivalence/prepareMasks';
import type { RemountScene } from '@/schema-form/__tests__/fixtures/remountEquivalence/types';

import { applyCoreWrite } from './helpers/applyCoreWrite';
import { mountScene } from './helpers/mountScene';

it('observes branch markers through the public effective schema', () => {
  const scene: RemountScene = {
    id: 'marker-probe',
    seed: 443,
    group: 'infrastructure',
    initialValue: { kind: 'a' },
    writes: [],
    schema: {
      type: 'object',
      properties: { kind: { type: 'string' } },
      oneOf: [
        {
          title: 'marker-a',
          controls: { active: "./kind === 'a'" },
          properties: { a: { type: 'string' } },
        },
        {
          title: 'marker-b',
          controls: { active: "./kind === 'b'" },
          properties: { b: { type: 'string' } },
        },
      ],
    },
  };
  const { root } = mountScene(scene, scene.initialValue);
  expect(typeof root.jsonSchema === 'object' && root.jsonSchema.title).toBe(
    'marker-a',
  );
  applyCoreWrite(
    root,
    { action: 'setValue', path: '/kind', value: 'b' },
    new Map(),
  );
  expect(typeof root.jsonSchema === 'object' && root.jsonSchema.title).toBe(
    'marker-b',
  );
});

it('locates star, slash and tilde names literally', () => {
  const scene: RemountScene = {
    id: 'literal-names',
    seed: 443,
    group: 'infrastructure',
    writes: [],
    schema: {
      type: 'object',
      properties: {
        plain: { type: 'string' },
        '*': { type: 'string' },
        '/': { type: 'string' },
        '~': { type: 'string' },
      },
    },
  };
  const { root } = mountScene(scene, {
    plain: 'p',
    '*': 'star',
    '/': 'slash',
    '~': 'tilde',
  });
  expect(locateNode(root, '/*')?.value).toBe('star');
  expect(locateNode(root, '/~1')?.value).toBe('slash');
  expect(locateNode(root, '/~0')?.value).toBe('tilde');
});

it('rejects a static mask whose value is read by watch', () => {
  const scene: RemountScene = {
    id: 'mask-reader',
    seed: 443,
    group: 'infrastructure',
    writes: [],
    schema: {
      type: 'object',
      properties: {
        cfg: { type: 'string' },
        watcher: { type: 'string', controls: { watch: ['../cfg'] } },
      },
    },
    masks: [
      {
        prefix: 0,
        entries: [
          {
            path: '/nodes/~1cfg/value',
            fresh: undefined,
            category: 'omitEmpty',
            clause: 'VALUE-031(b)',
          },
        ],
      },
    ],
  };
  expect(() => prepareMasks(scene, 0)).toThrow('MASK_READER_OVERLAP');
});

it('retains independent marker keywords for simultaneous anyOf selections', () => {
  const scene: RemountScene = {
    id: 'anyof-marker',
    seed: 443,
    group: 'infrastructure',
    initialValue: { a: true, b: true },
    writes: [],
    schema: {
      type: 'object',
      properties: { a: { type: 'boolean' }, b: { type: 'boolean' } },
      anyOf: [
        { 'x-remount-a': true, controls: { active: './a === true' } },
        { 'x-remount-b': true, controls: { active: './b === true' } },
      ],
    },
  };
  const { root } = mountScene(scene, scene.initialValue);
  expect(root.jsonSchema).toMatchObject({
    'x-remount-a': true,
    'x-remount-b': true,
  });
  applyCoreWrite(
    root,
    { action: 'setValue', path: '/a', value: false },
    new Map(),
  );
  expect(root.jsonSchema).not.toHaveProperty('x-remount-a');
  expect(root.jsonSchema).toHaveProperty('x-remount-b', true);
});

beforeEach(({ task }) => {
  Object.assign(task.meta, { project: task.file.projectName });
});

it('requires the effective projection option before admitting a static mask', () => {
  const scene: RemountScene = {
    id: 'mask-option',
    seed: 443,
    group: 'infrastructure',
    writes: [],
    schema: { type: 'object' },
    masks: [
      {
        prefix: 0,
        entries: [
          {
            path: '/nodes/~1cfg/value',
            fresh: undefined,
            category: 'omitEmpty',
            clause: 'VALUE-031(b)',
          },
        ],
      },
    ],
  };
  expect(() => prepareMasks(scene, 0, () => ({ type: 'string' }))).toThrow(
    'MASK_OPTION_NOT_ENABLED',
  );
  expect(
    prepareMasks(scene, 0, () => ({
      type: 'string',
      options: { omitEmpty: true },
    })),
  ).toHaveLength(1);
});
