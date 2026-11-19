import { expect, it } from 'vitest';
import { ValidationMode } from '@/schema-form';
import { nodeFromJSONSchema } from '@/schema-form/__tests__/fixtures/nodeFromJSONSchema';

it('virtual storage follows the reference model over 3000 seeded sequences', () => {
  for (let seed = 1; seed <= 3000; seed++) {
    let randomState = seed;
    const random = (limit: number) => {
      randomState = (Math.imul(randomState, 1664525) + 1013904223) >>> 0;
      return randomState % limit;
    };
    const count = 1 + random(5);
    const names = Array.from({ length: count }, (_, index) => `f${index}`);
    const active = names.map(() => random(2) === 1);
    const initial = names.map((_, index) => random(2) ? `load${index}` : undefined);
    const stored = initial.slice();
    const properties: Record<string, { type: 'string'; controls: { active: string } } | { type: 'boolean' }> = { outside: { type: 'boolean' } };
    const input: Record<string, unknown> = { outside: true };
    for (let index = 0; index < count; index++) {
      properties[`on${index}`] = { type: 'boolean' };
      properties[names[index]] = { type: 'string', controls: { active: `../on${index} === true` } };
      input[`on${index}`] = active[index];
      if (initial[index] !== undefined) input[names[index]] = initial[index];
    }
    const root = nodeFromJSONSchema({ jsonSchema: { type: 'object', properties, options: { virtual: { group: { fields: names } } } }, defaultValue: input, validationMode: ValidationMode.None });
    const group = root.find('/group');
    if (!group) throw new Error('group missing');
    for (let step = 0; step < 12; step++) {
      const operation = random(7);
      const index = random(count);
      if (operation === 0) {
        active[index] = !active[index];
        root.find(`/on${index}`)?.setValue(active[index]);
      } else if (operation === 1) {
        const tuple = names.map((_, slot) => random(2) ? `write${step}:${slot}` : undefined);
        group.setValue(tuple);
        for (let slot = 0; slot < count; slot++)
          if (active[slot] || tuple[slot] !== undefined) stored[slot] = tuple[slot];
      } else if (operation === 2) {
        group.resetSubtree();
        stored.splice(0, stored.length, ...initial);
      } else if (operation === 3) {
        const before = root.value;
        group.setValue(group.value);
        expect(root.value, `seed=${seed} step=${step} identity`).toEqual(before);
      } else if (operation === 4) {
        const wrong = Array.from({ length: count + (random(2) ? 1 : -1) }, () => 'invalid');
        expect(() => group.setValue(wrong), `seed=${seed} invalid`).toThrow();
      } else if (operation === 5) {
        const old = root.find(`/${names[index]}`);
        active[index] = false;
        root.find(`/on${index}`)?.setValue(false);
        old?.resetSubtree();
      }
      const expected: Record<string, unknown> = { outside: true };
      for (let slot = 0; slot < count; slot++) {
        expected[`on${slot}`] = active[slot];
        if (active[slot] && stored[slot] !== undefined) expected[names[slot]] = stored[slot];
      }
      expect(root.value, `seed=${seed} step=${step} op=${operation}`).toEqual(expected);
      expect(group.value, `seed=${seed} step=${step} tuple`).toEqual(stored.map((value, slot) => active[slot] ? value : undefined));
    }
  }
}, 120_000);
