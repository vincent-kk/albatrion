import assert from 'node:assert/strict';

// Standalone design model, not the production implementation.
// ADR 0007:47-52: fixed seed, immediate toggles, conditional count + 1 sweeps.
function settle(fragments, raw, order) {
  let active = [];
  const emit = () => Object.fromEntries(active.map(key => [key, raw[key]]));
  const trace = [];
  for (let sweep = 1; sweep <= fragments.length + 1; sweep++) {
    const before = [...active].sort().join(',');
    for (const index of order) {
      const fragment = fragments[index];
      const enabled = fragment.guard(emit());
      active = active.filter(key => key !== fragment.key);
      if (enabled) active.push(fragment.key);
    }
    active.sort();
    trace.push([...active]);
    if (active.join(',') === before) return { value: emit(), status: 'stable', trace };
  }
  return { value: emit(), status: 'budget-exceeded', trace };
}

const mutual = [
  { key: 'a', guard: value => !Object.hasOwn(value, 'b') },
  { key: 'b', guard: value => !Object.hasOwn(value, 'a') },
];
const forward = settle(mutual, { a: 1, b: 1 }, [0, 1]);
const reverse = settle(mutual, { a: 1, b: 1 }, [1, 0]);
assert.deepEqual(forward.value, { a: 1 });
assert.deepEqual(reverse.value, { b: 1 });
assert.equal(forward.status, 'stable');
assert.equal(reverse.status, 'stable');
console.log('ORDER_HINT', JSON.stringify({ forward, reverse }));

const oscillator = [{ key: 'x', guard: value => !Object.hasOwn(value, 'x') }];
const shortBudget = settle(oscillator, { x: 1 }, [0]);
const paddedBudget = settle([...oscillator, { key: 'unused', guard: () => false }], { x: 1 }, [0, 1]);
assert.deepEqual(shortBudget.value, {});
assert.deepEqual(paddedBudget.value, { x: 1 });
assert.equal(shortBudget.status, 'budget-exceeded');
assert.equal(paddedBudget.status, 'budget-exceeded');
console.log('BUDGET_PADDING', JSON.stringify({ shortBudget, paddedBudget }));

// ADR 0007:50 replaces a non-object host with {} for shape guards.
// JSON Schema {type:'object'} is false for null and true for {}.
const objectGuard = value => value !== null && typeof value === 'object' && !Array.isArray(value);
assert.equal(objectGuard(null), false);
assert.equal(objectGuard({}), true);
console.log('GUARD_INPUT', JSON.stringify({ emittedNull: objectGuard(null), substitutedObject: objectGuard({}) }));
console.log('PASS: 3 model scenarios; no production-library execution or modification.');
