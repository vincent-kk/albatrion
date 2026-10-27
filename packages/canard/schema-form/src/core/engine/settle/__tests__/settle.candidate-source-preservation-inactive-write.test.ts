import { expect, it } from 'vitest';

import { createDispatchTree } from '../../__tests__/fixtures/createDispatchTree';
import type { BlueprintSchema } from '../../blueprint';
import { WriteOption } from '../../types/value';
import { dispatchMount, dispatchSetValue } from '../../write';
import { HostLatent } from '../utils/latentStore/HostLatent';
import { getDispatchNode } from './fixtures/getDispatchNode';

it('keeps declared off-write payload out of the host raw and inactive host value', () => {
  const { root, runtime } = createDispatchTree({
    type: 'object',
    properties: {
      open: { type: 'boolean' },
      list: {
        type: 'array',
        controls: { active: '../open' },
        allOf: [
          { controls: { active: false }, prefixItems: [{ type: 'number' }] },
          { controls: { active: false }, prefixItems: [{ type: 'string' }] },
        ],
      },
    },
  });
  dispatchMount(root, { open: false });
  dispatchSetValue(root, { open: false, list: [7, 'tail'] });
  expect(root.emit).toEqual({ open: false });
  expect(runtime.latentRaw.get(JSON.stringify(['/list', 'array']))).toEqual(
    new HostLatent([undefined, 'tail'], undefined, ['0']),
  );
  expect(runtime.latentRaw.get(JSON.stringify(['/list/0', 'number']))).toBe(7);
  expect(runtime.inactiveValuesMemo.get('')).toEqual([
    { path: '/list', value: [undefined, 'tail'] },
    { path: '/list/0', value: 7 },
  ]);
});

it('replaces nested off-write array scope on a partial parent write', () => {
  const { root, runtime } = createDispatchTree({
    type: 'object',
    properties: {
      open: { type: 'boolean' },
      a: { type: 'boolean' },
      b: { type: 'boolean' },
      host: {
        type: 'object',
        controls: { active: '../open' },
        properties: {
          list: {
            type: 'array',
            allOf: [
              { controls: { active: '../../a' }, items: { type: 'number' } },
              { controls: { active: '../../b' }, items: { type: 'string' } },
            ],
          },
        },
      },
    },
  });
  dispatchMount(root, { open: false, a: false, b: false });
  dispatchSetValue(root, {
    open: false,
    a: false,
    b: false,
    host: { list: [7, 71], extra: 'kept' },
  });
  expect(
    runtime.latentRaw.get(JSON.stringify(['/host/list/1', 'number'])),
  ).toBe(71);
  expect(
    runtime.latentRawMetadata?.has(JSON.stringify(['/host/list/1', 'number'])),
  ).toBe(true);
  dispatchSetValue(root, { host: { list: [8] } }, WriteOption.Merge);
  expect(
    runtime.latentRaw.has(JSON.stringify(['/host/list/1', 'number'])),
  ).toBe(false);
  expect(
    runtime.latentRawMetadata?.has(
      JSON.stringify(['/host/list/1', 'number']),
    ) ?? false,
  ).toBe(false);
  expect(
    runtime.latentRaw.get(JSON.stringify(['/host/list/0', 'number'])),
  ).toBe(8);
  expect(
    runtime.latentRaw.get(JSON.stringify(['/host/list', 'array'])),
  ).toEqual(new HostLatent([undefined], undefined, ['0']));
  dispatchSetValue(getDispatchNode(root, 'a'), true);
  dispatchSetValue(getDispatchNode(root, 'open'), true);
  expect(root.emit).toEqual({
    open: true,
    a: true,
    b: false,
    host: { list: [8], extra: 'kept' },
  });
});

