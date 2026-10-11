# G27 런타임 단언 제거 작업 보고서

## 추가 구현 전 확인한 정확한 차이 입력과 근거

아래 행 번호는 변경 전 HEAD `035da3fb4`의 패키지 상대 경로입니다. 이 차이 입력과 근거는 후속 구현 전에 먼저 기록했습니다.

- **#3:** `{ type: 'object', properties: { a: { type: 'string' } }, options: { virtual: { group: null } } }` 및 group을 undefined로 바꾼 입력입니다. `src/core/blueprint/utils/analyze/populateVirtualNodes.ts:42–44`는 reader 결과에서 fields를 직접 읽고 `src/core/blueprint/utils/analyze/readSchemaObject.ts:8–12`는 boolean만 빈 객체로 바꿉니다. 따라서 null/undefined는 native fields TypeError로 실패합니다. 설계의 가드 오류 분기는 이를 Blueprint 오류로 바꿉니다. group을 `Object.assign(() => {}, { fields: ['a'] })`로 바꾸면 기존 fields 검증(`populateVirtualNodes.ts:45–55`)을 통과하고 원래 함수 참조를 선언에 남깁니다(`:80–95`, `collectDeclarations.ts:65–100`). **추가로 확인한 정확한 반례:** `Object.defineProperty(Number.prototype, 'fields', { configurable: true, value: ['a'] })`를 설정한 동안 같은 입력의 group=7도 수락하며 declaration.schema가 숫자 7입니다. boolean/비null object 가드는 두 수락 입력을 거절합니다. `src/core/blueprint/type.ts:1–2`의 BlueprintSchema 봉투에는 숫자가 포함되지 않습니다.
- **#7:** `{ type: 'string', properties: { child: null, valid: { get controls() { reads.push('valid'); return {}; } } } }`에 collect를 주입한 입력 및 child를 undefined로 바꾼 입력입니다. `src/core/blueprint/utils/diagnostics/collectInlineTerminalWarnings.ts:64–70`는 모든 map child를 pending에 넣고 `:40–51`은 LIFO 방문 중 controls를 직접 읽습니다. valid getter가 먼저 실행된 뒤 nullish child의 controls TypeError가 발생합니다. 가드 뒤 skip은 crash를 없애고 push 위치의 즉시 throw는 읽기 순서를 바꿉니다. child를 `Object.assign(() => {}, { controls: { visible: true } })`로 바꾸면 `:49–54`, `:116–124`가 해당 경로 경고를 방출하므로 함수 skip도 경고를 바꿉니다.
- **#13:** `const type: unknown[] = new Array(2); type[1] = 'string'; readAllowedTypes({ type }, '#')`의 기존 결과는 `[undefined, 'string']`입니다. `src/core/blueprint/utils/types/readAllowedTypes.ts:27–32`의 some은 hole을 건너뛰지만 `:44`의 spread는 undefined로 복사합니다. indexed 검증·수집 loop는 hole을 거절합니다. `new Proxy(['string', 'null'], { get(target, key, receiver) { /* 키 접근 기록 */ return Reflect.get(target, key, receiver); } })`는 indexed 검증을 마친 뒤 Symbol.iterator와 원소를 다시 읽습니다(`:29–32`, `:44`). 검증과 push를 합치면 순서·횟수가 달라집니다. `const type = ['string']; type[Symbol.iterator] = () => ['custom-iterator-value'].values()`도 기존에는 indexed 검증 후 다른 iterator 값을 복사합니다. 이번 후속 요청이 허용한 기존 iteration의 predicate는 이 행동을 모두 유지할 수 있습니다.

## 상태

**#4·#7·#8·#9·#11·#13 여섯 건을 구현했습니다. #3만 기존 타입 계약과 동작 보존을 동시에 만족하지 못하여 남겼습니다.** #7은 잘못된 값을 버리지 않고 native 읽기를 보존하며, #13은 기존 iteration에 predicate를 붙였습니다. 일곱 건 완료를 주장하지 않습니다.

