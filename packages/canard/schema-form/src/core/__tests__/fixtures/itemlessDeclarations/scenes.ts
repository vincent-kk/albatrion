import type { BlueprintSchema } from '../../../engine';

/** An authored input and finite public history; no product fast-path switch is exposed. */
export interface ItemlessScene {
  /** Named matrix entry, preserved in raw comparison records. */
  id: string;
  /** Authored schema compiled independently for every engine run. */
  schema: BlueprintSchema;
  /** Caller-owned mount source, including deliberate invalid JSON kinds. */
  input: unknown;
  /** Host path for array verbs; the root by default. */
  path: string;
  /** Public write history, interpreted by the observation runner. */
  steps: readonly string[];
  /** Explicit defaults/automatic-write controls for the binding. */
  load?: 'props' | 'schema' | 'none' | 'undefined' | 'disable' | 'enable';
}

/** Construct a fresh named fixture, including genuinely inactive declarations and later writes. */
export function makeItemlessScene(id: string): ItemlessScene {
  const scene: ItemlessScene = {
    id,
    schema: { type: 'array' },
    input: [1, 2],
    path: '',
    steps: [],
  };
  if (id === 'dense-nested' || id === 'batch-input-interpret') {
    scene.schema = { type: 'object', properties: { list: { type: 'array' } } };
    scene.input = { list: [1, 2] };
    scene.path = '/list';
  }
  if (id === 'empty') scene.input = [];
  if (id === 'sparse') {
    scene.input = new Array(4);
    Reflect.set(scene.input as object, '2', 3);
  }
  if (id === 'own-undefined') scene.input = [1, undefined, 3];
  if (id === 'nan-negative-zero') scene.input = [NaN, -0, undefined];
  if (id === 'wrong-kind-null') scene.input = null;
  if (id === 'wrong-kind-number') scene.input = 42;
  if (id === 'wrong-kind-object') scene.input = { own: undefined, nested: [2] };
  if (id === 'frozen-caller')
    scene.input = Object.freeze([Object.freeze({ n: 1 }), 2]);
  if (id === 'caller-post-mutation') scene.input = [{ nested: [1] }, 2];
  const loads: Record<string, ItemlessScene['load']> = {
    'props-defaultValue': 'props',
    'schema-default': 'schema',
    'no-default': 'none',
    'explicit-undefined': 'undefined',
    'disable-auto-true': 'disable',
    'disable-auto-false': 'enable',
  };
  if (loads[id]) scene.load = loads[id];
  if (scene.load === 'schema')
    scene.schema = { type: 'array', default: [3, 4] };
  const verbs = [
    'push',
    'insert-start',
    'insert-middle',
    'insert-end',
    'remove',
    'pop',
    'clear',
    'update',
    'out-of-range',
    'overwrite',
    'merge',
    'batch-mixed',
    'same-value-write',
  ];
  if (verbs.includes(id)) scene.steps = [id];
  if (
    [
      'children-reference-bits',
      'extras-snapshot-alias',
      'first-listener-commit',
      'retained-container-contents',
      'fresh-blueprints',
      'pre-requested-empty-memo',
    ].includes(id)
  )
    scene.steps = [
      'same-value-write',
      'push',
      'insert-middle',
      'pop',
      'overwrite',
    ];
  if (id === 'batch-input-interpret') scene.steps = ['batch-mixed'];
  if (id === 'common-items')
    scene.schema = { type: 'array', items: { type: 'number' } };
  if (id === 'prefix-items')
    scene.schema = {
      type: 'array',
      prefixItems: [{ type: 'number' }, { type: 'string' }],
    };
  if (id === 'legacy-tuple-additional')
    scene.schema = {
      type: 'array',
      items: [{ type: 'number' }],
      additionalItems: { type: 'number' },
    };
  if (id === 'union') {
    scene.schema = { type: ['array', 'string'], items: { type: 'number' } };
    scene.steps = ['union-string', 'overwrite'];
  }
  if (id === 'terminal')
    scene.schema = {
      type: 'array',
      items: { type: 'number' },
      options: { terminal: true },
    };
  if (id === 'recursive-items') {
    scene.schema = { type: 'array', items: { $ref: '#' } };
    scene.input = [[[]], []];
  }
  if (id === 'ref-items')
    scene.schema = {
      type: 'array',
      $defs: { item: { type: 'number' } },
      items: { $ref: '#/$defs/item' },
    };
  if (id === 'omit-empty-trailing') {
    scene.schema = {
      type: 'array',
      options: { omitEmpty: true, omitTrailing: true },
    };
    scene.input = [1, undefined, null];
  }
  if (id === 'allOf-items')
    scene.schema = {
      type: 'array',
      allOf: [{ items: { type: 'number' } }, { minItems: 1 }],
    };
  if (id === 'oneOf-inactive-items' || id === 'anyOf-items') {
    scene.schema = {
      type: 'object',
      properties: { tag: { type: 'string' }, list: { type: 'array' } },
      [id === 'anyOf-items' ? 'anyOf' : 'oneOf']: [
        {
          properties: {
            tag: { const: 'a' },
            list: { items: { type: 'number' } },
          },
        },
        {
          properties: {
            tag: { const: 'b' },
            list: { items: { type: 'number', minimum: 10 } },
          },
        },
      ],
    };
    scene.input = { tag: 'a', list: [1, 2] };
    scene.path = '/list';
    scene.steps = ['tag-b', 'tag-a', 'push'];
  }
  if (id === 'then-else-inactive-items') {
    scene.schema = {
      type: 'object',
      properties: { flag: { type: 'boolean' }, list: { type: 'array' } },
      if: { properties: { flag: { const: true } } },
      then: { properties: { list: { items: { type: 'number' } } } },
      else: { properties: { list: { items: { type: 'string' } } } },
    };
    scene.input = { flag: true, list: [1, 2] };
    scene.path = '/list';
    scene.steps = ['flag-off', 'flag-on', 'push'];
  }
  if (id === 'controls-active-toggle' || id === 'revive-latent') {
    scene.schema = {
      type: 'object',
      properties: {
        flag: { type: 'boolean' },
        list: {
          type: 'array',
          items: { type: 'number' },
          controls: { active: '../flag' },
        },
      },
    };
    scene.input = { flag: true, list: [1, 2] };
    scene.path = '/list';
    scene.steps = ['flag-off', 'flag-on', 'push'];
  }
  if (id === 'controls-fields-diagnostic') {
    scene.schema = {
      type: 'object',
      properties: { flag: { type: 'boolean' }, list: { type: 'array' } },
      fields: [
        { targets: ['list', 'missing'], controls: { visible: './flag' } },
      ],
    };
    scene.input = { flag: true, list: [1, 2] };
    scene.path = '/list';
    scene.steps = ['flag-off', 'flag-on'];
  }
  if (id === 'empty-tuple') scene.schema = { type: 'array', items: [] };
  if (id === 'boolean-items-true')
    scene.schema = { type: 'array', items: true };
  if (id === 'boolean-items-false')
    scene.schema = { type: 'array', items: false };
  if (id === 'additional-boolean-no-items')
    scene.schema = { type: 'array', additionalItems: false };
  if (id === 'nested-ref-hosts') {
    scene.schema = {
      type: 'object',
      $defs: { list: { type: 'array' } },
      properties: { a: { $ref: '#/$defs/list' }, b: { $ref: '#/$defs/list' } },
    };
    scene.input = { a: [1, 2], b: [3] };
    scene.path = '/a';
    scene.steps = ['push', 'overwrite'];
  }
  if (id === 'derive-inject-target') {
    scene.schema = {
      type: 'object',
      properties: {
        source: {
          type: 'number',
          controls: {
            injectTo: (value: unknown) => ({
              '../list': [value],
              '../declared/0': value,
            }),
          },
        },
        list: { type: 'array' },
        declared: { type: 'array', items: { type: 'number' } },
        copy: { type: 'number', controls: { derived: '../source' } },
      },
    };
    scene.input = { source: 1, list: [1, 2], declared: [1, 2] };
    scene.path = '/list';
    scene.steps = ['source-write', 'push'];
  }
  if (
    [
      'common-items',
      'prefix-items',
      'legacy-tuple-additional',
      'terminal',
      'ref-items',
      'allOf-items',
    ].includes(id)
  )
    scene.steps = [
      'push',
      'update',
      'insert-middle',
      'remove',
      'pop',
      'overwrite',
      'merge',
      'batch-mixed',
    ];
  return scene;
}
