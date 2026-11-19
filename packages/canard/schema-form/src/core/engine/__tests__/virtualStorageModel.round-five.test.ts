import { expect, it } from 'vitest';

import { nodeFromJSONSchema } from '@/schema-form/__tests__/fixtures/nodeFromJSONSchema';

import { ValidationMode } from '../types/state';
import { WriteOption } from '../types/value';

it('virtual operations follow the reference model in sequential and batched histories for 3000 seeds', async () => {
  for (let seed = 1; seed <= 3000; seed++) {
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
    const properties: Record<
      string,
      { type: 'string'; controls: { active: string } } | { type: 'boolean' }
    > = { outside: { type: 'boolean' }, groupOn: { type: 'boolean' } };
    const input: Record<string, unknown> = { outside: true, groupOn: true };
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
              reversed: { fields: [...names].reverse() },
              group: {
                fields: names,
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
    for (let step = 0; step < 12; step++) {
      const operation = (step + random(18)) % 18,
        index = count ? random(count) : 0;
      const tuple = names.map((_, slot) =>
        random(2) ? `write${step}:${slot}` : undefined,
      );
      const overlapping = names.map((_, slot) => `overlap${step}:${slot}`);
      const wrong = Array.from(
        { length: count + (count === 0 || random(2) ? 1 : -1) },
        () => 'invalid',
      );
      const nextActive = count ? !active[index] : false;
      for (let mode = 0; mode < roots.length; mode++) {
        const root = roots[mode],
          group = root.find('/group')!;
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
            expect(group.defaultValue).toEqual(initial);
            expect(group.inactiveValues).toEqual(root.inactiveValues);
          } else if (operation === 15) {
            group.setValue(tuple);
            root.find('/reversed')!.setValue([...overlapping].reverse());
          } else if (operation === 16) group.setValue(undefined);
          else if (operation === 17) root.resetSubtree();
          else expect(group.outputValue).toBeUndefined();
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
      }
      if (operation === 0 && count) active[index] = nextActive;
      else if (operation === 1 || operation === 7) {
        for (let slot = 0; slot < count; slot++)
          if (active[slot] || tuple[slot] !== undefined)
            stored[slot] = tuple[slot];
      } else if (operation === 2) stored.splice(0, stored.length, ...initial);
      else if (operation === 5 && count) active[index] = false;
      else if (operation === 15)
        stored.splice(0, stored.length, ...overlapping);
      else if (operation === 16) {
        for (let slot = 0; slot < count; slot++)
          if (active[slot]) stored[slot] = undefined;
      } else if (operation === 17) {
        stored.splice(0, stored.length, ...initial);
        active.splice(0, active.length, ...initialActive);
      }
      const expected: Record<string, unknown> = {
        outside: true,
        groupOn: true,
      };
      for (let slot = 0; slot < count; slot++) {
        expected[`on${slot}`] = active[slot];
        if (active[slot] && stored[slot] !== undefined)
          expected[names[slot]] = stored[slot];
      }
      const expectedTuple = stored.map((value, slot) =>
        active[slot] ? value : undefined,
      );
      for (const root of roots) {
        expect(root.value, `seed=${seed} step=${step} op=${operation}`).toEqual(
          expected,
        );
        expect(root.find('/group')!.value, `seed=${seed} tuple`).toEqual(
          expectedTuple,
        );
        expect(
          root.find('/reversed')!.value,
          `seed=${seed} reversed tuple`,
        ).toEqual([...expectedTuple].reverse());
        expect(
          Object.fromEntries(
            root.inactiveValues.map(({ path, value }) => [path, value]),
          ),
          `seed=${seed} step=${step} retained`,
        ).toEqual(
          Object.fromEntries(
            names.flatMap((name, slot) =>
              !active[slot] && stored[slot] !== undefined
                ? [[`/${name}`, stored[slot]]]
                : [],
            ),
          ),
        );

        expect(root.find('/group')!.isDivergent).toBe(
          expectedTuple.some((value, index) => value !== initialOutput[index]),
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
      const group = root.find('/group')!;
      const retained = group.inactiveValues;
      expect(group.defaultValue, `seed=${seed} live defaults`).toEqual(initial);
      root.find('/groupOn')!.setValue(false);
      expect(group.defaultValue, `seed=${seed} detached defaults`).toEqual(
        initial,
      );
      expect(group.inactiveValues, `seed=${seed} detached retained`).toBe(
        retained,
      );
      expect(group.isDivergent, `seed=${seed} detached divergence`).toBe(false);
      for (let slot = 0; slot < count; slot++)
        root.setValue({ ...root.value, [names[slot]]: `after-detach:${slot}` });
      root.find('/groupOn')!.setValue(true);
      expect(root.find('/group')).not.toBe(group);
      expect(root.find('/group')!.defaultValue).toEqual(initial);
      expect(group.defaultValue).toEqual(initial);
      expect(group.inactiveValues).toBe(retained);
      expect(group.isDivergent).toBe(false);
    }
  }
}, 120_000);
