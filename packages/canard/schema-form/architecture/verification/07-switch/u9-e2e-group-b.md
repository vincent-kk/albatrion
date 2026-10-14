# U9 e2e — Group B 검증 기록

기준 작업 트리: `stage-07`, 브랜치 `feat/schema-form-switch`, 착수 HEAD `3cefe67d5`.
그룹 B 소유 범위만 수정했습니다. git 쓰기·설치·제품 엔진/바인딩 수정은 하지 않았습니다.
다른 그룹의 SCN 공용 파일과 value/settle/notify/validation/fill/exit 및 해당 e2e는 수정하지 않았습니다.

## 결과

- render: **94건 중 93 통과, 1 실패**. 13파일 중 12 통과, 1 실패.
- TypeScript: exit 0. 지정 __tests__ ESLint: exit 0.
- 파일당 명시적 `it(` 선언 최대 15건. 모든 94개 제목이 원장 ID로 시작합니다. skip·todo·it.fails는 없습니다.
- EVENT-070: 새 스파이크에 layout/passive 2건 추가. TSX 구문 진단 0건. 실행은 U11에 남겼습니다.
- 제품 버그 수정 작업이 아니므로 기존 엔진을 되돌리는 red/green은 하지 않았습니다. 실제 하니스에서 실행한 원장 불일치는 아래 실패로 남겼습니다.

`render-disposition.md`의 그룹 B 새 자리 23행, `log.md` §5의 controls 이관 10행과 EVENT-070 추가 행을 대조했습니다.
`round-68-closing.md`의 68C-01·09는 읽었습니다. 요청된 `round-77-closing.md`·`round-78-closing.md`는 지정 위치와 작업 트리 내 파일 검색 모두에서 없었습니다.
처분표에 반영된 78C-01 문장과 현행 원장을 직접 사용했습니다. 누락된 리뷰 원문을 읽었다고 주장하지 않습니다.

## 실행 명령

모든 명령의 cwd는 `packages/canard/schema-form`입니다. 설치 금지를 보장하려고 npx에 `--no-install`을 붙였습니다.
마지막 render 실행은 파일별 결과 수집을 위해 dot과 JSON reporter를 함께 사용했고, JSON 결과 파일은 만들지 않았습니다.

```sh
npx --no-install vitest run --project render --reporter=dot --reporter=json \
  src/__tests__/e2e/union.test.tsx \
  src/__tests__/e2e/union-concurrent-mount.test.tsx \
  src/__tests__/e2e/array.test.tsx \
  src/__tests__/e2e/derive.test.tsx \
  src/__tests__/e2e/controls.test.tsx \
  src/__tests__/e2e/union-types.test.tsx \
  src/__tests__/e2e/union-validation.test.tsx \
  src/__tests__/e2e/array-projection.test.tsx \
  src/__tests__/e2e/array-identity.test.tsx \
  src/__tests__/e2e/controls-input.test.tsx \
  src/__tests__/e2e/controls-caret.test.tsx \
  src/__tests__/e2e/controls-focus.test.tsx \
  src/__tests__/e2e/derive-observers.test.tsx
npx --no-install tsc --noEmit --composite false --rootDir . -p tsconfig.json
npx --no-install eslint "src/__tests__/**/*.{ts,tsx}"
```

## 파일별 실행 결과

| 파일 | 통과 | 실패 | 판정 |
| --- | ---: | ---: | --- |
| `array-identity.test.tsx` | 3 | 0 | PASS |
| `array-projection.test.tsx` | 7 | 0 | PASS |
| `array.test.tsx` | 15 | 0 | PASS |
| `controls-caret.test.tsx` | 6 | 0 | PASS |
| `controls-focus.test.tsx` | 4 | 0 | PASS |
| `controls-input.test.tsx` | 5 | 0 | PASS |
| `controls.test.tsx` | 12 | 0 | PASS |
| `derive-observers.test.tsx` | 4 | 0 | PASS |
| `derive.test.tsx` | 12 | 1 | FAIL |
| `union-concurrent-mount.test.tsx` | 4 | 0 | PASS |
| `union-types.test.tsx` | 10 | 0 | PASS |
| `union-validation.test.tsx` | 3 | 0 | PASS |
| `union.test.tsx` | 8 | 0 | PASS |

