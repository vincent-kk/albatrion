# BranchStrategy oneOf Initial-Render Race — Regression Test

**Usage**:

- `/verify-oneof-race` — run the full regression suite (unit + static + build + PROD stress test)
- `/verify-oneof-race --unit` — unit tests only (fast pre-build check)
- `/verify-oneof-race --prod` — PROD build + 30×4 Playwright reload stress test only

---

## Background

`@canard/schema-form` previously had a race in `BranchStrategy` where the active `oneOf`/`anyOf` branch children were appended to `__children__` only in a deferred microtask (`UpdateComputedProperties` subscription), while React's `useChildNodeComponents` captured `node.children` synchronously via `useState(...)`. In PROD builds (no StrictMode) the order was non-deterministic and ~50% of mounts rendered with only `__propertyChildren__`, leaving the oneOf branch fields permanently invisible until the user changed a value.

Fix (commit `6c455492`): `BranchStrategy.initialize()` now calls `__settleInitialCompositionChildren__()` at the end, which synchronously seeds `__oneOfChildNodeMap__`, `__anyOfChildNodeMaps__`, and `__children__` from the already-computed `host.oneOfIndex` / `host.anyOfIndices`. It deliberately does NOT touch `__oneOfIndex__`/`__anyOfIndices__`, does NOT call `__reset__`, and does NOT publish events — so the existing microtask subscription still fires later and performs the reset/derived/emit cycle as before, preserving cross-branch derived-dependency cascades.

This command verifies the fix has not regressed.

---

## 1. Unit tests (pre-build, fast)

```bash
cd packages/canard/schema-form

# Targeted oneOf regression set (under 10s)
node /Users/Vincent/Workspace/albatrion/node_modules/vitest/vitest.mjs run \
  src/core/__tests__/BranchStrategy.oneOf.initialRace.test.ts \
  src/components/__tests__/BranchStrategy.oneOf.initialMount.test.tsx \
  src/core/__tests__/AbstractNode.derivedValue.test.ts \
  src/core/__tests__/ObjectNode.oneOf.test.ts \
  src/core/__tests__/ObjectNode.oneOf.behavior.test.ts \
  src/core/__tests__/oneOfSchemaPath.test.ts \
  src/core/__tests__/AbstractNode.errorDistribution.oneOf.test.ts \
  src/core/__tests__/ConditionalSchema.complexNestedOneOf.test.ts \
  src/core/__tests__/ConditionalSchema.deepNestedOneOf.test.ts \
  src/core/__tests__/ObjectNode.branch.nullable.test.ts
```

**Pass criteria**: all files `0 fail`. Specifically:

- `BranchStrategy.oneOf.initialRace.test.ts > SYNC immediately after construction` must show `oneOfIndex === 0` and `children` containing `salary`, `bonus` synchronously. If this case fails, the race has returned.
- `AbstractNode.derivedValue.test.ts > 외부 derived가 oneOf 분기 내부 값을 참조하되 if 조건에 영향을 주지 않으면 안전해야 함` must pass. If this case fails, the settle pass is doing too much (calling `__reset__` synchronously and stealing the compensating cascade event).

```bash
# Full suite — must remain green
node /Users/Vincent/Workspace/albatrion/node_modules/vitest/vitest.mjs run
```

**Pass criteria**: 153 files / 3017 tests `0 fail`.

---

## 2. Static analysis (pre-build)

```bash
cd packages/canard/schema-form
node /Users/Vincent/Workspace/albatrion/node_modules/eslint/bin/eslint.js "src/**/*.{ts,tsx}"
node /Users/Vincent/Workspace/albatrion/node_modules/typescript/bin/tsc --noEmit
```

**Pass criteria**: no NEW errors beyond the pre-existing baseline (`RefreshAndDefaultValue.test.ts` null-possibility + `stories/*` missing-type warnings, ~20 lines total).

---

## 3. Library + docs PROD build

```bash
cd packages/canard/schema-form
node /Users/Vincent/Workspace/albatrion/node_modules/rollup/dist/bin/rollup -c
# → dist/index.mjs and dist/index.cjs created

cd ../../../documents
yarn build
# → build/ generated
```

