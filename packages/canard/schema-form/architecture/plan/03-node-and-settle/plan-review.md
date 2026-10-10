# 03 실행 계획 리뷰 기록

## 1차 — 2026-09-29, verifier(Claude, 독립), 기준 `1bd021cb1`

판정: **rework-required**. 근거는 HEAD의 원장이다. 작업 트리의 26라운드(26C-01~05, 미커밋)는 확인 근거로만 썼다.

### 높음

- **H1 — I1/D2 "약 53 멤버 전부 + 뒤 PR 기제는 런타임 칸 스텁"은 원장과 모순이다.**
  - 자리: `execution-plan.md` I1·§7·U2 멤버 목록·U7, `execution-adr.md` D2, §3.1 record의 "검증기·대기열 칸".
  - 근거:
    - TEST-069 (나): "그 밖의 대역은 두지 않는다", "시험만을 위한 주입 자리(파생 단계, 디스패처)를 새로 만들지 않는다".
    - TEST-069가 인용하는 `reviews/raw-round17-node-structure.md:74`의 PR-2 겉면은 식별·값 게터, `active`, `find`·`findNodes`, 가드, 생성, settle로 가는 `setValue`뿐이다. 계산 게터는 PR-6이다.
    - EVENT-073: 멤버는 그 기제의 PR에서 더하고, 그때 멤버 목록 시험을 고친다.
    - LANDING-066의 PR-6 내용에 "겉면의 계산 게터"가 있다.
    - 26C-01(작업 트리)이 이 방식을 명시적으로 기각한다.
- **H2 — I5/D3/§6.2와 §1 비목표 "`controls.active` 식은 04"는 원장과 모순이다.**
  - 근거:
    - TEST-069 (가): "PR-2는 식·가드 실패의 자리별 값과 `cause: 'expression'`을 시험하며, 식은 PR-1의 실제 컴파일러를 쓴다".
    - TEST-069 (나): 대역은 "`compileGuard`가 돌려주는 술어와 같은 모양", 곧 `if` 전용이다.
    - LANDING-062: "`active` 게터(노드 게이트)", "표시·계산(호스트 바퀴, 노드 게이트, 투영)".
    - 25C-06: 판별 게이트는 "다른 `controls.active` 게이트와 같이 호스트 바퀴에서 평가 … 평가는 PR 03".
    - SETTLE-045 (a)(b)는 PR-2 게이트다.
    - LANDING-063·066 어디에도 `controls.active`가 없다.
    - 26C-04가 확인한다.
  - `request.md:8`, `adr-and-axes.md:51`의 "게이트는 스텁"은 원장과 어긋나므로 log §4에 적는다.

### 중간

- **M1 — U1의 import 수선 목록이 불완전하다.** 빠진 것:
  - (a) 옮기는 파일의 상대 import가 옮기지 않는 쪽을 가리키는 곳: `src/core/types` 쪽 37곳(예: `src/core/nodes/ObjectNode/ObjectNode.ts:13` `'../../types'`), `src/core/nodeFromJSONSchema` 쪽 8곳(예: `src/core/__tests__/AbstractNode.pristine.test.ts:5`), `src/types` 쪽 1곳.
  - (b) nodes 안에서 `@/schema-form/core/nodes/...` 별칭을 쓰는 9파일(예: `ObjectNode/strategies/BranchStrategy/BranchStrategy.ts:13`).
  - (c) `src` 밖의 `stories/07.FormRefHandle.stories.tsx:6`, `stories/37.Pristine.stories.tsx:3`, `stories/38.StateManagement.stories.tsx:3`, `bench/compute-recalculate.bench.ts:3`. tsconfig가 `stories`·`bench`를 포함한다.
