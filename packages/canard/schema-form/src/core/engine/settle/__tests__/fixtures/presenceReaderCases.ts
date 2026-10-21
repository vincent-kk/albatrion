import type { BlueprintSchema } from '../../../blueprint';

/** A string whose gate can keep latent caller raw outside the emitted tree. */
const gated = (active: string, defaultValue?: string): BlueprintSchema => ({
  type: 'string',
  ...(defaultValue === undefined ? {} : { default: defaultValue }),
  controls: { active },
});

/** Two dependent gates make c enter or leave without writing its raw value. */
export const presenceHost = (withDefault = false): BlueprintSchema => ({
  type: 'object',
  properties: {
    t: { type: 'string', default: 'on' },
    m: gated("../t === 'on'", 'M'),
    c: gated("../m !== 'M'", withDefault ? 'x' : undefined),
  },
});

/** Both wheel gaps must retain registration after the first identity change. */
export const presenceGapSchemas: readonly BlueprintSchema[] = [
  {
    type: 'object',
    properties: {
      h: {
        type: 'object',
        properties: {
          t: { type: 'string' },
          c: gated('../d === undefined || ../e !== undefined'),
          d: gated("../t === 'on'"),
          e: gated('../f !== undefined'),
          f: gated('../d !== undefined'),
          g: {
            type: 'object',
            properties: { q: gated("../../c === 'C'", 'Q') },
          },
        },
      },
      z: gated("../h/c === 'C'", 'Z'),
    },
  },
  {
    type: 'object',
    properties: {
      h: {
        type: 'object',
        properties: {
          t: { type: 'string' },
          n: gated('../d === undefined'),
          d: gated("../t === 'on'"),
          g: {
            type: 'object',
            properties: { r: gated('../../n !== undefined', 'R') },
          },
        },
      },
      z: gated('../h/n !== undefined', 'Z'),
    },
  },
];

/** State-only owners excluded from in-progress ancestor invalidation. */
export const presenceStateSchema: BlueprintSchema = {
  type: 'object',
  properties: {
    k: { type: 'number' },
    h: {
      type: 'object',
      properties: {
        p: gated('../../k === 1'),
        s: {
          type: 'string',
          default: 'S',
          controls: { visible: '(../).p !== undefined' },
        },
      },
    },
  },
};

/** Same-host relocation reads a late emitted sibling rather than caller raw. */
export const presenceRelocatedSchema: BlueprintSchema = {
  type: 'object',
  properties: {
    current: {
      type: 'object',
      properties: {
        value: { type: 'string' },
        primer: gated('../value === "in-progress"'),
        x: {
          type: 'object',
          properties: { reader2: gated('../../primer === "ready"', 'R') },
        },
      },
    },
  },
};

/** A relocated gate must see the cousin that enters after its declaring host. */
export const presenceCousinSchema: BlueprintSchema = {
  type: 'object',
  properties: {
    mode: { type: 'string' },
    p: { type: 'object', properties: { child: gated('#/later === true') } },
  },
  allOf: [
    {
      controls: { active: './mode === "x"' },
      properties: { later: { type: 'boolean' } },
    },
  ],
};
