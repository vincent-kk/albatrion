import type { Random } from './createRandom';
import { generateHostValue } from './generateHostValue';
import type { GateHostSchema, GatePosition } from './types';

/** A generated form around its gate hosts, and the addresses its steps write. */
export interface PlacedForm {
  schema: Record<string, unknown>;
  load: Record<string, unknown>;
  /** Pointers of the hosts at the load. */
  hostPaths: readonly string[];
  /** Pointers of the arrays whose items are hosts. */
  hostArrays: readonly string[];
  /** Pointers outside the hosts that steps also write, with the values they write. */
  extraWrites: readonly { path: string; values: readonly unknown[] }[];
}

/** The pointer, relative to a host, that a `parent` read names at each position. */
export const PARENT_READ: Record<GatePosition, string> = {
  root: './ps',
  nested: '../ps',
  items: '../../ps',
  'prefix-items': '../../ps',
  'prefix-then-items': '../../ps',
  'shared-ref': '../ps',
  recursive: '../../s',
  virtual: './ps',
  'inactive-at-start': '../ps',
};

/** The field outside every host that a `parent` read checks. */
const PARENT_FIELD = { ps: { type: 'string' } };

/**
 * Place the gate host at a position and generate the load.
 * @param position - Where the host sits
 * @param host - The host schema built with `PARENT_READ[position]`
 * @param random - The seed's random source; draws the host values and the recursion depth
 * @returns The form, its load, and the addresses steps write
 */
export const placeGateHost = (
  position: GatePosition,
  host: GateHostSchema,
  random: Random,
): PlacedForm => {
  const value = () => generateHostValue(random);
  const ps = random.pick(['1', '0']);
  const wrap = (properties: Record<string, unknown>, rest = {}) => ({
    type: 'object',
    properties: { ...PARENT_FIELD, ...properties },
    ...rest,
  });
  const none = { hostArrays: [], extraWrites: [] };
  const hostProperties = host.properties;
  if (position === 'root' || position === 'virtual')
    return {
      schema: {
        ...host,
        properties: { ...PARENT_FIELD, ...hostProperties },
        ...(position === 'virtual'
          ? { options: { virtual: { pair: { fields: ['s', 't'] } } } }
          : {}),
      },
      load: { ...value(), ps },
      hostPaths: [''],
      hostArrays: [],
      extraWrites:
        position === 'virtual'
          ? [
              {
                path: '/pair',
                values: [
                  ['1', 'x'],
                  ['0', ''],
                  ['1', ''],
                ],
              },
            ]
          : [],
    };
  if (position === 'nested')
    return {
      schema: wrap({ n: host }),
      load: { ps, n: value() },
      hostPaths: ['/n'],
      ...none,
    };
  if (position === 'shared-ref')
    return {
      schema: wrap(
        { a: { $ref: '#/$defs/h' }, b: { $ref: '#/$defs/h' } },
        { $defs: { h: host } },
      ),
      load: { ps, a: value(), b: value() },
      hostPaths: ['/a', '/b'],
      ...none,
    };
  if (position === 'inactive-at-start')
    return {
      schema: wrap({
        on: { type: 'string' },
        w: { ...host, controls: { active: "../on === '1'" } },
      }),
      load: { ps, on: '0', w: value() },
      hostPaths: ['/w'],
      hostArrays: [],
      extraWrites: [{ path: '/on', values: ['1', '0'] }],
    };
  if (position === 'recursive') {
    const node = {
      ...host,
      properties: {
        ...hostProperties,
        children: { type: 'array', items: { $ref: '#/$defs/node' } },
      },
    };
    const depth = 1 + random.int(3);
    const paths = Array.from(
      { length: depth },
      (_, level) => '/tree' + '/children/0'.repeat(level),
    );
    const tree = paths.reduceRight<unknown>(
      (child, _path) => ({ ...value(), children: child ? [child] : [] }),
      undefined,
    );
    return {
      schema: wrap({ tree: { $ref: '#/$defs/node' } }, { $defs: { node } }),
      load: { ps, tree },
      hostPaths: paths,
      hostArrays: paths.map((path) => `${path}/children`),
      extraWrites: [],
    };
  }
  const list =
    position === 'items'
      ? { type: 'array', items: host }
      : position === 'prefix-items'
        ? { type: 'array', prefixItems: [host, host] }
        : { type: 'array', prefixItems: [host], items: host };
  const length = position === 'prefix-then-items' ? 3 : 2;
  return {
    schema: wrap({ list }),
    load: { ps, list: Array.from({ length }, value) },
    hostPaths: Array.from({ length }, (_, index) => `/list/${index}`),
    hostArrays: ['/list'],
    extraWrites: [],
  };
};
