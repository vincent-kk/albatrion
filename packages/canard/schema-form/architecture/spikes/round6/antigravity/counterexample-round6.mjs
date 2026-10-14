// packages/canard/schema-form/architecture/spikes/round6/antigravity/counterexample-round6.mjs
// Round 6 Spike: Counterexamples in Current Specification / Prototypes

import assert from "node:assert/strict";

console.log("=== Round 6 Architectural Spike ===");

// ----------------------------------------------------------------------------
// Test 1: U-1 Discrepancy in Select-Guard initialSelection
// Specification (round-5-derivations.md §1 C-1·C-7, adr/0002 §선택 가드의 초기 선택):
// "값이 분기가 선언한 키를 하나도 갖고 있지 않으면 분기 없음이다 (selection 없음, 어느 조각도 켜지지 않는다)"
// Prototype (loop-v4b.mjs / REPORT-v4b.txt §5 U-1):
// bestCount starts at -1, so if loadedValue has keys (e.g. {zzz: 1} or {id: 5}),
// count = 0 > -1, selecting branch 0!
// ----------------------------------------------------------------------------
function runInitialSelectionPrototype(branches, loadedValue) {
  let bestIndex = -1;
  let bestCount = -1;
  const valueKeys = Object.keys(loadedValue);

  if (valueKeys.length === 0) {
    return -1; // NO_SELECTION
  }

  for (let i = 0; i < branches.length; i++) {
    const declaredKeys = branches[i].declaredKeys;
    let count = 0;
    for (const k of declaredKeys) {
      if (k in loadedValue) count++;
    }
    if (count > bestCount) {
      bestCount = count;
      bestIndex = i;
    }
  }
  return { bestIndex, bestCount };
}

const branches = [
  { name: "BranchA", declaredKeys: ["typeA", "fieldA"], defaultA: "defaultA" },
  { name: "BranchB", declaredKeys: ["typeB", "fieldB"], defaultB: "defaultB" }
];

console.log("\n[Test 1] Select-guard initialSelection with extra key only:");
const extraOnlyResult = runInitialSelectionPrototype(branches, { zzz: "unknownKey" });
console.log("prime({ zzz: 'unknownKey' }) =>", extraOnlyResult);
// In loop-v4b, bestIndex is 0 instead of -1 (NO_SELECTION)!
assert.equal(extraOnlyResult.bestIndex, 0, "Prototype selects branch 0 for extra keys!");
console.log("=> Confirmed: Prototype loop-v4b activates Branch 0 and injects defaults on unrelated keys, contradicting P2 & D-8.");

// ----------------------------------------------------------------------------
// Test 2: Non-idempotent setValue(getValue()) with omitEmpty: true
// Specification (adr/0013:59, adr/0007:89 D-7):
// "setValue(getValue())에는 로드 계약이 그대로 적용된다 (D-7 (a)).
// 사용자가 지운 키는 getValue()에 없으므로 재주입되어 멱등이 아니다."
// When omitEmpty is true, user intent (clearing a field to empty string)
// is permanently erased on setValue(getValue()) unless explicit disableDefaultInjection is set.
// ----------------------------------------------------------------------------
console.log("\n[Test 2] Non-idempotent setValue(getValue()) data destruction under omitEmpty:");
const schema = {
  properties: {
    nickname: { type: "string", default: "Guest" },
    bio: { type: "string", default: "Hello" }
  }
};

let raw = { nickname: "Guest", bio: "Hello" };
const omitEmpty = true;

function projectEmit(rawObj) {
  const emit = {};
  for (const [k, v] of Object.entries(rawObj)) {
    if (omitEmpty && v === "") continue;
    if (v !== undefined) emit[k] = v;
  }
  return emit;
}

// User clears nickname to ""
raw.nickname = "";
const emitAfterEdit = projectEmit(raw);
console.log("User edited nickname to '': raw =", raw, "emit =", emitAfterEdit);

// Consumer calls setValue(getValue())
function setValueOverwrite(V, disableDefault = false) {
  const newRaw = {};
  for (const k of Object.keys(schema.properties)) {
    if (k in V) {
      newRaw[k] = V[k];
    } else {
      if (!disableDefault && schema.properties[k].default !== undefined) {
        newRaw[k] = schema.properties[k].default;
      } else {
        newRaw[k] = undefined;
      }
    }
  }
  return newRaw;
}

const rawAfterResync = setValueOverwrite(emitAfterEdit, false);
console.log("After setValue(getValue()): raw =", rawAfterResync, "emit =", projectEmit(rawAfterResync));
assert.equal(rawAfterResync.nickname, "Guest", "Default resurrected user-cleared string!");
console.log("=> Confirmed: User cleared string '' is replaced by default 'Guest' upon setValue(getValue()).");

console.log("\nAll spike tests finished successfully.");