- **M2 — TEST-069 (가)의 PR-2 의무가 §5와 게이트에서 빠졌다.**
  - 빠진 것:
    - `cause:'expression'`: 실제 컴파일러로 식 실패, 던지는 대역으로 가드 실패.
    - `active` 게터.
    - "노드 구조 시험 전부"(`09-landing…:169`): 공개 index 키 목록에 내부 통로 없음, 행 고르기 함수의 조합 전수, 공개 형 키 목록 형 시험, `isTerminalNode`가 터미널 객체도 좁힘.
    - 나감 비움의 Form 속성 층.
    - `SetValueOption` 넷과 로드의 새 수명.
    - 18C-39의 직렬화 단언.
  - 반대 방향: U6의 "나감 비움: 네 층"은 범위를 넘는다. `children` 항목 층과 조각 `controls` 층은 PR-6(→ 04)이다(LANDING-066 충돌 줄, TEST-069 (다)).
- **M3 — I6(청사진의 L)에 담당 단위·시험·게이트가 없다.**
  - 26C-04는 `src/core/blueprint/__tests__/`에 L의 세 규칙 사례를 요구한다: `#`·`(/)`는 루트, `/p`·`#/p`는 p의 자리, `@`는 세지 않음.
  - G4는 blueprint와 종류 fractal 일곱을 보지 않는다.
- **M4 — U9는 실행할 수 없다.**
  - `@aileron/benchmark-form`은 공개 `<Form>`만 잰다(`benchmark-form/src/index.ts:5`).
  - bun 명령이 없다.
  - LANDING-159는 "옛 엔진의 마지막 벤치 기준선(`bench:baseline`)은 PR-2가 `core/nodes`를 옮기기 전에 잰다"고 정한다. 그런데 02의 기준선(`55ed75504`)은 옛 엔진을 바꾼 `3d94a046f`·`85e7d01af`보다 앞선다.
- **M5 — U3 ∥ U4는 의존이 있다.** 행 계약 `Behavior`가 `record/`에 있다(NODE-016).
- **M6 — 게이트와 추적표가 맞지 않는다.**
  - G10이 `settle/__tests__`에서 WRITE-098·099를 찾는데, §5는 그 자리를 시나리오로 둔다.
  - G8에 WRITE-099(E26)가 없다.
  - G11은 `consistent-type-assertions`를 찾지만 U7이 그 규칙을 지정하지 않았다.
  - 루트 `eslint.config.mjs:77`이 `no-explicit-any: off`인데 `any` 금지를 재는 게이트가 없다.
  - §6.1의 수와 G3을 재는 CHECK가 없고, U9에는 실행 가능한 게이트가 0개다.
- **M7 — §6.1의 배분 오류.**
  - `rootOutput.test.mjs`의 :13·:24·:30은 배열 루트·아이템이라 → 06이다. :40의 `onChange`는 → 05이거나 방출만 본다.
  - `r9b.mjs`의 13 프로브 52검사를 열거하지 않았다.
- **M8 — 원장 세션과 같은 체크아웃이다.** 원장 12파일·`PLAN.md`·`HANDOFF.md`가 미커밋이다. 커밋은 경로를 지정한 `git add`만 쓴다.

### 낮음

- **L1.** I2는 이미 닫혔다. TEST-069 "PR-2에서 사슬은 `settle` 호출 하나다"와 LANDING-064를 인용한다.
- **L2.** `log.md`의 표가 빈 줄로 끊긴다.
- **L3.** G4는 고정 커밋 `85e7d01af..HEAD`를 쓰고 INTENT.md도 본다.
- **L4.** §6.2의 대역이 `settle/__tests__/utils`에 있으면 `core/__tests__/regression`·`scenarios`가 다른 fractal 내부로 손을 뻗는다. 자리를 다시 정하고 G2의 허용 목록과 맞춘다.
- **L5.** SCN `src/__tests__/emptyFamilies.test.ts`는 부류가 비었다고 단언하므로 U8에서 붉어진다. 처분과 새 부류 디렉토리·`index.ts` 수출을 적는다.
- **L6.** `no-restricted-imports`를 새 fractal에 거는 일을 U3으로 당긴다.
- **L7.** U1이 U2보다 먼저 core 구조를 바꾸는데 `src/core/DETAIL.md:10`이 `parsers/`를 적는다. 문서를 먼저 고친다.
- **L8.** 25C-11의 "노드·배열 아이템 참조 동일성"을 06으로 미루는 것을 log §4에 적는다.
- **L9.** PLAN §2의 7단계(codex·antigravity 원장 대 구현 대조)와 8단계(PR 본문 체크리스트)를 U10에 적는다.