## 실패 증거

### SETTLE-049 — derive.reset-subtree-inject-scope

- 파일: `src/__tests__/e2e/derive.test.tsx`.
- 원장 문장: SETTLE-049 “발화한 injectTo의 대상이 하위 트리 밖에 있어도 대상에 쓰는 것은 그대로다”, “원천이 안이면 대상이 다시 주입되고, 밖이면 대상과 하위 트리 밖 노드의 값이 직전 커밋 그대로다.”
- 화면 근거: TEST-021 실제 React DOM 관찰, TEST-023 같은 시나리오의 화면 실행. REACT-024는 Refresh 시 노드 번호와 입력 갱신을 규정합니다.
- 재현: 초기 left.source=A/rightSource=B → leftTarget=manual-left/rightTarget=manual-right로 사용자 편집 → /left.resetSubtree().
- 기대: /leftTarget 노드와 입력 DOM 모두 `left:A`; /rightTarget은 `manual-right`.
- 관찰: 공유 단계의 노드 값 단언은 통과했지만 /leftTarget DOM은 `manual-left`에 머뭅니다. 하니스의 React flush 후에도 같습니다.
- 원문: `AssertionError: DOM value /leftTarget: expected 'manual-left' to be 'left:A'`.
- 위치: `derive.test.tsx:26`의 DOM 단언, `derive.test.tsx:55`의 사례 실행.
- 실패를 유지했습니다. 노드/화면 불일치의 원인 계층을 단정하거나 제품 코드를 수정하지 않았습니다.

## 원장 기대값과 관찰 채널

- LANDING-004: “폼은 분기를 고르지 않는다” — controls.active로 분기를 명시했습니다.
- LANDING-011·018·032: 이미 있던 노드 재채움 없음, 비활성 원본 기본 유지, 공유 노드. 원자적 분기 변경은 batch 단계로 표현해 문자열 clear/type의 중간 빈 분기와 구분합니다.
- LANDING-038: 켜진 조각을 병합한 유효 스키마. lazy/transition/복수 렌더에서 최종 자식 DOM을 관찰합니다.
- VALUE-034: 앞·중간 빈자리는 null 방출, 후행 슬롯 투영만 제거. 명시 슬롯·입력 DOM은 유지합니다.
- LANDING-116·149: minItems로 슬롯을 자동 생성한다는 옛 전제를 쓰지 않습니다. prefixItems와 터미널 값/외부 기본값을 따로 검증합니다.
- VALUE-027·032 / LANDING-139·166: node.value는 자식 합성이고 outputValue가 방출입니다. null 유지 단언은 outputValue에, 자동 쓰기의 화면 단언은 자식 값에 둡니다. 초기 초안의 잘못된 node.value=null 단언을 이 원장 문장에 맞게 바로잡았습니다.
- LANDING-014·163: derived는 자기 의존 에지에서만 발화합니다. active만 읽는 경로 변경으로 수동 편집을 덮지 않습니다.
- SETTLE-049·CONTROLS-079: 하위 트리 로드의 원천 범위, undefined 주입 항목의 쓰기 없음.
- VALIDATE-010·036: UI 활성 마커 제거 뒤 표준 oneOf가 판정합니다. 다른 분기가 유효한 경우 오류 없음이라는 78C-01 기대를 유지했습니다.
- WRITE-083: trim은 포커스 아웃 자동 쓰기이며 같은 값은 쓰지 않고 dirty를 바꾸지 않습니다. REACT-024의 touched는 한 프레임 지연이므로 RAF를 기다린 뒤 단언합니다.
- EVENT-002·003: 동기 입력 전달과 포맷터 소유 캐럿 복구. 원래 스파이크의 제목을 ID 뒤에 보존했습니다.
- EVENT-065: ㄱ→가→각 각 단계의 DOM, React value setter 0회, compositionend 1회, 최종 노드 값을 jsdom에서 관찰합니다. 실제 IME 브라우저/사람 확인은 이 실행의 증거에 포함되지 않습니다.
- EVENT-063·073: 현재 enum을 받는 node.request와 FormHandle.focus를 사용합니다. 공개 publish는 쓰지 않습니다.
- EVENT-070: 두 필드가 실제 노드에 서로 쓰도록 하고 React 종료를 단언합니다. 200회 watchdog은 통과 조건이 아니라 무한 실행을 실패로 끝내는 장치입니다.