- 작업 트리: `/Users/Vincent/Workspace/albatrion/.claude/worktrees/stage-07`
- 패키지: `packages/canard/schema-form`
- HEAD `035da3fb4`, branch `feat/schema-form-switch` 유지. 커밋·스테이징 없음.
- 변경 파일 18개: 구현 10개(기존 7개 수정, 공유 가드 2개 및 raw 읽기 view 1개 추가), 근접 테스트 7개, DETAIL 1개.
- 추가 테스트 17개: 여섯 구현 대상 14개와 #3 현행 동작 기록 3개.
- #3 구현 파일과 전용 ESLint 주석은 HEAD 그대로입니다. 다른 여섯 대상의 단언과 해당 단언 전용 주석은 제거했습니다.
- `src/__legacy__`, 다른 단언, 패키지 진입점, 의존 패키지 및 빌드 산출물은 변경하지 않았습니다. 새 금지 단언·ignore도 없습니다.

아래 경로는 패키지 기준입니다. 새 함수는 목적·입력·반환값을 문서화했으며 각 공유 함수 파일은 이름이 같은 함수 하나만 내보냅니다. 두 공유 가드 및 #13의 로컬 가드 본체에는 as/any가 없습니다. Blueprint DETAIL은 현재 검사·읽기 계약과 실행 비용을 반영했습니다. 새 helper 디렉터리에는 별도 INTENT/DETAIL이 없고 소유 모듈 문서를 갱신했습니다.

## #3 — populateVirtualNodes: 미구현

- 구현 파일: `src/core/blueprint/utils/analyze/populateVirtualNodes.ts` — 변경 없음.
- 테스트: `src/core/blueprint/utils/analyze/__tests__/populateVirtualNodes.test.ts` — 3개 추가.
- 예정 가드 위치: 청사진 분석 중 virtual entry마다 한 번. 일반 업데이트에 추가하는 경로가 아닙니다.
- 런타임 변경: 없음. 새로운 오류를 만들지 않았습니다.
- 기존 null/undefined는 `TypeError: Cannot read properties of null/undefined (reading 'fields')`입니다. 일반 숫자·문자열·boolean은 기존 `VIRTUAL_FIELDS_NOT_VALID`로 실패합니다. 그러나 fields를 가진 함수 및 상속 fields를 가진 숫자 7은 수락하며 원래 값이 선언에 저장됩니다.
- nullish native 실패는 #7처럼 지연 property view로 유지할 수 있습니다. **남는 장애는 숫자 7의 저장입니다.** #3은 읽은 값을 `SchemaInput.schema`로 넘겨 declaration·fragment에 같은 값으로 보관합니다. BlueprintSchema의 boolean/record 봉투로 숫자를 정직하게 좁힐 수 없습니다. proxy/boxing은 저장 값을 바꾸고, 숫자도 record라고 하는 predicate는 거짓 계약입니다. reader의 any 또는 Reflect.apply의 permissive 반환으로 강한 schema 타입을 만드는 방법은 승인 설계의 신뢰 경계 기준을 위반합니다.
- 따라서 지정 범위·기존 타입 계약·정직한 narrowing을 함께 유지하는 제거 변형은 확인하지 못했습니다. wider raw carrier 계약은 가능하지만 추가 타입·소비자 수정이 필요합니다. 마지막 절에 두 구체적인 선택지를 적었습니다.
- 테스트는 nullish native 실패, 원시값 오류 코드, 함수의 수락·참조, 상속 fields를 가진 primitive의 수락·참조를 기록합니다. prototype descriptor는 finally에서 복원합니다. **#3의 가드 제거/반전 검증 조건은 미충족입니다.** 봉투 가드로 함수 또는 숫자를 거절하면 해당 수락 테스트가 실패합니다.

## #4 — resolveReference: 구현 완료

- 변경: `src/core/blueprint/utils/analyze/resolveReference.ts`, `src/core/blueprint/utils/types/isBlueprintSchema.ts`.
- 테스트: `src/core/blueprint/utils/analyze/__tests__/resolveReference.test.ts` — 2개.
- 가드: `typeof value === 'boolean' || (value !== null && typeof value === 'object')`. 배열·Date 등 비plain object도 수락합니다.
- 호출: 기존 try/catch의 getValue 성공 직후 이전 검사 위치입니다. 조회 결과를 unknown으로 받고 기존 unknown-input overload를 사용합니다.
- 런타임 변경: 기존 복합 검사를 가드 함수 호출로 교체했습니다. 두 번째 검사나 새 오류 분기는 없습니다. URI/pointer catch, `UNKNOWN_JSON_SCHEMA`, 위치·guidance·collector를 유지합니다.
- 실행 경로: 청사진 분석 중 참조 조회마다 한 번. 일반 업데이트에 참조 조회를 추가하지 않습니다.
- 테스트: boolean·object·array·Date 수락, undefined/null/숫자/문자열/함수 거절 및 오류 수집 내용을 확인합니다. pointer 오류는 결과 가드 이전에 실패합니다.
- 가드 제거 시 호출 검증이 실패합니다. 반전 시 정상 조회 결과가 기존 오류로 거절됩니다. 동등 검사 교체이므로 실제 출력 검증과 가드 호출 확인을 함께 사용했습니다.