it.each([
  { keyword: 'items', layout: 'direct', reversed: false, bFirst: false },
  { keyword: 'items', layout: 'direct', reversed: false, bFirst: true },
  { keyword: 'items', layout: 'direct', reversed: true, bFirst: false },
  { keyword: 'items', layout: 'direct', reversed: true, bFirst: true },
  { keyword: 'items', layout: 'object', reversed: false, bFirst: false },
  { keyword: 'items', layout: 'object', reversed: false, bFirst: true },
  { keyword: 'items', layout: 'object', reversed: true, bFirst: false },
  { keyword: 'items', layout: 'object', reversed: true, bFirst: true },
  { keyword: 'items', layout: 'array', reversed: false, bFirst: false },
  { keyword: 'items', layout: 'array', reversed: false, bFirst: true },
  { keyword: 'items', layout: 'array', reversed: true, bFirst: false },
  { keyword: 'items', layout: 'array', reversed: true, bFirst: true },
  { keyword: 'prefixItems', layout: 'direct', reversed: false, bFirst: false },
  { keyword: 'prefixItems', layout: 'direct', reversed: false, bFirst: true },
  { keyword: 'prefixItems', layout: 'direct', reversed: true, bFirst: false },
  { keyword: 'prefixItems', layout: 'direct', reversed: true, bFirst: true },
  { keyword: 'prefixItems', layout: 'object', reversed: false, bFirst: false },
  { keyword: 'prefixItems', layout: 'object', reversed: false, bFirst: true },
  { keyword: 'prefixItems', layout: 'object', reversed: true, bFirst: false },
  { keyword: 'prefixItems', layout: 'object', reversed: true, bFirst: true },
  { keyword: 'prefixItems', layout: 'array', reversed: false, bFirst: false },
  { keyword: 'prefixItems', layout: 'array', reversed: false, bFirst: true },
  { keyword: 'prefixItems', layout: 'array', reversed: true, bFirst: false },
  { keyword: 'prefixItems', layout: 'array', reversed: true, bFirst: true },
])(
  '$keyword $layout binds an off-write at write time, reversed=$reversed B-first=$bFirst',
  ({ keyword, layout, reversed, bFirst }) => {
    const gate = layout === 'direct' ? '../' : '../../';
    const declarations: BlueprintSchema[] = (['number', 'string'] as const).map(
      (type) => ({
        controls: { active: gate + (type === 'number' ? 'a' : 'b') },
        ...(layout === 'object'
          ? { properties: { v: { type } } }
          : {
              [layout === 'direct' ? keyword : 'items']:
                layout === 'direct' && keyword === 'prefixItems'
                  ? [{ type }]
                  : { type },
            }),
      }),
    );
    if (reversed) declarations.reverse();
    const child: BlueprintSchema = {
      type: layout === 'object' ? 'object' : 'array',
      allOf: declarations,
    };
    const list: BlueprintSchema =
      layout === 'direct'
        ? child
        : {
            type: 'array',
            [keyword]: keyword === 'items' ? child : [child],
          };
    const { root, runtime } = createDispatchTree({
      type: 'object',
      properties: {
        open: { type: 'boolean' },
        a: { type: 'boolean' },
        b: { type: 'boolean' },
        list: { ...list, controls: { active: '../open' } },
      },
    });
    dispatchMount(root, { open: false, a: false, b: false, list: [] });
    const input =
      layout === 'direct' ? [7] : layout === 'object' ? [{ v: 7 }] : [[7]];
    dispatchSetValue(root, { open: false, a: false, b: false, list: input });
    const path =
      layout === 'direct'
        ? '/list/0'
        : layout === 'object'
          ? '/list/0/v'
          : '/list/0/0';
    const kind = reversed ? 'string' : 'number';
    const value = reversed ? '7' : 7;
    expect(runtime.latentRaw.get(JSON.stringify([path, kind]))).toBe(value);
    expect(
      runtime.latentRaw.has(
        JSON.stringify([path, reversed ? 'number' : 'string']),
      ),
    ).toBe(false);
    expect(root.emit).toEqual({ open: false, a: false, b: false });
    for (const b of [bFirst, !bFirst]) {
      dispatchSetValue(getDispatchNode(root, b ? 'a' : 'b'), false);
      dispatchSetValue(getDispatchNode(root, b ? 'b' : 'a'), true);
      dispatchSetValue(getDispatchNode(root, 'open'), true);
      const shown = b === reversed ? value : undefined;
      const expected =
        layout === 'direct'
          ? [shown ?? null]
          : layout === 'object'
            ? [shown === undefined ? {} : { v: shown }]
            : [[shown ?? null]];
      expect(getDispatchNode(root, 'list').emit).toEqual(expected);
      if (shown === undefined)
        expect(runtime.latentRaw.get(JSON.stringify([path, kind]))).toBe(value);
    }
  },
);

it.each([false, true])(
  'retains off-write length and undeclared tails, reversed=%s',
  (reversed) => {
    const fragments: BlueprintSchema[] = [
      { controls: { active: '../a' }, prefixItems: [{ type: 'number' }] },
      { controls: { active: '../b' }, prefixItems: [{ type: 'string' }] },
    ];
    if (reversed) fragments.reverse();
    const { root, runtime } = createDispatchTree({
      type: 'object',
      properties: {
        open: { type: 'boolean' },
        a: { type: 'boolean' },
        b: { type: 'boolean' },
        list: {
          type: 'array',
          controls: { active: '../open' },
          allOf: fragments,
        },
      },
    });
    const tail = ['tail', { extra: true }];
    dispatchMount(root, { open: false, a: false, b: false, list: [] });
    dispatchSetValue(root, {
      open: false,
      a: false,
      b: false,
      list: [7, ...tail],
    });
    const kind = reversed ? 'string' : 'number';
    expect(runtime.latentRaw.get(JSON.stringify(['/list/0', kind]))).toBe(
      reversed ? '7' : 7,
    );
    dispatchSetValue(getDispatchNode(root, reversed ? 'a' : 'b'), true);
    dispatchSetValue(getDispatchNode(root, 'open'), true);
    expect(getDispatchNode(root, 'list').emit).toEqual([null, ...tail]);
    expect(getDispatchNode(root, 'list').itemCount).toBe(3);
    dispatchSetValue(getDispatchNode(root, reversed ? 'a' : 'b'), false);
    dispatchSetValue(getDispatchNode(root, reversed ? 'b' : 'a'), true);
    expect(getDispatchNode(root, 'list').emit).toEqual([
      reversed ? '7' : 7,
      ...tail,
    ]);
  },
);
