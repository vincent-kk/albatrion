# assembleObject 최초 extras 전용 직접 쓰기(가설 F) 독립 검토 보고서

## 최종 판정: PASS

- **대상 PR**: Draft PR [#426](https://github.com/vincent-kk/albatrion/pull/426)
- **PR Head**: `e3c9edf1f11c8f0788d561ea4042f9b5a36e7d13`
- **PR Base**: `90a923d0ac4f4d592656a0a89d53f87643f20c0d` (`feat/schema-form-08-review-and-perf`)
- **제품 코드 동등 기준**: `9a473b2a2` (L3 #420 이후 불변)
- **작업 트리**: `/Users/Vincent/Workspace/albatrion/schema-form-assemble-first`
- **검토자**: Orca Dispatched Worker (`task_3ec3f6162485`)
- **검토 일시**: 2026-10-20T14:30:00+09:00

---

## 1. 8대 검증 항목 상세 결과 및 증거

### 1. 변경 범위 및 순증 행 수 (Scope & Net Lines)
- **파일 변경 범위**: `git diff 90a923d0a..e3c9edf1f --stat` 검증 결과, 변경된 파일은 패키지 내부 5개 파일로 엄격히 한정되었습니다.
  - `packages/canard/schema-form/src/core/engine/behaviors/objectBehavior/branch/utils/assembleObject.ts` (30줄 변경: +25, -5)
  - `packages/canard/schema-form/src/core/engine/behaviors/objectBehavior/DETAIL.md` (2줄 수정: -1, +1)
  - `packages/canard/schema-form/src/core/engine/behaviors/objectBehavior/branch/utils/__tests__/assembleObject.extras-first.test.ts` (172줄 추가)
  - `packages/canard/schema-form/src/core/engine/behaviors/objectBehavior/branch/utils/__tests__/fixtures/assembleObject.baseline.ts` (256줄 추가)
  - `packages/canard/schema-form/architecture/verification/perf-optimization/assemble-first-results.md` (117줄 추가)
- **커밋 순서**: `git log --oneline 90a923d0a..e3c9edf1f` 확인 결과, DETAIL 단독 커밋(`b2a2c99ec`)이 코드 및 차등 시험 커밋(`1e62d21d2`)보다 선행하여 커밋되었습니다.
- **순증 행 수**: 신규 `if` 분기 블록(165–183행)은 19행이며, 기존 `extra`/`extras` 정의(5행)의 이동을 고려하면 순증은 20행(+25, -5)입니다. 브리프의 5–15행 기대치 대비 5행이 많은 이유는 멀티라인 포맷팅(5개 조건식 7행 분할, `STABLE_SHAPES.set` 객체 리터럴 6행 분할)에 기인하며, 실질적인 논리 문장(statement)은 단 7개로 불필요한 로직이나 별칭 없이 최소 범위를 유지했습니다.

### 2. 정확성 및 일반 경로와의 동치성 (Correctness & Equivalence)
- **분기 조건**: `previous === undefined && children.length === 0 && preferred.length === 0 && entries.length === 0 && extras` (비null, 비배열 객체)로 정확히 제한되었습니다.
- **키 순서 및 결과 쓰기**: `names`는 `Object.keys(extras)`로 직접 수집되며, 키 순서대로 `writeObjectKey(result, name, Reflect.get(extras, name))`를 호출하여 결과를 작성합니다.
- **형상 기록 및 키 수 등록**: `STABLE_SHAPES.set(node, { children, schema: node.schema, undeclaredValues: node.undeclaredValues, names })` 및 `objectKeyCounts.set(result, names.length)` 호출은 일반 경로(기존 247–252행)와 정확히 일치합니다.
- **생략된 연산**:
  - 빈 `childValues` Map 및 `seen` Set 인스턴스 할당 생략.
  - 빈 Map에 대한 키별 `childValues.has(name)` 검사 2회 생략.
  - 중복이 없는 `Object.keys`에 대한 불필요한 `seen.has`/`seen.add` 연산 생략.
  - 중간 `names` 수집 루프와 결과 작성 루프의 2-pass 순회를 1-pass로 단축.
- **관측 보존**: `writeObjectKey` 보조 함수를 동일하게 사용하므로 own data `__proto__` 및 own `undefined` 값이 유지되며, 매 호출마다 새로운 객체 참조(identity)를 반환합니다.

### 3. 시험 및 베이스라인 픽스처 충실도 (Tests & Fixture Fidelity)
- **차등 시험 범위**: `assembleObject.extras-first.test.ts`는 브리프 3단계의 5가지 케이스를 모두 철저히 검증합니다:
  - (a) 3개 및 1000개 키(정수형 키, own `__proto__`, own `undefined` 포함)에서 고정 oracle과의 결과 동치성 검증 (58–75행).
  - (b) `propertyOrder` 존재 시 기존 일반 경로 진입 및 Map/Set 1회 할당 검증 (77–91행, 129–171행).
  - (c) 비활성 선언 항목(`childEntries`) 존재 시 기존 일반 경로 진입 및 Map/Set 1회 할당 검증 (77–91행, 129–171행).
  - (d) `extras` undefined 시 기존 aligned fast path 진입 및 Map/Set 0회 할당 검증 (77–91행, 129–171행).
  - (e) (a) 이후 동일 extras 참조 및 1개 키 추가 시의 stable-shape 재사용과 점진적 힌트 검증 (93–127행).
- **베이스라인 픽스처 충실도**: `fixtures/assembleObject.baseline.ts`와 base(`90a923d0a`) 원본의 diff를 수행한 결과, 최상단 주석 1행 추가, 디렉토리 깊이에 따른 상대 import 경로 수정 4행, export 이름 변경 1행(`assembleObjectBaseline`) 외에 함수 내부의 모든 로직과 제어 흐름은 바이트 단위로 100% 동일함이 확인되었습니다.
- **기존 기대값 변경**: 기존 테스트의 기대값 변경은 0건입니다.
- **자체 시험 재실행**: `yarn workspace @canard/schema-form test --run --reporter=dot` 실행 결과, 762개 테스트 파일 전수 통과(762 passed), 4,820개 테스트 통과, 1 todo, 0 실패로 성공했습니다 (종료 코드 0).

### 4. 네 게이트 재실행 (Four Gates Verification)
- **기록 확인**: `<ns>/gates/` 내의 `typecheck.receipt.json`, `lint.receipt.json`, `test.receipt.json`, `build.receipt.json` 모두 종료 코드 0으로 기록되었습니다.
- **독립 재실행 결과**:
  - `yarn workspace @canard/schema-form typecheck`: 통과 (종료 코드 0)
  - `yarn workspace @canard/schema-form lint`: 통과 (종료 코드 0)
  - `yarn workspace @canard/schema-form test --run --reporter=dot`: 통과 (종료 코드 0)
  - `yarn workspace @canard/schema-form build`: 통과 (종료 코드 0)

### 5. 관측 동치성 (Observation Equivalence)
- **도구 무수정 실행**: 원본 관측 도구(`prepare.mjs`, `cases.mjs`, `compare.mjs`, `readiness.mjs`)를 수정 없이 그대로 실행했습니다.
- **동치성 결과**: Node v26.12.0 및 Bun 1.4.3 환경에서 각각 58개 기본 사례 × 3개 레인 = 174개 이력 / 174개 비교 전수에서 **차이 0건(0 differences)**을 기록했습니다 (`gate-node.json`, `gate-bun.json`, `command-compare-node.json`, `command-compare-bun.json`).
- **네거티브 대조군**: 캐시 오염 대조군, SHA 불일치 대조군, Node/Bun 각 4개 잘못된 모듈(SB1~SB4) 대조군 등 총 10건의 음성 대조군이 모두 예상된 종료 코드 1로 실패함을 확인했습니다.
- **마커 확인**: 최종 산출물에서 `OBSERVATION_IDENTITY_READY` 마커가 정상 확인되었습니다.

### 6. 보정 측정 재계산 (Measurement Recomputation)
- **창 조건**: UTC 2026-10-20T05:14:37.476Z–2026-10-20T05:18:10.652Z 동안 장면·dist·바퀴마다 격리된 192개 프로세스, 19,200개 시간 표본으로 계측되었습니다.
- **원시 JSON 재계산**: `runner/raw/*.json` 및 `window.json`으로부터 지정된 6개 행을 직접 재계산한 결과:
  1. `node object-B0-mount-N1000` (1바퀴): min A=0.653292ms, A′=0.621416ms, B=0.752084ms | Δ(A′/A)=-4.88%, Δ(B/A)=+15.12%, Δ(B/A′)=+21.03%, 보정 폭=+20.72% -> `동치 범위 안`
  2. `node object-B0-mount-N1000` (2바퀴): min A=0.675375ms, A′=0.815292ms, B=0.643750ms | Δ(A′/A)=+20.72%, Δ(B/A)=-4.68%, Δ(B/A′)=-21.04%, 보정 폭=+20.72% -> `동치 범위 안`
  3. `node array-B0-mount-N8000` (1바퀴): min A=1.691375ms, A′=1.722500ms, B=1.739250ms | Δ(A′/A)=+1.84%, Δ(B/A)=+2.83%, Δ(B/A′)=+0.97%, 보정 폭=+1.84% -> `입증(느림)`
  4. `node array-B0-mount-N8000` (2바퀴): min A=1.666041ms, A′=1.669292ms, B=1.723208ms | Δ(A′/A)=+0.20%, Δ(B/A)=+3.43%, Δ(B/A′)=+3.23%, 보정 폭=+1.84% -> `입증(느림)`
  5. `bun array-T0-mount-N8000` (1바퀴): min A=0.073583ms, A′=0.072583ms, B=0.069208ms | Δ(A′/A)=-1.36%, Δ(B/A)=-5.95%, Δ(B/A′)=-4.65%, 보정 폭=+1.36% -> `입증(빠름)`
  6. `bun array-T0-mount-N8000` (2바퀴): min A=0.071709ms, A′=0.071166ms, B=0.068500ms | Δ(A′/A)=-0.76%, Δ(B/A)=-4.48%, Δ(B/A′)=-3.75%, 보정 폭=+1.36% -> `입증(빠름)`
- **판정 분포 일치**: 전체 32개 조합의 판정(동치 범위 안 25개, 미입증 4개, 입증(느림) 1개, 입증(빠름) 2개)은 `rows.md` 및 `assemble-first-results.md`와 정확히 일치합니다.

### 7. 작업 위생 (Hygiene)
- **작업 트리 상태**: `git status --porcelain` 실행 결과 출력이 전혀 없는 깨끗한(clean) 상태입니다.
- **봉인(seal) 무작위 대조**: `seal.json`에 기록된 8개 파일(`commit-code.txt`, `commit-detail.txt`, `derived.json`, `environment.json`, `gates/typecheck.receipt.json`, `gates/lint.receipt.json`, `pr-body.md`, `window.json`)의 `shasum -a 256` 해시 및 파일 크기를 직접 대조한 결과 8개 파일 모두 100% 일치했습니다.
- **메인 디렉토리 복사본 일치**: `diff -rq /Users/Vincent/Workspace/albatrion/schema-form-assemble-first/.seiri/tasks/assemble-first-432 /Users/Vincent/Workspace/albatrion/.seiri/tasks/assemble-first-432` 실행 결과 출력이 없으며 종료 코드 0으로 일치함이 확인되었습니다.
- **커밋 저자 및 표기**: 4개 커밋 모두 `Vincent Kelvin <vincent-kk@users.noreply.github.com>`으로 작성되었으며, 커밋 메시지 및 PR 본문에 세션 식별자, 작업 ID, co-author 표기가 일절 포함되지 않았습니다 (`gh pr view 426 --json body,commits`).

### 8. 보고된 FCA 이슈 및 런타임 순증 분석
- **런타임 순증 20행**: `<ns>/report.md` 라인 20에 기록된 20행 순증(+25, -5)은 포맷팅 규칙에 따른 개행으로, 논리적 문장은 7개에 불과하며 새 캐시나 별칭을 도입하지 않았으므로 PR의 블로커가 아닙니다.
- **FCA 감사 결과**: `<ns>/report.md` 라인 49에 기록된 패키지 루트 FCA 감사의 FAIL은 base(`90a923d0a`)에 이미 존재하던 `FieldProxy <-> FieldInputSlot` 순환 및 `getAbsolutePointer` 58사례(상한 32개 초과) 이슈입니다. 이번 PR의 변경 모듈(`objectBehavior`) 내부의 finding은 0개이며, 신규 차등 시험도 11사례로 규정을 준수하므로 PR의 블로커가 아닙니다.

---

## 2. 세부 발견 사항 (Numbered Findings)

### Finding 1 (Severity: Informational)
- **제목**: 런타임 신규 분기 순증 행 수(20행) 분석 및 범위 적합성
- **내용**: 브리프에서 제시된 예상 순증 행 수(5–15행) 대비 5행이 많은 20행 순증(+25, -5)이 발생했습니다. 이는 5개 분기 조건문이 Prettier 멀티라인 스타일에 의해 7행으로 분할되고, `STABLE_SHAPES.set` 객체 리터럴이 6행으로 분할된 포맷팅 결과입니다. 논리적 문장은 7개로 제한되어 불필요한 복잡성이나 범위 확대가 없음을 확인했습니다.
- **조치 규격 (Fix Spec)**: 인위적인 한 줄 작성은 가독성과 팀 포맷팅 규칙을 저해하므로 현재 코드를 그대로 유지합니다. (수정 불필요)

### Finding 2 (Severity: Informational)
- **제목**: 기저(base) FCA 감사 진단 결과의 격리성 확인
- **내용**: 패키지 루트 FCA 검사에서 보고된 FAIL(FieldProxy 순환 및 getAbsolutePointer 58사례 상한 초과)은 이전부터 존재하던 기저 결함입니다. 이번 가설 F의 변경 범위인 `objectBehavior` 및 신규 차등 시험은 FCA 규칙을 완전히 준수하고 있으며 finding이 0개입니다.
- **조치 규격 (Fix Spec)**: 본 PR의 변경 사항과 완전히 격리된 기저 이슈이므로 본 PR의 수용에 영향을 주지 않으며, 추후 별도의 독립 아키텍처 과제로 처리합니다. (수정 불필요)

---

## 3. 측정 판정 (Measurement Verdict)

1. **타깃 행(object-B0 N100 / N1000) 판정**:
   - `node object-B0-mount-N100`: 1바퀴 Δ(B/A)=-2.55%, 2바퀴 Δ(B/A)=-10.01%, 보정 폭=+8.91% -> `미입증` (한 바퀴만 폭 초과)
   - `node object-B0-mount-N1000`: 1바퀴 Δ(B/A)=+15.12%, 2바퀴 Δ(B/A)=-4.68%, 보정 폭=+20.72% -> `동치 범위 안` (부호 반전 및 두 바퀴 모두 폭 이내)
   - `bun object-B0-mount-N100`: 1바퀴 Δ(B/A)=+17.43%, 2바퀴 Δ(B/A)=-11.82%, 보정 폭=+16.60% -> `동치 범위 안` (부호 반전)
   - `bun object-B0-mount-N1000`: 1바퀴 Δ(B/A)=-31.42%, 2바퀴 Δ(B/A)=-11.87%, 보정 폭=+20.12% -> `미입증` (한 바퀴만 폭 초과)
   - **종합**: 대상 4개 행 모두 `동치 범위 안`(2개) 또는 `미입증`(2개)으로 나타나며, 단일 프로세스 계측에서 관측되었던 마운트 지연 시간 개선은 다중 프로세스 보정 창에서 유의미한 시간 단축으로 확정되지 않았습니다. 또한 시간 저하 역시 입증되지 않았습니다.

2. **입증 표시 3개 행에 대한 해석 유보**:
   - `node array-B0-mount-N8000`: `입증(느림)` (두 바퀴 모두 +2.83%, +3.43%로 폭 +1.84% 초과)
   - `bun array-T0-mount-N8000`: `입증(빠름)` (두 바퀴 모두 -5.95%, -4.48%로 폭 +1.36% 초과)
   - `bun array-B0-mount-N8000`: `입증(빠름)` (두 바퀴 모두 -2.86%, -6.46%로 폭 +0.57% 초과)
   - 브리프 18행 및 431C-02 규정에 따라, 상기 3개 행을 '잡음'으로 예단하거나 코드 변경의 직접 효과로 귀속하지 않으며, 코디네이터가 수행하는 별도의 실행 경로 및 호출 수 인과 분석에 위임합니다.

---

## 4. 병합 조건 (Merge Conditions)

Draft PR [#426](https://github.com/vincent-kk/albatrion/pull/426)은 모든 정적 게이트, 관측 동치성, TDD 차등 테스트, 작업 위생 요건을 완벽히 충족합니다. 다만 본 PR의 최종 병합 결정(`gh pr ready`, merge)은 소유자(Vincent Kelvin)의 고유 권한이며, 다음 조건을 전제로 병합 진행을 권고합니다:

1. **인과 분석 확인**: 코디네이터가 별도로 수행하는 `array-B0 N8000`(Node 입증-느림, Bun 입증-빠름) 및 `array-T0 N8000`(Bun 입증-빠름)의 3개 입증 행에 대한 호출 수 및 실행 경로 인과 분석에서 회귀나 부작용이 없음을 확인할 것.
2. **소유자 단독 병합**: 독립 검토자는 PR의 `ready` 전환, 승인(`gh pr review --approve`), 커밋, 푸시를 일절 수행하지 않으며, 소유자인 Vincent Kelvin이 검토 보고서를 확인한 후 직접 병합을 진행할 것.