## #7 — collectInlineTerminalWarnings: 구현 완료

- 변경: `src/core/blueprint/utils/diagnostics/collectInlineTerminalWarnings.ts`, `src/core/blueprint/utils/diagnostics/collectInlineTerminalWarnings/utils/createSchemaReadView.ts`, 공유 `src/core/blueprint/utils/types/isBlueprintSchema.ts`.
- 테스트: `src/core/blueprint/utils/diagnostics/__tests__/collectInlineTerminalWarnings.test.ts` — 4개.
- 호출: pending과 ancestors의 schema는 unknown입니다. 기존 boolean/ancestor skip 뒤 실제 pop 방문 시점에 isBlueprintSchema를 한 번 호출합니다. map child의 대상 단언을 제거하고 원래 값을 pending에 저장합니다. 배열 child도 unknown으로 읽되 기존 iteration은 유지합니다.
- 런타임 변경: 방문마다 가드 호출과 reader 선택 분기가 추가됩니다. 통과 값은 기존 readSchemaObject, 불일치 값은 createSchemaReadView의 지연 native indexed 읽기를 사용합니다. skip·새 오류는 없습니다.
- view는 새 Record target의 Proxy이며 정확한 receiver에서 요청한 키를 읽고 결과를 unknown으로 제한합니다. Reflect.apply는 native 접근 실행에 사용하며 강한 BlueprintSchema나 검증된 keyword를 반환받지 않습니다. helper에 새 as/any는 없습니다. 기존 reader의 any 반환까지 제거했다고 주장하지 않습니다.
- 보존: null/undefined는 기존 LIFO 방문의 첫 controls 접근에서 native TypeError를 냅니다. 뒤에 넣은 valid getter가 먼저 읽히며 진단은 방출되지 않습니다. 함수 child의 controls 경고도 유지합니다. Number.prototype의 controls getter와 properties={again:7}를 가진 child=7은 getter를 한 번 읽고 primitive cycle을 차단합니다. 원래 값이 ancestors에 남으므로 view identity가 순환 판정을 바꾸지 않습니다.
- 실행 경로·비용: collect가 켜진 분석 및 캐시에 늦게 collector가 붙는 수집입니다. boolean/ancestor skip을 통과한 방문(root 포함)당 가드 한 번입니다. 봉투 밖 값에만 일시적인 target·Proxy·handler 및 읽기별 reflection 인자 배열이 생깁니다. 정상 object에는 view를 만들지 않고 새 보유 캐시나 일반 업데이트 순회도 없습니다.
- 테스트: object/function/primitive/boolean의 가드·view 선택, 함수 경고, nullish crash 시점·읽기 순서, 상속 primitive getter 및 cycle입니다. 제거 시 가드 호출 확인이 실패합니다. #7만 반전하면 정상 object에도 view가 호출되어 경로 선택 테스트가 실패합니다(1 failed / 3 passed). HEAD 계산 경로로 복원한 검사에서도 경로 선택 테스트만 실패하고 행동 기록 3개는 통과했습니다.

## #8 — applyControlHints: 구현 완료

- 변경: `src/core/blueprint/utils/effectiveSchema/utils/applySchemaContribution/utils/applyControlHints.ts`, `src/core/blueprint/utils/types/isObjectRecord.ts`.
- 테스트: `src/core/blueprint/utils/effectiveSchema/utils/applySchemaContribution/utils/__tests__/applyControlHints.test.ts` — 2개.
- 가드: `value !== null && typeof value === 'object'` → `Readonly<Record<string, unknown>>`. 배열·인스턴스·상속 getter를 제한하지 않습니다.
- 호출 및 런타임 변경: 함수 진입의 기존 source object 검사를 가드 호출 한 번으로 교체했습니다. hints는 좁혀진 source입니다. 추가 검사는 없습니다. target.controls 읽기, 이전값 복사, watch/default 직접 읽기, 키 삽입·소유 등록을 유지합니다. 정의된 getter 순서는 watch→watch→default→default입니다.
- 실행 경로: 정적 분석 및 runtime 유효 스키마 메모 미스의 controls 기여마다 실행합니다. 메모 hit인 일반 업데이트마다 호출하지 않습니다.
- 테스트: 상속 getter 순서·횟수, 기존 controls 불변성, 키 순서·참조·소유 등록, 배열 수락과 비object 입력의 target 읽기 이전 반환입니다.
- 제거 시 가드 호출 확인이 실패하며 nullish의 watch 접근도 실패합니다. 반전 시 정상 controls 복사가 사라지고 거절 입력의 target 읽기가 발생합니다.

