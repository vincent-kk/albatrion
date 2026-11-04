import type { RemountScene, RemountWrite } from '../../types';
import { markBranches } from './markBranches';

/**
 * Compose one family grammar with independent name/state/value/order axes.
 * @param seed - Replay seed included in the scene identity.
 * @param family - One of sixteen semantic grammars.
 * @param variant - Stable family-local index.
 * @param entropy - LCG output used for values and declaration order.
 * @returns Pure scene data with no shared blueprint or mounted occurrence.
 */
export function createCorpusScene(
  seed: number,
  family: number,
  variant: number,
  entropy: number,
): RemountScene {
  const name = ['*', '*x', '~', '/'][(variant + family) % 4];
  const state = ['visible', 'readOnly', 'disabled', 'active'][
    (Math.floor(variant / 4) + family) % 4
  ];
  const number = (entropy % 17) + 1;
  const properties: Record<string, unknown> = {
    kind: { type: 'string' },
    n: { type: 'number' },
    [name]: {
      type: 'string',
      controls: {
        [state]: '../n > 0',
        resetInteraction: '../n < 0',
        unsetOnInactive: variant % 2 === 0,
      },
    },
  };
  const initial: Record<string, unknown> = {
    kind: 'a',
    n: number,
    [name]: 'R',
    extra: `extra-${entropy % 7}`,
  };
  const schema: Record<string, unknown> = {
    type: 'object',
    properties,
    additionalProperties: true,
  };
  const writes: RemountWrite[] = [];
  const marker = `remount:${seed}:${family}:${variant}`;
  if (family === 0) {
    schema.if = { properties: { kind: { const: 'a' } }, required: ['kind'] };
    schema.then = {
      title: `${marker}:then`,
      properties: { left: { type: ['string', 'null'] } },
    };
    schema.else = {
      title: `${marker}:else`,
      properties: { right: { type: 'number' } },
    };
    writes.push(
      { action: 'setValue', path: '/kind', value: 'b' },
      { action: 'setValue', path: '/kind', value: 'a' },
    );
  } else if (family === 1) {
    properties.toggle = { type: 'boolean' };
    schema.dependentSchemas = {
      toggle: {
        title: `${marker}:dependent`,
        properties: { detail: { type: 'string' } },
      },
    };
    writes.push(
      { action: 'merge', path: '', value: { toggle: true, detail: 'latent' } },
      { action: 'setValue', path: '/toggle', value: undefined },
    );
  } else if (family === 2 || family === 5) {
    if (family === 5) schema.controls = { discriminator: 'kind' };
    schema.oneOf = ['a', 'b'].map((kind) => ({
      title: `${marker}:${kind}`,
      ...(family === 2
        ? { controls: { active: `./kind === '${kind}'` } }
        : { required: ['kind'] }),
      properties: {
        ...(family === 5 ? { kind: { const: kind } } : {}),
        [`branch_${kind}`]: { type: 'string' },
      },
    }));
    writes.push(
      { action: 'setValue', path: '/kind', value: 'b' },
      { action: 'setValue', path: '/kind', value: 'a' },
    );
  } else if (family === 3) {
    schema.anyOf = [
      {
        title: `${marker}:or`,
        controls: { active: "./kind === 'a' || ./n > 0" },
        properties: { selected: { type: 'string' } },
      },
      {
        title: `${marker}:other`,
        controls: { active: './n < 0' },
        properties: { negative: { type: 'boolean' } },
      },
    ];
    writes.push(
      { action: 'setValue', path: '/kind', value: 'b' },
      { action: 'setValue', path: '/n', value: -number },
      { action: 'setValue', path: '/n', value: number },
    );
  } else if (family === 4) {
    properties.items = { type: 'array', items: { type: 'string' } };
    initial.items = ['off'];
    schema.allOf = [
      {
        title: `${marker}:includes`,
        controls: { active: "(./items).includes('on')" },
        properties: { included: { type: 'string' } },
      },
    ];
    writes.push(
      { action: 'push', path: '/items', value: 'on' },
      { action: 'remove', path: '/items', index: 1 },
      { action: 'insert', path: '/items', index: 0, value: 'on' },
    );
  } else if (family === 6) {
    properties.source = { type: 'string', controls: { active: '../n > 0' } };
    properties[name] = {
      type: 'string',
      controls: { [state]: "../source === 'v'" },
    };
    initial.source = 'v';
    writes.push(
      { action: 'setValue', path: '/n', value: -number },
      { action: 'setValue', path: '/n', value: number },
      { action: 'setValue', path: '/n', value: null },
      { action: 'setValue', path: '/n', value: { wrong: true } },
      { action: 'setValue', path: '/n', value: number },
    );
  } else if (family === 7) {
    properties.box = {
      type: 'object',
      properties: {
        nested: { type: 'string', controls: { [state]: '../../n > 0' } },
        ctx: { type: 'string', controls: { active: '(@).on === true' } },
      },
    };
    initial.box = { nested: 'N', ctx: 'CTX' };
    writes.push(
      { action: 'retain', path: '/box/ctx', key: 'old' },
      { action: 'context', value: { on: false } },
      { action: 'retained', key: 'old', value: 'late' },
      { action: 'context', value: { on: true } },
      { action: 'setValue', path: '/n', value: -number },
      { action: 'resetSubtree', path: '/box' },
    );
  } else if (family === 8) {
    properties.rows = {
      type: 'array',
      items: {
        type: 'object',
        controls: { active: "#/kind === 'a'" },
        properties: {
          value: { type: 'string', controls: { [state]: '../../../n > 0' } },
          cousin: { type: 'string', controls: { active: '#/n > 0' } },
        },
      },
    };
    initial.rows = [{ value: 'row', cousin: 'C' }];
    writes.push(
      { action: 'setValue', path: '/n', value: -number },
      { action: 'setValue', path: '/n', value: number },
      { action: 'setValue', path: '/kind', value: 'b' },
      { action: 'setValue', path: '/kind', value: 'a' },
    );
  } else if (family === 9) {
    properties.rows = {
      type: 'array',
      items: {
        type: 'object',
        properties: { value: { type: ['string', 'number'] } },
        controls: { active: "#/kind !== 'closed'" },
      },
    };
    initial.rows = [{ value: 'A' }, { value: number }];
    writes.push(
      { action: 'push', path: '/rows', value: { value: 'B' } },
      { action: 'remove', path: '/rows', index: 0 },
      { action: 'insert', path: '/rows', index: 1, value: { value: 'I' } },
      {
        action: 'update',
        path: '/rows',
        index: 0,
        value: { value: number + 1 },
      },
      { action: 'pop', path: '/rows' },
      { action: 'clear', path: '/rows' },
    );
  } else if (family === 10) {
    properties.tuple =
      variant % 2
        ? {
            type: 'array',
            items: [{ type: 'number' }, { type: 'boolean' }],
            additionalItems: { type: 'string' },
          }
        : {
            type: 'array',
            prefixItems: [{ type: 'number' }, { type: 'boolean' }],
            items: { type: 'string' },
          };
    initial.tuple = [number, true, 'tail'];
    writes.push(
      { action: 'push', path: '/tuple', value: 'more' },
      { action: 'update', path: '/tuple', index: 0, value: number + 1 },
      { action: 'pop', path: '/tuple' },
    );
  } else if (family === 11) {
    schema.$defs = {
      member: {
        type: 'object',
        properties: {
          label: { type: 'string' },
          children: { type: 'array', items: { $ref: '#/$defs/member' } },
        },
      },
    };
    properties.tree = { $ref: '#/$defs/member' };
    properties.grid = {
      type: 'array',
      items: { type: 'array', items: { type: ['string', 'number', 'null'] } },
    };
    initial.tree = {
      label: 'root',
      children: [{ label: 'leaf', children: [] }],
    };
    initial.grid = [[number, 'x']];
    writes.push(
      { action: 'setValue', path: '/tree/children/0/label', value: 'changed' },
      {
        action: 'push',
        path: '/tree/children',
        value: { label: 'new', children: [] },
      },
      { action: 'setValue', path: '/grid/0/0', value: null },
    );
  } else if (family === 12) {
    properties.start = { type: 'string' };
    properties.end = { type: 'string' };
    schema.options = { virtual: { period: { fields: ['start', 'end'] } } };
    initial.start = 's0';
    initial.end = 'e0';
    writes.push(
      { action: 'setValue', path: '/period', value: ['s1', 'e1'] },
      {
        action: 'batch',
        writes: [
          { action: 'setValue', path: '/start', value: 's2' },
          { action: 'setValue', path: '/end', value: 'e2' },
        ],
      },
    );
  } else if (family === 13) {
    properties.source = {
      type: 'string',
      controls: { injectTo: (value: unknown) => ({ '../target': value }) },
    };
    properties.target = { type: 'string' };
    initial.source = 'source';
    writes.push(
      { action: 'setValue', path: '/source', value: `injected-${number}` },
      { action: 'bulk', value: { n: number + 1 } },
      { action: 'resetSubtree', path: '/source' },
    );
  } else if (family === 14) {
    properties.source = {
      type: 'object',
      properties: {
        flag: { type: 'boolean' },
        data: { type: 'string', options: { omitEmpty: false } },
      },
      allOf: [
        {
          title: `${marker}:overlay`,
          controls: { active: './flag === true' },
          properties: { data: { options: { omitEmpty: true } } },
        },
      ],
    };
    properties[name] = {
      type: 'string',
      controls: { [state]: "../source/data === ''" },
    };
    initial.source = { flag: false, data: '' };
    writes.push(
      { action: 'setValue', path: '/source/flag', value: true },
      { action: 'setValue', path: '/source/flag', value: false },
    );
  } else {
    properties.target = {
      type: 'number',
      controls: { derived: '../n * 2', watch: ['../kind'] },
    };
    properties.cleared = {
      type: 'string',
      controls: { unsetValue: '../n < 0' },
    };
    properties.fallback = {
      type: 'string',
      controls: { default: `fallback-${number}` },
    };
    initial.cleared = 'kept';
    writes.push(
      { action: 'setValue', path: '/n', value: number + 1 },
      { action: 'setValue', path: '/n', value: -number },
      { action: 'setValue', path: '/n', value: number },
      { action: 'bulk', value: { kind: 'b' } },
    );
  }
  writes.push(
    { action: 'bulk', value: { extra: `bulk-${number}` } },
    { action: 'same', path: '', ...(variant % 2 ? { option: 4 } : {}) },
  );
  if (variant % 2)
    schema.properties = Object.fromEntries(
      Object.entries(properties).reverse(),
    );
  return {
    id: `corpus-${seed}-f${family}-v${variant}`,
    seed,
    group: `family-${family}`,
    schema: markBranches(schema, marker),
    initialValue: initial,
    context: { on: true },
    writes,
  };
}
