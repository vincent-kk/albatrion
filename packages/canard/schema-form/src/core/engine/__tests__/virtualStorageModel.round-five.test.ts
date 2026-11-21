import { expect, it } from 'vitest';

import { nodeFromJSONSchema } from '@/schema-form/__tests__/fixtures/nodeFromJSONSchema';

import { ValidationMode } from '../types/state';
import { WriteOption } from '../types/value';
import { createSeedSampler } from './fixtures/createSeedSampler';

/*
 * Seeds: 1 to 3000 locally and in the pre-release tier. The pr tier runs 600 stratified seeds: the
 * first 50 of each of 12 classes, constituent count 0 to 5 times the initial gate of the object
 * constituent's y, and the test fails unless all 22 operations run.
 */
const SEED_CLASSES = [0, 1, 2, 3, 4, 5].flatMap((count) =>
  [false, true].map((yOn) => `${count}:${yOn}`),
);

const sampler = createSeedSampler(3000, SEED_CLASSES, 50);

it(`virtual operations follow the reference model in sequential and batched histories for ${sampler.label}`, async () => {
  const reached = new Set<number>();
  const arities = new Set<number>();
  for (let seed = 1; sampler.has(seed); seed++) {
    let randomState = seed;
    const random = (limit: number) => {
      randomState = (Math.imul(randomState, 1664525) + 1013904223) >>> 0;
      return (randomState >>> 8) % limit;
    };
    const count = random(6),
      names = Array.from({ length: count }, (_, index) => `f${index}`);
    const active = names.map(() => random(2) === 1);
    const initialActive = active.slice();
    const initial = names.map((_, index) =>
      random(2) ? `load${index}` : undefined,
    );
    const initialOutput = initial.map((value, index) =>
      active[index] ? value : undefined,
    );
    const stored = initial.slice();
    // The object constituent carries a gated descendant whose retained value a group reset must reach.
    const initialObject: object =
      random(2) === 1 ? { x: 'x0', y: 'y0' } : { x: 'x0' };
    const initialYOn = random(2) === 1;
    if (!sampler.accept(`${count}:${initialYOn}`)) continue;
    let yOn = initialYOn;
    let groupOn = true;
    let source: string | undefined;
    const fields = [...names, 'object'];
    const encodeTuple = (step: number, tuple: unknown) =>
      `${step}|${JSON.stringify(Array.isArray(tuple) ? tuple.map((value) => value ?? null) : tuple)}`;
    // A source string carries one declarative write: a step prefix keeps every write a change.
    const decodeWrite = (target: string, value: unknown) => {
      if (typeof value !== 'string') return {};
      const decoded: unknown = JSON.parse(value.slice(value.indexOf('|') + 1));
      return {
        [target]: Array.isArray(decoded)
          ? decoded.map((slot: unknown) => slot ?? undefined)
          : decoded,
      };
    };
    const properties: Record<string, object> = {
      outside: { type: 'boolean' },
      groupOn: { type: 'boolean' },
      yOn: { type: 'boolean' },
      object: {
        type: 'object',
        properties: {
          x: { type: 'string' },
          y: { type: 'string', controls: { active: '/yOn === true' } },
        },
      },
      source: {
        type: 'string',
        controls: {
          injectTo: (value: unknown) => decodeWrite('../group', value),
        },
      },
      objectSource: {
        type: 'string',
        controls: {
          injectTo: (value: unknown) => decodeWrite('../object', value),
        },
      },
    };
    const input: Record<string, unknown> = {
      outside: true,
      groupOn: true,
      yOn: initialYOn,
      object: initialObject,
    };
    for (let index = 0; index < count; index++) {
      properties[`on${index}`] = { type: 'boolean' };
      properties[names[index]] = {
        type: 'string',
        controls: { active: `../on${index} === true` },
      };
      input[`on${index}`] = active[index];
      if (initial[index] !== undefined) input[names[index]] = initial[index];
    }
    const create = () =>
      nodeFromJSONSchema({
        jsonSchema: {
          type: 'object',
          properties,
          options: {
            virtual: {
              reversed: { fields: [...fields].reverse() },
              group: {
                fields,
                controls: { active: '../groupOn === true' },
              },
            },
          },
        },
        defaultValue: input,
        validationMode: ValidationMode.OnRequest,
        deferMountValidation: true,
        validator: {
          compile: () => () =>
            names.map((name) => ({ dataPath: `/${name}`, keyword: 'model' })),
          compileGuard: () => () => true,
        },
      });
    const roots = [create(), create()];
    for (const root of roots) {
      const value = root.find('/group')!.value;
      if (Array.isArray(value)) arities.add(value.length);
    }
    // The direct root applies each object-slot effect to the constituent's own node.
    const direct = create();
    for (let step = 0; step < 12; step++) {
      const drawn = (step + random(22)) % 22,
        index = count ? random(count) : 0;
      const groupOperation =
        drawn !== 0 && drawn !== 5 && drawn !== 17 && drawn < 18;
      const operation = !groupOn && groupOperation ? 19 : drawn;
      reached.add(operation);
      const objectSlot = random(3) ? undefined : { x: `object${step}` };
      const slots = names.map((_, slot) =>
        random(2) ? `write${step}:${slot}` : undefined,
      );
      // An injected tuple writes a defined object, which a direct injectTo can also carry; it names
      // the gated y or omits it whether y is active or not.
      const tuple: unknown[] = [
        ...slots,
        operation === 19
          ? random(2)
            ? { x: `injected${step}`, y: `injected${step}` }
            : { x: `injected${step}` }
          : objectSlot,
      ];
      const overlapNames = names.map((_, slot) => `overlap${step}:${slot}`);
      const overlapping: unknown[] = [...overlapNames, undefined];
      const wrong = Array.from(
        { length: count + 1 + (random(2) ? 1 : -1) },
        () => 'invalid',
      );
      const nextActive = count ? !active[index] : false;
      for (let mode = 0; mode < roots.length; mode++) {
        const root = roots[mode],
          group = root.find('/group')!;
        if (groupOperation && !groupOn) expect(group).toBeNull();
        const outside = root.find('/outside')!;
        const outsideState = outside.state,
          outsideErrors = outside.errors;
        const detached =
          operation === 5 && count ? root.find(`/${names[index]}`) : null;
        if (operation === 5 && count) root.find(`/on${index}`)?.setValue(false);
        let pending: Promise<unknown> | undefined;
        const run = () => {
          if (operation === 0 && count)
            root.find(`/on${index}`)?.setValue(nextActive);
          else if (operation === 1 || operation === 7)
            group.setValue(
              tuple,
              operation === 7 ? WriteOption.Merge : WriteOption.Overwrite,
            );
          else if (operation === 2) group.resetSubtree();
          else if (operation === 3) group.setValue(group.value);
          else if (operation === 4)
            expect(
              () => group.setValue(wrong),
              `seed=${seed} invalid`,
            ).toThrow();
          else if (operation === 5 && count) detached?.resetSubtree();
          else if (operation === 6)
            group.setValue((previous: unknown) => previous);
          else if (operation === 8) pending = group.validate();
          else if (operation === 9) group.setSubtreeState({ touched: true });
          else if (operation === 10) group.clearSubtreeState();
          else if (operation === 11)
            group.setExternalErrors([
              { dataPath: '/group', keyword: 'external' },
            ]);
          else if (operation === 12) group.clearExternalErrors();
          else if (operation === 13) {
            expect(group.defaultValue).toEqual([...initial, initialObject]);
            expect(group.inactiveValues).toEqual(root.inactiveValues);
          } else if (operation === 15) {
            group.setValue(tuple);
            root.find('/reversed')!.setValue([...overlapping].reverse());
          } else if (operation === 16) group.setValue(undefined);
          else if (operation === 17) root.resetSubtree();
          else if (operation === 18) root.find('/groupOn')!.setValue(!groupOn);
          else if (operation === 19)
            root.find('/source')!.setValue(encodeTuple(step, tuple));
          else if (operation === 20)
            root.find('/object/y')?.setValue(`y${step}`);
          else if (operation === 21) root.find('/yOn')!.setValue(!yOn);
          else if (group) expect(group.outputValue).toBeUndefined();
        };
        if (mode)
          root.batch(() => {
            root.find('/outside')!.setValue(true);
            run();
          });
        else {
          root.find('/outside')!.setValue(true);
          run();
        }
        await pending;
        if (operation !== 17) {
          expect(root.find('/outside'), `seed=${seed} outside identity`).toBe(
            outside,
          );
          expect(outside.state, `seed=${seed} outside state`).toEqual(
            outsideState,
          );
          expect(outside.errors, `seed=${seed} outside errors`).toEqual(
            outsideErrors,
          );
        }
      }
      const directObject = direct.find('/object')!;
      if (operation === 1 || operation === 7)
        directObject.setValue(
          objectSlot,
          operation === 7 ? WriteOption.Merge : WriteOption.Overwrite,
        );
      else if (operation === 19)
        direct.find('/objectSource')!.setValue(encodeTuple(step, tuple[count]));
      else if (operation === 2) directObject.resetSubtree();
      else if (operation === 15) {
        directObject.setValue(objectSlot);
        directObject.setValue(undefined);
      } else if (operation === 16) directObject.setValue(undefined);
      else if (operation === 17) direct.resetSubtree();
      else if (operation === 20) direct.find('/object/y')?.setValue(`y${step}`);
      else if (operation === 21) direct.find('/yOn')!.setValue(!yOn);
      if (operation === 17) {
        yOn = initialYOn;
        groupOn = true;
        source = undefined;
      } else if (operation === 19) source = encodeTuple(step, tuple);
      else if (operation === 18) groupOn = !groupOn;
      else if (operation === 21) yOn = !yOn;
      if (operation === 0 && count) active[index] = nextActive;
      else if (operation === 1 || operation === 7 || operation === 19) {
        for (let slot = 0; slot < count; slot++)
          if (active[slot] || slots[slot] !== undefined)
            stored[slot] = slots[slot];
      } else if (operation === 2) stored.splice(0, stored.length, ...initial);
      else if (operation === 5 && count) active[index] = false;
      else if (operation === 15)
        stored.splice(0, stored.length, ...overlapNames);
      else if (operation === 16) {
        for (let slot = 0; slot < count; slot++)
          if (active[slot]) stored[slot] = undefined;
      } else if (operation === 17) {
        stored.splice(0, stored.length, ...initial);
        active.splice(0, active.length, ...initialActive);
      }
      const expected: Record<string, unknown> = {
        outside: true,
        groupOn,
        yOn,
        object: direct.value?.object,
      };
      if (expected.object === undefined) delete expected.object;
      if (source !== undefined) expected.source = source;
      for (let slot = 0; slot < count; slot++) {
        expected[`on${slot}`] = active[slot];
        if (active[slot] && stored[slot] !== undefined)
          expected[names[slot]] = stored[slot];
      }
      const expectedTuple = stored.map((value, slot) =>
        active[slot] ? value : undefined,
      );
      const childPaths = [
        ...names.flatMap((name, slot) => (active[slot] ? [`/${name}`] : [])),
        '/object',
      ];
      const directRetained = direct.inactiveValues.filter(({ path }) =>
        path.startsWith('/object'),
      );
      for (const root of roots) {
        expect(root.value, `seed=${seed} step=${step} op=${operation}`).toEqual(
          expected,
        );
        const objectValue = root.find('/object')!.value;
        if (groupOn) {
          expect(root.find('/group')!.value, `seed=${seed} tuple`).toEqual([
            ...expectedTuple,
            objectValue,
          ]);
          expect(
            root.find('/group')!.children?.map((child) => child.path) ?? [],
            `seed=${seed} child paths`,
          ).toEqual(childPaths);
        } else expect(root.find('/group'), `seed=${seed} group off`).toBeNull();
        expect(
          root.find('/reversed')!.value,
          `seed=${seed} reversed tuple`,
        ).toEqual([objectValue, ...[...expectedTuple].reverse()]);
        expect(
          root.find('/reversed')!.children?.map((child) => child.path) ?? [],
          `seed=${seed} reversed child paths`,
        ).toEqual([...childPaths].reverse());
        expect(
          Object.fromEntries(
            root.inactiveValues.map(({ path, value }) => [path, value]),
          ),
          `seed=${seed} step=${step} retained`,
        ).toEqual(
          Object.fromEntries([
            ...names.flatMap((name, slot) =>
              !active[slot] && stored[slot] !== undefined
                ? [[`/${name}`, stored[slot]]]
                : [],
            ),
            ...directRetained.map(({ path, value }) => [path, value]),
          ]),
        );
        expect(
          root.find('/object')!.isDivergent,
          `seed=${seed} object divergence`,
        ).toBe(direct.find('/object')!.isDivergent);
        if (groupOn)
          expect(root.find('/group')!.isDivergent).toBe(
            expectedTuple.some(
              (value, index) => value !== initialOutput[index],
            ) || direct.find('/object')!.isDivergent,
          );
      }
      expect(
        {
          value: roots[1].value,
          retained: roots[1].inactiveValues,
          errors: roots[1].globalErrors,
          state: roots[1].globalState,
        },
        `seed=${seed} step=${step} op=${operation}`,
      ).toEqual({
        value: roots[0].value,
        retained: roots[0].inactiveValues,
        errors: roots[0].globalErrors,
        state: roots[0].globalState,
      });
    }
    for (const root of roots) {
      root.find('/groupOn')!.setValue(true);
      const group = root.find('/group')!;
      const retained = group.inactiveValues;
      expect(group.defaultValue, `seed=${seed} live defaults`).toEqual([
        ...initial,
        initialObject,
      ]);
      root.find('/groupOn')!.setValue(false);
      expect(group.defaultValue, `seed=${seed} detached defaults`).toEqual([
        ...initial,
        initialObject,
      ]);
      expect(group.inactiveValues, `seed=${seed} detached retained`).toBe(
        retained,
      );
      expect(group.isDivergent, `seed=${seed} detached divergence`).toBe(false);
      for (let slot = 0; slot < count; slot++)
        root.setValue({ ...root.value, [names[slot]]: `after-detach:${slot}` });
      root.find('/groupOn')!.setValue(true);
      expect(root.find('/group')).not.toBe(group);
      expect(root.find('/group')!.defaultValue).toEqual([
        ...initial,
        initialObject,
      ]);
      expect(group.defaultValue).toEqual([...initial, initialObject]);
      expect(group.inactiveValues).toBe(retained);
      expect(group.isDivergent).toBe(false);
    }
  }
  expect(sampler.shortfall()).toEqual([]);
  expect(reached.size).toBe(22);
  expect([...arities].sort()).toEqual([0, 1, 2, 3, 4, 5, 6]);
}, 300_000);