## #9 — mergeHintGroup: 구현 완료

- 변경: `src/core/blueprint/utils/effectiveSchema/utils/mergeHintGroup.ts`, `src/core/blueprint/utils/effectiveSchema/utils/mergeHintGroup/utils/freezeCreatedHintObjects.ts`, 공유 isObjectRecord.
- 테스트: `src/core/blueprint/utils/effectiveSchema/utils/__tests__/mergeHintGroup.test.ts` — 2개.
- 호출: freezeCreatedHintObjects의 result 입력을 object로 낮추고 Object.keys 앞에서 isObjectRecord를 호출합니다. caller는 단언 없이 result를 전달합니다.
- 런타임 변경: root/재귀 진입마다 가드 호출과 early-return 분기 하나를 추가했습니다. 실제 caller의 result와 기존 plain-object 재귀 값은 모두 통과합니다. nullish/primitive/function을 Reflect.apply로 직접 전달하는 비정상 호출은 열거 전에 반환하도록 달라집니다. 실제 merge caller가 이런 입력을 만든다는 뜻은 아닙니다.
- 실행 경로: mount와 runtime 메모 미스에서 두 hint가 실제 병합되어 새 object가 생겼을 때 root 및 새 plain-object 자손마다 한 번입니다. 입력 참조 재사용은 기존 identity 검사로 순회하지 않습니다. production에서도 실행합니다.
- result 직접 읽기, earlier/later의 기존 getDataProperty, 빌린 참조 skip, 자손 동결 및 root 소유 등록은 유지합니다. getDataProperty의 기존 내부 단언은 이번 대상이 아닙니다.
- 테스트: root→style→nested 가드 3회, 새 자손 동결, 빌린 입력 비동결, 비record 직접 입력의 Object.keys 미호출입니다. 제거 시 호출 횟수와 nullish 반환 검증이 실패합니다. 반전 시 root에서 반환하여 재귀 호출·동결 검증이 실패합니다.

## #11 — mergeSingleStaticContribution: 구현 완료

- 변경: `src/core/blueprint/utils/effectiveSchema/utils/mergeSchemaContributions/utils/mergeSingleStaticContribution.ts`, #8의 생산자 및 공유 가드.
- 테스트: `src/core/blueprint/utils/effectiveSchema/utils/mergeSchemaContributions/utils/__tests__/mergeSingleStaticContribution.test.ts` — 1개.
- 호출: controls 분기를 applyControlHints(schema, value) 한 번으로 바꿨으며 생산자 내부에서 isObjectRecord를 한 번 호출합니다. 기존 caller 검사·단언·복사 블록은 제거했습니다.
- 런타임 변경: 인라인 검사/복사를 생산자 호출 및 그 안의 가드 호출로 교체했습니다. 중복 검사는 없습니다. 생산자가 fresh schema.controls를 한 번 읽고 undefined previous를 spread하여 빈 봉투를 만듭니다. source watch/default 읽기 순서·횟수, 키 삽입·소유 등록·최종 동결은 같습니다. 새 보유 자료는 없습니다.
- 실행 경로: mode=static의 기존 단일 무조건 scalar 기여 자격을 통과한 mount fast path에서 controls 키마다 한 번입니다. 일반 runtime 업데이트의 추가 비용으로 세지 않습니다.
- 테스트: 생산자·가드 각 1회, getter 읽기, null/숫자/문자열 거절, 배열 수락, 최종 키 순서·동결·소유 색인 제거입니다. 위임 제거 시 생산자 호출이 0회입니다. 내부 가드 제거 시 가드 호출 확인이 실패하고 반전 시 정상 controls와 getter 읽기가 사라집니다.

## #13 — readAllowedTypes: 구현 완료