## P-25

`derive-observers.test.tsx`의 `VALUE-021 equal-content writes do not emit phantom UpdateValue or watch deliveries (P-25)`가 통과했습니다.
새 객체 참조이지만 같은 내용을 쓰고 source의 UpdateValue와 observer의 UpdateComputedProperties 배달이 모두 0인지 확인했습니다.
이 탐침에서 재현되지 않았다는 뜻이며 P-25 전체 해결이나 모든 경로의 부재를 주장하지 않습니다. 수정은 하지 않았습니다.

## SCN 소유 변경과 공용 확장 필요

- union/array/derive/controls의 계약 문서를 먼저 보완하고, 각 부류에 순수 render.scenario.ts 데이터를 추가하여 기존 부류 index가 노출하는 목록에 연결했습니다.
- controls 잠긴 입력 사례의 호출자 쓰기와 derive undefined 주입 사례의 원자적 쓰기는 기존 batch 어휘로 표현했습니다. 읽기 전용 DOM에 userEvent.clear를 하거나 문자 중간 에지를 새 기대값으로 채택하지 않았습니다.
- 공용 types/utils/constants/components와 루트 index는 그룹 B가 편집하지 않았습니다. 스파이, 캐럿/IME, focus, 배열 키/초점, 검증 다중 소비자, onError, P-25는 전용 e2e에 두었습니다.
- 공용 어댑터의 예산 오류 노출을 넘어서 정착 결과를 검사할 필요가 있어 array/union-types 러너에서 등록 어댑터를 로컬로 감쌌습니다. 기대가 degraded인 단계의 정확한 SCHEMA_FORM_ERROR.BUDGET_EXCEEDED만 받아들이며 다른 예외는 다시 던집니다. 이 정책을 공유할 경우 명시적인 예상 throw 관찰 어휘가 필요합니다.
- 기존 core 전용 `derive.disable-automatic-writes-load`는 이 e2e 목록에 포함하지 않았습니다. 데이터의 reset.automaticWrites='disabled'는 공개 FormHandle.reset의 인자가 아니며, 현재 공유 화면 어댑터도 이를 명시적으로 거부합니다. 이 사례를 화면에서 그대로 공유하려면 Form props 재설정/로드를 표현하는 소비자 어댑터 계약이 먼저 필요합니다. 이를 다른 동작으로 대체해 통과시켜 놓지 않았습니다. 처분표의 그룹 B 필수 이관 행은 이 core 전용 옵션을 요구하지 않습니다.
- 필수 이관에 필요한 새 공용 타입/단계 추가는 없습니다. RAF 대기와 소비자 관찰은 로컬에 유지했습니다.

## 처분표 행별 대응

