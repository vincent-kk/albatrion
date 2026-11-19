import { expect, it } from 'vitest';

import { nodeFromJSONSchema } from '@/schema-form/__tests__/fixtures/nodeFromJSONSchema';

import type { AuthoredSchema } from '../types/jsonSchema';
import { ValidationMode } from '../types/state';

it('virtual projections follow 3000 generated branch, retention and batch histories', () => {
  for (let seed = 1; seed <= 3000; seed++) {
    let state = seed ^ 0x7f4a7c15;
    const next = (limit: number) => {
      state = (Math.imul(state, 1103515245) + 12345) >>> 0;
      return (state >>> 8) % limit;
    };
    const count = 1 + next(5);
    const names = Array.from({ length: count }, (_, index) => `f${index}`);
    const active = names.map(() => !!next(2));
    const initial = names.map((_, index) =>
      next(2) ? `load${index}` : undefined,
    );
    const defaults = names.map((_, index) =>
      next(3) === 0 ? `default${index}` : undefined,
    );
    const policies = names.map(() => next(4));
    const branches: AuthoredSchema[] = [];
    const conditionalNames: string[] = [];
    const useIf = seed % 3 === 0;
    const properties: Record<string, AuthoredSchema> = {
      outside: { type: 'string' },
    };
    const input: Record<string, unknown> = { outside: 'outside' };
    for (let index = 0; index < count; index++) {
      properties[`on${index}`] = { type: 'boolean' };
      const field: AuthoredSchema = {
        type: 'string',
        default: defaults[index],
        controls: {
          unsetOnInactive: policies[index] === 1,
          inactiveValue: policies[index] === 2 ? `inactive${index}` : undefined,
          visible: next(2) === 0 ? false : true,
        },
      };
      if (next(2)) {
        conditionalNames.push(`on${index}`);
        branches.push(
          useIf
            ? {
                if: {
                  properties: { [`on${index}`]: { const: true } },
                  required: [`on${index}`],
                },
                then: { properties: { [names[index]]: field } },
              }
            : {
                controls: { active: `./on${index} === true` },
                properties: { [names[index]]: field },
              },
        );
      } else
        properties[names[index]] = {
          ...field,
          controls: { ...field.controls, active: `../on${index} === true` },
        };
      input[`on${index}`] = active[index];
      if (initial[index] !== undefined) input[names[index]] = initial[index];
    }
    const root = nodeFromJSONSchema({
      jsonSchema: {
        type: 'object',
        properties,
        ...(seed % 2 && !useIf ? { oneOf: branches } : { allOf: branches }),
        options: {
          virtual: {
            group: { fields: names },
            reversed: { fields: [...names].reverse() },
          },
        },
      },
      defaultValue: input,
      validationMode: ValidationMode.None,
      ...(useIf
        ? {
            validator: {
              compile: () => () => null,
              compileGuard: (_schema: unknown, pointer: string) => {
                const name = conditionalNames[Number(pointer.split('/')[2])];
                return (value: unknown) =>
                  value !== null &&
                  typeof value === 'object' &&
                  Reflect.get(value, name) === true;
              },
            },
          }
        : {}),
    });
    const stored = initial.map((value, index) =>
      active[index] ? (value ?? defaults[index]) : value,
    );
    const outside = root.find('/outside')!;
    outside.setState({ touched: true });
    outside.setExternalErrors([{ dataPath: '/outside', keyword: 'outside' }]);
    const outsideState = outside.state,
      outsideErrors = outside.errors;
    const registered = new WeakSet<object>();
    const bind = () => {
      for (let index = 0; index < count; index++) {
        const node = root.find(`/${names[index]}`);
        if (node && policies[index] === 3 && !registered.has(node)) {
          registered.add(node);
          node.onInactive(() => `resolver${index}`);
        }
      }
    };
    const toggle = (index: number, isExplicit = false) => {
      active[index] = !active[index];
      if (active[index]) stored[index] ??= defaults[index];
      else if (policies[index] === 1) stored[index] = undefined;
      else if (!isExplicit && policies[index] === 2)
        stored[index] = `inactive${index}`;
      else if (!isExplicit && policies[index] === 3)
        stored[index] = `resolver${index}`;
    };
    for (let step = 0; step < 12; step++) {
      bind();
      const operation = next(8),
        index = next(count),
        reversed = !!next(2);
      const group = root.find(reversed ? '/reversed' : '/group')!;
      if (operation === 0) {
        toggle(index);
        root.find(`/on${index}`)!.setValue(active[index]);
      } else if (operation === 1 || operation === 2) {
        const tuple = names.map((_, slot) =>
          next(2) ? `edit${step}:${slot}` : undefined,
        );
        const beforeActive = active.slice();
        const unchanged = tuple.every(
          (value, slot) => value === (active[slot] ? stored[slot] : undefined),
        );
        if (operation === 2)
          root.batch(() => {
            root.find(`/on${index}`)!.setValue(!active[index]);
            group.setValue(reversed ? [...tuple].reverse() : tuple);
          });
        else group.setValue(reversed ? [...tuple].reverse() : tuple);
        for (let slot = 0; slot < count; slot++)
          if (!unchanged && (beforeActive[slot] || tuple[slot] !== undefined))
            stored[slot] = tuple[slot];
        if (operation === 2)
          toggle(
            index,
            !unchanged && (beforeActive[index] || tuple[index] !== undefined),
          );
      } else if (operation === 3) {
        group.resetSubtree();
        for (let slot = 0; slot < count; slot++)
          stored[slot] = active[slot]
            ? (initial[slot] ?? defaults[slot])
            : initial[slot];
      } else if (operation === 4) {
        group.setValue(group.value);
      } else if (operation === 5) {
        const old = root.find(`/${names[index]}`);
        if (active[index]) {
          toggle(index);
          root.find(`/on${index}`)!.setValue(false);
        }
        old?.resetSubtree();
      } else if (operation === 6) {
        expect(() => group.setValue(null)).toThrow();
      }
      const expected: Record<string, unknown> = { outside: 'outside' };
      for (let slot = 0; slot < count; slot++) {
        expected[`on${slot}`] = active[slot];
        if (active[slot] && stored[slot] !== undefined)
          expected[names[slot]] = stored[slot];
      }
      expect(root.value, `seed=${seed} step=${step} op=${operation}`).toEqual(
        expected,
      );
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
      const tuple = stored.map((value, slot) =>
        active[slot] ? value : undefined,
      );
      expect(group.value, `seed=${seed} step=${step} tuple`).toEqual(
        reversed ? tuple.reverse() : tuple,
      );
      expect(root.find('/outside')).toBe(outside);
      expect(outside.state).toBe(outsideState);
      expect(outside.errors).toBe(outsideErrors);
    }
  }
}, 120_000);
