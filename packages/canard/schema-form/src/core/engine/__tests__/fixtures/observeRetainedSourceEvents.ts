import { nodeFromJSONSchema } from '@/schema-form/__tests__/fixtures/nodeFromJSONSchema';

import type { AuthoredSchema } from '../../types/jsonSchema';
import { ValidationMode } from '../../types/state';
import { WriteOption } from '../../types/value';
import { getRetainedModelSource } from './retainedSourceModel/getRetainedModelSource';
import { getRetainedModelSteps } from './retainedSourceModel/getRetainedModelSteps';
import { nameModelEffects } from './retainedSourceModel/nameModelEffects';
import { HELD, Y } from './retainedSourceModelCases';
import type { Call, Case, Route } from './retainedSourceModelCases';

/** Apply the selected route and call to the product and capture its exit observations. */
export const observeRetainedSourceEvents = (
  { shape, timing, order, policy, arrayInput, groupWidth }: Case,
  seed: number,
  route: Route,
  call: Call,
  steps = getRetainedModelSteps(order),
) => {
  const array = shape === 'array';
  const held = shape === 'held';
  const value = 'y' + seed;
  const heldValue = 'held' + seed;
  const itemInputs: string[] = [];
  const nextValue =
    arrayInput === 'sparse'
      ? new Array<string>(1)
      : arrayInput === 'empty'
        ? []
        : getRetainedModelSource(shape, value);
  const resolve = getRetainedModelSource(shape, 'resolved');
  const controls =
    policy === 'unset'
      ? { unsetOnInactive: true }
      : policy === 'declaration'
        ? { inactiveValue: () => resolve }
        : {};
  const marker = (index: number) =>
    index === steps.length - 1 ? 'last' : 'phase' + index;
  const read = (index: number) => {
    const z = marker(index);
    return steps[index] === 'name'
      ? nameModelEffects(route, groupWidth, z, nextValue, held, heldValue)
      : { '../o': { z } };
  };
  const transitions: Record<string, AuthoredSchema> = {};
  for (let index = 1; index < steps.length; index++) {
    const field = 'wave' + index;
    transitions[field] = {
      type: 'boolean',
      controls: {
        derived: `/o/z === "${marker(index - 1)}" ? true : /${field}`,
        injectTo: (input) =>
          input
            ? {
                ...read(index),
                ...(timing === 'same wave' && index === steps.length - 1
                  ? { '../on': false }
                  : {}),
              }
            : {},
      },
    };
  }
  const y: AuthoredSchema = array
    ? {
        type: 'array',
        controls,
        items: {
          type: 'string',
          controls: {
            injectTo: (input) => {
              if (typeof input === 'string') itemInputs.push(input);
              return {};
            },
          },
        },
      }
    : { type: 'string', controls };
  const schema: AuthoredSchema = {
    type: 'object',
    options: {
      virtual: { group: { fields: groupWidth === 2 ? ['o', 'peer'] : ['o'] } },
    },
    properties: {
      on: { type: 'boolean' },
      peer: { type: 'string' },
      start: {
        type: 'boolean',
        controls: { injectTo: (input) => (input ? read(0) : {}) },
      },
      o: {
        type: 'object',
        controls: { active: '/on === true' },
        properties: {
          z: { type: 'string' },
          n: {
            type: 'object',
            properties: {
              m: {
                type: 'object',
                properties: {
                  y,
                  ...(held
                    ? {
                        held: {
                          type: 'string',
                          controls: { active: '/hold === true' },
                        },
                      }
                    : {}),
                },
              },
            },
          },
        },
      },
      hold: { type: 'boolean' },
      ...transitions,
      ...(timing === 'next wave'
        ? {
            third: {
              type: 'boolean',
              controls: {
                derived: '/o/z === "last" ? true : /third',
                injectTo: (input) => (input ? { '../on': false } : {}),
              },
            },
          }
        : {}),
    },
  };
  const root = nodeFromJSONSchema({
    jsonSchema: schema,
    defaultValue: {
      on: true,
      o: {
        z: 'initial',
        n: {
          m: {
            y: getRetainedModelSource(shape, 'initial'),
            ...(held ? { held: 'held-initial' } : {}),
          },
        },
      },
    },
    validationMode: ValidationMode.None,
  });
  if (policy === 'callback') root.find(Y)!.onInactive(() => resolve);
  const heldBefore = root.inactiveValues.find(
    ({ path }) => path === HELD,
  )?.value;
  const write = () => root.find('/start')!.setValue(true);
  if (call === 'setter') write();
  else if (call === 'merge') root.setValue({ start: true }, WriteOption.Merge);
  else if (call === 'batch') root.batch(write);
  else root.batch(() => root.batch(write));
  return {
    retained: Object.fromEntries(
      root.inactiveValues.map(({ path, value }) => [path, value]),
    ),
    didClose: !root.find('/o'),
    heldBefore,
    enteredNamedItem: itemInputs.includes(value),
    peer: root.find('/peer')!.value,
  };
};