- 변경: `src/core/blueprint/utils/types/readAllowedTypes.ts`.
- 테스트: `src/core/blueprint/utils/types/__tests__/readAllowedTypes.test.ts` — 3개.
- 가드: 문서화한 로컬 isAllowedTypeList predicate가 기존 length·some·일곱 문자열 includes·중복 indexOf 검사를 그대로 수행합니다. 성공 후 원래 spread가 단언 없이 타입을 받습니다.
- 런타임 변경: 기존 전체 검사식을 가드 함수 호출 한 번으로 교체했습니다. 빈 목록 short-circuit, hole skip, 값·중복 검사, 그 뒤 spread·nullable·union 순서가 같습니다. 추가 pass·원소 읽기·결과 배열·Set이 없습니다. 기존 오류 코드·details와 schema.type 읽기 횟수도 유지합니다.
- 실행 경로: 청사진 분석 중 선언별 형 해석과 runtime 유효 스키마 메모 미스의 형 기여입니다. 메모 hit인 일반 업데이트마다 추가하지 않습니다.
- 보존과 한계: sparse `[hole, 'string']`의 `[undefined, 'string']` 결과, indexed 검증 뒤 별도 iterator 복사 및 custom iterator의 다른 출력도 유지합니다. 후속 요청이 허용한 기존 iteration narrowing이며 iterator/getter 변경까지 검사하여 반환 원소를 강화했다고 주장하지 않습니다.
- 테스트: 일곱 이름·기존 빈/중복/unknown 오류, sparse 결과, Proxy 읽기 순서 `['0','0','1','0','1','Symbol(Symbol.iterator)','0','1']`, custom iterator 결과입니다. 가드 제거 시 잘못된 목록에 오류가 없고 검증 reads가 사라져 첫째·둘째 테스트가 실패합니다. 반전 시 정상 형 입력이 기존 오류로 거절됩니다.

## 테스트의 실패 증거