파일명은 처분표의 옛 scenarios/*.render.test.tsx 기준입니다. 실제 이관은 원본 파일 삭제가 아닌 새 엔진 계약 재작성입니다.

| 처분표 행 | 새 실행 파일 및 보존 관찰 |
| --- | --- |
| array.mutation-identity | array / array-identity — 추가·삭제·재정렬, 위치 재사용, 입력 Refresh, 초점, ChildNodeComponents의 안정 키 |
| array.omit-trailing.composite | array-projection / array-identity — 분기 왕복, 투영 기반 주입, 오류 인덱스 |
| array.omit-trailing.conditional | array-projection — 조건 왕복, 배열 출력, 사용자 값 유지 |
| array.omit-trailing.injection | array-projection — 지정 VALUE-034 제목, setValue/default/reset/nullable/StrictMode와 입력 슬롯 |
| array.omit-trailing | array / array-projection / array-identity — 후행 생략, 내부 null, 검증 경로 |
| array.prefixItems-terminal | array / array-projection — 위치별 스키마, 터미널 배열, 외부 기본값 |
| composition.anyOf | union — 복수 활성·공유 필드·왕복 |
| composition.nested-branch | union — 외부·내부 활성과 값 |
| composition.oneOf.concurrentMount | union-concurrent-mount — lazy 재시도·transition·StrictMode 최종 DOM |
| composition.oneOf.initial | union — 첫 화면과 기본값, 공유 노드 왕복 |
| computed.derived | derive / derive-observers — 사슬·개별 의존·순환 예산·커밋된 onError |
| controlled-interaction | controls-input / controls-caret / controls-focus — 제어/비제어 입력, trim, focus/select |
| injectTo | derive / derive-observers — 형제·부모·배열, 사슬·순환, 명시 분기 활성 |
| multi-render-split-brain | union-validation — 지정 VALIDATE-010/036 제목, 다중 Form.Render와 분리 Input/Error/Label |
| nullable.object-null-branch | union — null 조상의 채움 없음·분기 활성·입력 승격 |
| nullable.object-pending-read-readers | derive / derive-observers — 부모 커밋 읽기, 파생·주입, 출력과 DOM |
| nullable.object-pending-read | derive / derive-observers — watch·inject, null 조상 자동 쓰기 |
| nullable.object-write-provenance | derive — 자동 주입 후 null 유지, 사용자 입력 시 승격 |
| schema-props-renderer | controls / controls-input — presentation props·사용자 렌더러·빈 입력 값 |
| terminal-mode | array / array-projection — 터미널 객체/배열·전체 값 쓰기·reset |
| union.migration-shapes | union / union-validation — 형 없는 객체 분기·리터럴·재귀 오류 대체 화면 |
| virtual.render | controls / controls-input — 가상 ChildNodeComponents·전체 쓰기·활성 왕복·참조 노드 find |
| NullableFormScenarios conditional schemas | union — 지정 nullable-conditional-account와 null 복원 |

## 사례별 원장과 출처

### union.test.tsx

| 사례 (접두어가 원장 ID) | 출처 |
| --- | --- |
| LANDING-004 first screen exposes the explicitly active branch and defaults | 처분표 composition.oneOf.initial |
| LANDING-032 branch round trips retain shared nodes and edited raw values | 처분표 composition.oneOf.initial |
| LANDING-038 multiple active anyOf fragments merge shared fields | 처분표 composition.anyOf |
| LANDING-018 nested branches preserve inner edits across outer activation | 처분표 composition.nested-branch |
| LANDING-139 null ancestors do not fill branch defaults before input promotion | 처분표 nullable.object-null-branch |
| LANDING-004 nullable-conditional-account | 처분표 레거시 NullableFormScenarios — conditional schemas |
| LANDING-207 typeless object branches render successfully | 처분표 union.migration-shapes |
| LANDING-208 typeless literal properties render primitive leaves | 처분표 union.migration-shapes |

### union-concurrent-mount.test.tsx

| 사례 (접두어가 원장 ID) | 출처 |
| --- | --- |
| LANDING-038 lazy retry commits the explicitly selected child DOM | 처분표 composition.oneOf.concurrentMount |
| LANDING-038 StrictMode lazy retry commits the explicitly selected child DOM | 처분표 composition.oneOf.concurrentMount |
| LANDING-004 transition replaces a suspended branch without resurrecting its child | 처분표 composition.oneOf.concurrentMount |
| LANDING-022 StrictMode transition notifies only the committed branch change | 처분표 composition.oneOf.concurrentMount |

### union-types.test.tsx

| 사례 (접두어가 원장 ID) | 출처 |
| --- | --- |
| WRITE-098 union.entry-two-step | U9·TEST-023 기존 SCN union 데이터 (TEST-077·WRITE-093/098/099) |
| WRITE-093 union.gated-effective-list | U9·TEST-023 기존 SCN union 데이터 (TEST-077·WRITE-093/098/099) |
| WRITE-093 union.rule-a | U9·TEST-023 기존 SCN union 데이터 (TEST-077·WRITE-093/098/099) |
| WRITE-093 union.ambiguous | U9·TEST-023 기존 SCN union 데이터 (TEST-077·WRITE-093/098/099) |
| WRITE-093 union.integer | U9·TEST-023 기존 SCN union 데이터 (TEST-077·WRITE-093/098/099) |
| WRITE-093 union.object-array | U9·TEST-023 기존 SCN union 데이터 (TEST-077·WRITE-093/098/099) |
| WRITE-093 union.omit-empty | U9·TEST-023 기존 SCN union 데이터 (TEST-077·WRITE-093/098/099) |
| WRITE-093 union.default-fill | U9·TEST-023 기존 SCN union 데이터 (TEST-077·WRITE-093/098/099) |
| WRITE-099 union.feedback-convergent | U9·TEST-023 기존 SCN union 데이터 (TEST-077·WRITE-093/098/099) |
| WRITE-099 union.feedback-nonconvergent | U9·TEST-023 기존 SCN union 데이터 (TEST-077·WRITE-093/098/099) |

### union-validation.test.tsx

| 사례 (접두어가 원장 ID) | 출처 |
| --- | --- |
| VALIDATE-010 branch switches update children and errors together | 처분표 multi-render-split-brain |
| VALIDATE-036 standard oneOf has no error when another branch is valid | 처분표 multi-render-split-brain |
| LANDING-207 ungated recursive object variants report RECURSIVE_SHAPE_UNBOUNDED with fallback DOM | 처분표 union.migration-shapes |

### array.test.tsx

| 사례 (접두어가 원장 ID) | 출처 |
| --- | --- |
| NODE-051 array.push-slot | 처분표 array.mutation-identity + 기존 SCN array |
| NODE-051 array.pop-slot | 처분표 array.mutation-identity + 기존 SCN array |
| NODE-051 array.remove-slot | 처분표 array.mutation-identity + 기존 SCN array |
| NODE-051 array.clear-slots | 처분표 array.mutation-identity + 기존 SCN array |
| NODE-051 array.update-slot | 처분표 array.mutation-identity + 기존 SCN array |
| NODE-051 array.whole-write | 처분표 array.mutation-identity + 기존 SCN array |
| NODE-052 array.items-prefix | 처분표 array.prefixItems-terminal + 기존 SCN array |
| NODE-053 array.terminal-verbs | 처분표 terminal-mode + 기존 SCN array |
| VALUE-034 array.omit-trailing | 처분표 array.omit-trailing + 기존 SCN array |
| NODE-051 array.position-reconcile | 처분표 array.mutation-identity + 기존 SCN array |
| NODE-052 array.extras-tail | 처분표 array.prefixItems-terminal + 기존 SCN array |
| NODE-052 array.extra-becomes-node | 처분표 array.prefixItems-terminal + 기존 SCN array |
| LANDING-202 array.landing-202 | 처분표 array.mutation-identity + 기존 SCN array |
| VALUE-034 array.empty-output | 처분표 array.omit-trailing + 기존 SCN array |
| WRITE-099 array.source-b-structure | 처분표 array.mutation-identity + 기존 SCN array |

### array-projection.test.tsx

| 사례 (접두어가 원장 ID) | 출처 |
| --- | --- |
| VALUE-034 nullable arrays preserve null and trim explicit slots through reset | 처분표 array.omit-trailing.injection |
| VALUE-034 omitTrailing trims trailing holes and preserves leading null slots | 처분표 array.omit-trailing.injection |
| LANDING-023 branch arrays inject projected output and retain edited slots | 처분표 array.omit-trailing.composite / conditional |
| LANDING-116 minItems does not allocate inputs and explicit slots remain editable | 처분표 array.omit-trailing |
| LANDING-149 prefixItems uses position schemas and reset restores external defaults | 처분표 array.prefixItems-terminal |
| LANDING-142 terminal object whole writes and reset preserve external values | 처분표 terminal-mode / array.prefixItems-terminal |
| LANDING-149 terminal array ignores tuple fill and resets the whole value | 처분표 terminal-mode / array.prefixItems-terminal |

### array-identity.test.tsx

| 사례 (접두어가 원장 ID) | 출처 |
| --- | --- |
| LANDING-164 whole-array reorder retains positional nodes and unchanged focused input | 처분표 array.mutation-identity |
| NODE-051 remove shifts the surviving item key and focused DOM and push creates one item | 처분표 array.mutation-identity |
| VALUE-034 omitted trailing slots keep validation indexes and editable inputs | 처분표 array.omit-trailing / array.omit-trailing.composite (오류 인덱스) |

### derive.test.tsx

| 사례 (접두어가 원장 ID) | 출처 |
| --- | --- |
| LANDING-163 active dependencies do not retrigger an unchanged derived edge | 처분표 computed.derived + 기존 SCN derive |
| LANDING-014 derive.derived-edge-and-reset | 처분표 computed.derived + 기존 SCN derive |
| CONTROLS-028 derive.unset-load-and-runtime-edge | 처분표 computed.derived + 기존 SCN derive |
| CONTROLS-026 derive.same-target-rank | 처분표 computed.derived + 기존 SCN derive |
| CONTROLS-027 derive.inject-to-on-source-edge | 처분표 injectTo + 기존 SCN derive |
| SETTLE-049 derive.reset-subtree-inject-scope | 처분표 injectTo + 기존 SCN derive |
| CONTROLS-079 derive.undefined-injection-stops | 처분표 injectTo + 기존 SCN derive |
| LANDING-030 derive.feedback-budget | 처분표 computed.derived + 기존 SCN derive |
| LANDING-014 dependency edges settle a derived chain and preserve manual edits | 처분표 computed.derived + 기존 SCN derive |
| LANDING-004 sibling injection chains activate an explicit branch | 처분표 injectTo + 기존 SCN derive |
| LANDING-030 nested sources inject parent siblings and array items | 처분표 nullable.object-pending-read / pending-read-readers / write-provenance |
| LANDING-166 input-triggered injection preserves a null ancestor while updating its child | 처분표 nullable.object-pending-read / pending-read-readers / write-provenance |
| LANDING-139 derived values below null update the DOM without promoting the parent | 처분표 nullable.object-pending-read / pending-read-readers / write-provenance |

### derive-observers.test.tsx

| 사례 (접두어가 원장 ID) | 출처 |
| --- | --- |
| LANDING-146 batch parent reads stay committed while updater writes compose | 처분표 nullable.object-pending-read / pending-read-readers (소비자 읽기·watch) |
| LANDING-166 parent reads and watch observe null after an automatic injection | 처분표 nullable.object-pending-read / pending-read-readers (소비자 읽기·watch) |
| LANDING-030 derive budget reports the committed fallback through onError | 처분표 computed.derived / injectTo (순환·예산 보고) |
| VALUE-021 equal-content writes do not emit phantom UpdateValue or watch deliveries (P-25) | 실행 계획 §2.1 I20 / P-25 보완 탐침 |

### controls.test.tsx

| 사례 (접두어가 원장 ID) | 출처 |
| --- | --- |
| CONTROLS-082 controls.lock-or-visibility-and | U9·TEST-023 기존 SCN controls 데이터 (TEST-019 보완) |
| CONTROLS-082 controls.standard-read-only | U9·TEST-023 기존 SCN controls 데이터 (TEST-019 보완) |
| CONTROLS-073 controls.children-host-expression | U9·TEST-023 기존 SCN controls 데이터 (TEST-019 보완) |
| CONTROLS-044 controls.fragment-scope | U9·TEST-023 기존 SCN controls 데이터 (TEST-019 보완) |
| CONTROLS-044 controls.root-keys-do-not-inherit | U9·TEST-023 기존 SCN controls 데이터 (TEST-019 보완) |
| CONTROLS-073 controls.children-value-layer | U9·TEST-023 기존 SCN controls 데이터 (TEST-019 보완) |
| WRITE-031 controls.children-exit-policy-layer | U9·TEST-023 기존 SCN controls 데이터 (TEST-019 보완) |
| WRITE-031 controls.fragment-exit-policy-layer | U9·TEST-023 기존 SCN controls 데이터 (TEST-019 보완) |
| WRITE-031 controls.expression-exit-previous-commit | U9·TEST-023 기존 SCN controls 데이터 (TEST-019 보완) |
| CONTROLS-022 controls.visible-preserves-value | U9·TEST-023 기존 SCN controls 데이터 (TEST-019 보완) |
| LANDING-196 empty default inputs write undefined despite omitEmpty false | 처분표 schema-props-renderer |
| LANDING-167 virtual branches render children through whole writes and activation | 처분표 virtual.render |

### controls-input.test.tsx

| 사례 (접두어가 원장 ID) | 출처 |
| --- | --- |
| LANDING-145 uncontrolled blur trim refreshes the input while typing preserves spaces | 처분표 controlled-interaction / TEST-020 |
| WRITE-083 controlled blur trim replaces raw and DOM and preserves dirty state | 처분표 controlled-interaction / TEST-020 |
| TEST-020 unchanged trim emits no value delivery and focus select reach the input | 처분표 controlled-interaction / TEST-020 |
| LANDING-034 presentation props and custom renderer receive the committed value | 처분표 schema-props-renderer |
| LANDING-167 inline virtual input receives children and resolves the referenced node | 처분표 virtual.render |

### controls-caret.test.tsx

| 사례 (접두어가 원장 ID) | 출처 |
| --- | --- |
| EVENT-003 포맷터의 끝 입력마다 값과 캐럿이 일치한다 | 스파이크 §5 caret [A-1a] (가) 옮김 |
| EVENT-003 포맷터의 중간 삽입 뒤 캐럿이 삽입한 숫자를 따른다 | 스파이크 §5 caret [A-1b] (가) 옮김 |
| EVENT-003 캐럿 복구가 없는 사용자 포맷터의 캐럿을 바인딩이 대신 복구하지 않는다 | 스파이크 §5 caret [A-1c] (가) 옮김 |
| EVENT-002 일반 제어 입력의 중간 연속 삽입에서 캐럿과 값이 유지된다 | 스파이크 §5 caret [A-2] (가) 옮김 |
| EVENT-002 입력 이벤트 반환 직후 DOM이 커밋 값과 일치하고 입력은 한 번 갱신된다 | 스파이크 §5 caret [A-2c] (가) 옮김 |
| EVENT-065 IME 조합의 각 입력 직후 DOM이 조합 중인 글자를 보존한다 | 스파이크 §5 caret [A-5] (가) 옮김 |

### controls-focus.test.tsx

| 사례 (접두어가 원장 ID) | 출처 |
| --- | --- |
| EVENT-063 React 핸들러 밖 focus 명령이 지연 필드를 마운트하고 입력에 도달한다 | 스파이크 §5 redteam4-events/react 7a (가) 옮김 |
| EVENT-063 React 클릭 안의 focus 명령이 지연 필드를 마운트하고 입력에 도달한다 | 스파이크 §5 redteam4-events/react 7b (가) 옮김 |
| EVENT-073 리스너의 focus 명령 뒤 flushSync가 있어도 노출된 입력에 포커스가 도달한다 | 스파이크 §5 redteam4-events/react 7c (가) 옮김 |
| EVENT-073 지연 필드 리스너가 노출 상태를 flushSync해도 입력은 focus 명령을 한 번 받는다 | 스파이크 §5 redteam4-events/react 7d (가) 옮김 |

## EVENT-070 추가와 U11 인계

`architecture/spikes/events/effect-feedback.spike.test.tsx`:

- `EVENT-070 React stops two fields writing back through useLayoutEffect`
- `EVENT-070 React stops two fields writing back through useEffect`

출처는 log.md §5 EVENT-070 “(가) 더함”, 68C-09·REACT-017입니다.
기존 스파이크는 보존했습니다. 새 파일은 U11에서 React 18·19 양쪽으로 실행해야 하며, passive feedback이 watchdog까지 계속되면 원장대로 소유자 판단이 필요합니다.
브라우저 IME/실제 caret 확인과 스토리북 실행도 이번 그룹 B의 jsdom 결과에 포함되지 않습니다.

## 검토 인계

검토 범위는 위 13개 e2e, 네 SCN 부류의 데이터/계약 변경, 새 EVENT-070 스파이크와 이 보고서입니다.
검토자는 실행 계획 U9·§2.1, 처분표와 log §5, .claude/rules/seiri_*·filid_*, 패키지 Render-Level Test Harness를 기준으로 대조할 수 있습니다.
실패 1건을 의도적으로 유지했고, 누락 리뷰 2개 및 core 전용 reset 옵션의 화면 미대응을 위에 밝혔습니다.
git 쓰기나 U11 실행은 이 인계에 포함되지 않습니다.