**Pass criteria**: both finish with `[SUCCESS]`.

---

## 4. PROD multi-reload stress test (Playwright)

Start the PROD server in one terminal:

```bash
cd documents
yarn serve --port 3001
```

In another shell, run the stress test (4 demos × 30 reloads = 120 page loads):

```bash
ORIGIN=http://localhost:3001/albatrion/docs/canard/schema-form/examples

# Sentinel label that must appear in DOM after every reload
declare -A SENTINEL=(
  ["employment-contract"]="salary"     # root-level oneOf with const matching
  ["product-catalog"]="days"           # nested oneOf with computed.if
  ["media-registration"]="cpu"         # oneOf at object level
  ["nested-profile"]="2FA*"            # anyOf usage
)

npx playwright-cli -s=regress open --browser=chrome "$ORIGIN/employment-contract"
sleep 3

for demo in "${!SENTINEL[@]}"; do
  label="${SENTINEL[$demo]}"
  echo "=== $demo (sentinel=$label) ==="
  npx playwright-cli -s=regress goto "$ORIGIN/$demo" >/dev/null 2>&1
  sleep 2
  pass=0; fail=0
  for i in {1..30}; do
    npx playwright-cli -s=regress reload >/dev/null 2>&1
    sleep 1
    has=$(npx playwright-cli -s=regress --raw eval \
      "() => [...document.querySelectorAll('label')].some(l => l.textContent.trim() === '$label')" \
      2>&1 | tail -1)
    if [ "$has" = "true" ]; then
      pass=$((pass+1))
    else
      fail=$((fail+1))
      echo "  R$i: FAIL"
    fi
  done
  echo "$demo: $pass/30 pass, $fail/30 fail"
done

npx playwright-cli -s=regress close
```

**Pass criteria**: every demo reports `30/30 pass, 0/30 fail`. A single missed sentinel label means the race has returned.

---

## 5. Synchronous `node.children` integrity check

```bash
cd packages/canard/schema-form
node /Users/Vincent/Workspace/albatrion/node_modules/vitest/vitest.mjs run \
  src/core/__tests__/BranchStrategy.oneOf.initialRace.test.ts -t "SYNC immediately after construction"
```

Console must show:

```
[SYNC] children: [ 'employmentType', 'commonField', 'salary', 'bonus' ] oneOfIndex: 0
```

If `salary`/`bonus` are missing from `children` or `oneOfIndex` is `-1`, the race has returned.

---

## When something fails

First places to inspect:

1. `BranchStrategy.ts` — does `initialize()` still call `__settleInitialCompositionChildren__()` at the end?
2. `__settleInitialCompositionChildren__()` — has it been changed to call `__reset__`/`__updateScoped__`/`publish` or otherwise trigger side effects? It MUST stay restricted to updating `__oneOfChildNodeMap__`/`__anyOfChildNodeMaps__`/`__children__`. Calling reset synchronously here breaks the compensating cascade for external `derived` fields that read across oneOf branches.
3. `__prepareCompositionChildren__()` — has the `UpdateComputedProperties` subscription been removed? It must remain — the settle pass only complements it.
4. `useChildNodeComponents.tsx` — has `useState(node.children)` been replaced with another pattern (e.g. `useSyncExternalStore`)? That changes the read semantics and may reintroduce the race.

---

## Debug helper (when a race is suspected)

Temporarily add traces to reproduce:

```ts
// BranchStrategy.ts — first line inside __prepareCompositionChildren__ subscriber
console.log(
  "[sub]",
  this.__host__.path,
  "oneOfIdx=",
  this.__host__.oneOfIndex,
  "prev=",
  this.__oneOfIndex__,
);

// useChildNodeComponents.tsx — right after useState(node.children)
console.log(
  "[init]",
  node.path,
  "children=",
  node.children?.map((c) => c.node.name),
);
```

- **PASS** ordering: `[sub]` appears before `[init]`; `[init]` shows children including the oneOf branch.
- **FAIL** ordering: `[init]` appears first with only `__propertyChildren__` and the cascading `UpdateChildren` doesn't trigger a React re-render — regression.

Remove the traces before committing.