- 기존 네 건(#4·#8·#9·#11): 제거/반전 각각 4 files failed, 6 tests failed / 1 passed (7 total). 통과한 pointer 오류 사례는 가드 전에 실패하는 경로입니다. 로그는 `/private/tmp/g27-runtime7-four-removed.log`, `/private/tmp/g27-runtime7-four-inverted.log`입니다.
- 후속 #7·#13 제거: 2 files failed, 3 tests failed / 4 passed (7 total). 각 대상 파일에서 가드 제거의 직접 실패를 확인했습니다. `/private/tmp/g27-runtime7-followup-removed.log`.
- 후속 #7·#13 동시 반전: 2 files failed, 7 tests failed. #13 반전이 blueprint setup에도 영향을 주므로 이 결과만으로 #7의 독립 반전 증거를 주장하지 않습니다. `/private/tmp/g27-runtime7-followup-inverted.log`.
- **#7 독립 반전:** 경로 선택 확인이 view의 불필요한 호출로 실패했습니다. 1 failed / 3 passed. `/private/tmp/g27-runtime7-followup-warning-inverted-alone.log`.
- #7 HEAD 계산 경로로 복원: 경로 선택 테스트만 실패했고 함수/native 실패/primitive cycle 행동 기록은 통과했습니다. 1 failed / 3 passed. `/private/tmp/g27-runtime7-followup-legacy-behavior.log`.
- #3·#7·#13 정상 근접 실행은 3 files / 9 tests passed였습니다. `/private/tmp/g27-runtime7-followup-focused.log`. 최종 전체 실행은 새 근접 테스트 17개도 모두 포함했습니다.
- 모든 임시 변이는 복원했습니다. #3의 3개는 동작 기록이며 가드 검증 완료로 세지 않습니다.

## 지정 검증 결과

변이 복원 후 네 명령을 다시 직접 실행했습니다. package 디렉터리에서 Node **v26.11.1**을 PATH 첫 항목으로 설정했습니다. yarn/npm/pnpm/bun이나 설치 명령은 실행하지 않았습니다. `/usr/bin/time -p`로 실제 경과 시간도 기록했으며 모두 8분 이내입니다.

| 명령 | 결과 | 계수 | 실제 경과 시간 |
| --- | --- | --- | --- |
| `npx --no-install tsc --noEmit --composite false --rootDir . -p tsconfig.json` | exit 0 | 진단 0 | 12.19초 |
| `npx --no-install eslint "src/**/*.{ts,tsx}"` | exit 0 | 오류 0·경고 0 | 8.29초 |
| `npx --no-install vitest run --project unit --project render --project react18 --reporter=dot` | exit 0 | 479 files passed; 3455 tests passed / 1 todo (3456 total) | 83.59초 (Vitest 81.74초) |
| `node architecture/verification/07-switch/tools/check-legacy-isolation.mjs` | exit 0 | `LEGACY_ISOLATED: 1695 files checked` | 0.54초 |

최종 로그는 `/private/tmp/g27-runtime7-followup-final-tsc.log`, `/private/tmp/g27-runtime7-followup-final-eslint.log`, `/private/tmp/g27-runtime7-followup-final-vitest.log`, `/private/tmp/g27-runtime7-followup-final-legacy.log`입니다. 시간 계측 출력 외 tsc/eslint 진단 출력은 없습니다. 기존 suite의 validator warning 출력은 있으나 실패는 없습니다.

`git diff --check`도 통과했습니다. 별도 성능 판정 세션은 요청 범위가 아니므로 실행하지 않았으며 호출 비용의 시간 영향을 추측하지 않았습니다.

## 최종 변경 파일 목록

1. `src/core/blueprint/DETAIL.md`
2. `src/core/blueprint/utils/types/isBlueprintSchema.ts`
3. `src/core/blueprint/utils/types/isObjectRecord.ts`
4. `src/core/blueprint/utils/analyze/resolveReference.ts`
5. `src/core/blueprint/utils/diagnostics/collectInlineTerminalWarnings.ts`
6. `src/core/blueprint/utils/diagnostics/collectInlineTerminalWarnings/utils/createSchemaReadView.ts`
7. `src/core/blueprint/utils/types/readAllowedTypes.ts`
8. `src/core/blueprint/utils/effectiveSchema/utils/applySchemaContribution/utils/applyControlHints.ts`
9. `src/core/blueprint/utils/effectiveSchema/utils/mergeHintGroup.ts`
10. `src/core/blueprint/utils/effectiveSchema/utils/mergeHintGroup/utils/freezeCreatedHintObjects.ts`
11. `src/core/blueprint/utils/effectiveSchema/utils/mergeSchemaContributions/utils/mergeSingleStaticContribution.ts`
12. `src/core/blueprint/utils/analyze/__tests__/populateVirtualNodes.test.ts`
13. `src/core/blueprint/utils/analyze/__tests__/resolveReference.test.ts`
14. `src/core/blueprint/utils/diagnostics/__tests__/collectInlineTerminalWarnings.test.ts`
15. `src/core/blueprint/utils/effectiveSchema/utils/applySchemaContribution/utils/__tests__/applyControlHints.test.ts`
16. `src/core/blueprint/utils/effectiveSchema/utils/__tests__/mergeHintGroup.test.ts`
17. `src/core/blueprint/utils/effectiveSchema/utils/mergeSchemaContributions/utils/__tests__/mergeSingleStaticContribution.test.ts`
18. `src/core/blueprint/utils/types/__tests__/readAllowedTypes.test.ts`

## #3에 필요한 결정 — 두 구체적인 선택지

달라지는 정확한 수락 입력은 상속 fields=['a']가 있는 동안의 `options.virtual.group=7` 및 자체 fields=['a']가 있는 함수입니다. nullish native crash 자체는 보존 가능하므로 그것을 바꿀 필요는 없습니다. 자동 승인 거절이나 환경 문제로 보류한 작업은 없습니다.

1. **동작 보존과 타입 범위 확대:** SchemaInput·PropertyDeclaration·SchemaFragment의 raw schema carrier를 unknown 등 원시값까지 표현하는 계약으로 넓히고 소비자마다 봉투 또는 unknown property 읽기 경계를 둡니다. 숫자 7·함수의 원래 저장 값과 nullish native 실패를 유지합니다. 일곱 지정 단언 외의 타입·소비자 수정 범위를 허용해야 합니다.
2. **virtual 입력 수락 범위 축소 허용:** boolean/비null object만 허용하도록 #3의 봉투 가드를 적용하고, fields를 가진 숫자 7과 함수의 수락을 변경하는 것을 명시적으로 허용합니다. 일반 잘못된 entry는 기존 fields 오류 코드·details를 유지하고 null/undefined는 원래 fields 접근의 native TypeError를 유지하는 분기로 구성합니다. 위 두 수락 입력에는 새 거절 동작이 생깁니다.

#3은 선택 전 기존 구현을 그대로 남겼습니다. #7과 #13에는 남은 결정이 없습니다.