### 고침 명세

1. I1·D2·§7·U2·U7을 26C-01 방식으로 고친다.
   - PR-2 겉면은 raw-round17:74의 목록에 LANDING-062·WRITE-085가 든 것(`diagnostics`, `SetValueOption`, `defaultValue`, `resetSubtree` 등)을 더한 것이다.
   - 멤버 목록 시험은 그 목록을 단언한다.
   - `SchemaNodeRuntime`은 `if` 술어·진단·예산·`nodeFactory`만 든다.
2. I5·D3·§1·§6.2를 고친다.
   - 판별 게이트와 `controls.active`(노드·조각)는 제품 경로에서 `BlueprintExpression.evaluate`로 호스트 바퀴에서 평가한다.
   - `if`만 `record/` 술어 뒤에 둔다. 대역은 `if` 하나이고 던지는 변형을 함께 둔다.
   - §5와 G8에 `cause:'expression'` 두 행을 더한다.
   - log §4에 `request.md:8`·`adr-and-axes.md:51`을 적는다.
3. U1 목록을 M1의 (a)–(c)로 채운다. 이동 뒤 typecheck 0 오류를 게이트로 둔다.
4. §5에 M2의 행을 더하고 G10에 ID를 더한다. U6의 나감 비움은 "노드 자신 층과 Form 속성 층, 하위 트리 규칙. `children` 항목 층과 조각 `controls` 층은 04"로 고친다.
5. 청사진의 L을 맡는 단위를 둔다. `BlueprintGate`에 평가 자리 칸과 계산을 더하고, `blueprint/__tests__`에 세 규칙 사례를 둔다. G4의 목록에 blueprint와 종류 fractal 일곱을 더한다.
6. U9를 고친다.
   - 새 엔진 행은 `PKG/bench`의 독립 스크립트로 `node`와 `bun` 둘 다에서 잰다.
   - `guard:check`의 선은 `benchmark-form/results/baseline.json`의 임계로 대조한다.
   - U1 이동 전에 `bench:baseline`을 단독 호출로 돌리거나, 돌리지 않는다면 log §4에 적는다.
   - 실행 가능한 CHECK를 둔다.
7. §4의 병렬은 "U3의 `record/` 형 커밋 뒤 U4"로 고친다.
8. 게이트를 고친다.
   - WRITE-098·099는 시나리오 게이트로 옮기고, G8에 WRITE-099를 더한다.
   - 새 fractal의 비시험 파일에 `@typescript-eslint/consistent-type-assertions: ['error', { assertionStyle: 'never' }]`와 `@typescript-eslint/no-explicit-any: 'error'`를 건다. G11이 둘을 확인한다.
   - 이식 수를 `grep -c`로 잰다. G4의 기준은 `85e7d01af..HEAD`다.
9. §6.1을 고친다. rootOutput은 M7대로 가르고, r9b의 13 프로브를 PR별로 열거한다.
10. 26라운드 커밋 위로 계획을 맞추고 재리뷰한다.
11. L1–L9를 반영한다.

### 확인하지 못한 것

- `r9.mjs` P군별 세부 수(10/18/64/16)와 E4·E6의 05 배정은 원천을 전부 읽지 않았다.
- vitest·tsc·eslint는 돌리지 않았다(읽기 전용).
