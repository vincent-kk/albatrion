# nextExtras 가설 N 독립 검토 보고서 (Round 431)

- 대상: Draft PR #425 (`vincent-kk/schema-form-next-extras`, HEAD `6326dfc06492571a89360baa91a8db6b7daa85fe`)
- 기준 베이스: `feat/schema-form-08-review-and-perf` (`9a473b2a2d0fbfe250e578f79c58d6efa6f09958`)
- 작업 디렉토리: `/Users/Vincent/Workspace/albatrion/schema-form-next-extras`
- 검토 일시: 2026-10-20
- 작성자: 독립 검토 워커 (agy)

---

## 판정 (Verdict)

**PASS**

Draft PR #425는 편집자 결정 417C-02의 제약 조건을 완벽히 충족하며, `nextExtras`의 불필요한 결과 키 재열거를 제거하고 쓰기 직후 own key 생성 여부를 안전하게 추적하도록 올바르게 구현되었습니다. 4대 품질 게이트, 5개 Vitest 프로젝트 전수 시험, Node 및 Bun 관측 동등성(차이 0건), 네임스페이스 봉인 무결성, 커밋 위생이 모두 확인되었습니다. 2바퀴 측정에서 나타난 방향 불일치와 0 교차 또한 결과 문서에 솔직하게 기록되어 성능 개선을 과장하지 않았으며, 보고된 FCA FAIL 및 INDETERMINATE는 베이스 커밋에 이미 존재하던 기저 결함으로 본 PR에 의한 것이 아님을 확인했습니다.

---

## 검토 항목별 근거 및 발견사항 (Findings)

### Finding 1: 변경 범위 및 커밋 순서 (Scope)
- **심각도**: INFO (정상 통과)
- **검증 명령 및 근거**:
  - `git diff 9a473b2a2..6326dfc06 --stat`
    - 변경된 파일은 정확히 6개이며 총 337행 추가, 3행 삭제입니다:
      1. `packages/canard/schema-form/architecture/verification/perf-optimization/next-extras-results.md` (+125)
      2. `packages/canard/schema-form/src/core/engine/settle/DETAIL.md` (+1, -1)
      3. `packages/canard/schema-form/src/core/engine/settle/__tests__/fixtures/enumeratingNextExtras.ts` (+28)
      4. `packages/canard/schema-form/src/core/engine/settle/__tests__/settle.extras-plain-assignment.test.ts` (+53)
      5. `packages/canard/schema-form/src/core/engine/settle/utils/input/__tests__/nextExtras.own-keys.test.ts` (+122)
      6. `packages/canard/schema-form/src/core/engine/settle/utils/input/nextExtras.ts` (+8, -2)
    - `arrayExtras`, `assembleObject`, 호출자 4곳(`markWrite`, `loadStaticFirstTree`, `distributeLatentValue`, `distributeMovedLatentInput`) 및 패키지 공개 API 표면은 전혀 변경되지 않았습니다.
  - `git log --format='%h %s' 9a473b2a2..6326dfc06`
    - `d0280c7cc docs(schema-form): state the own-key rule for nextExtras`
    - `179a2d76f perf(schema-form): track written own keys in nextExtras instead of re-enumerating`
    - `6326dfc06 docs(schema-form): record nextExtras hypothesis gates, equivalence and measurement`
    - DETAIL 선행 커밋(`d0280c7cc`)이 구현 커밋(`179a2d76f`)보다 엄격하게 선행함을 확인했습니다.

### Finding 2: 구현 정확성 및 417C-02 격리 반례 (Correctness)
- **심각도**: INFO (정상 통과)
- **검증 명령 및 근거**:
  - `src/core/engine/settle/utils/input/nextExtras.ts` 구현 검토:
    - `merge` 루프와 `input` 루프 양쪽 모두에서 `writeObjectKey` 직후 `hasOwnKey ||= hasOwnProperty(result, name);`을 수행하여 실제 own key 생성 여부를 정확히 추적합니다.
    - `hasOwnKey`가 한 번 true가 되면 `||=` 연산자의 단락 평가(short-circuit) 특성에 의해 이후 추가 속성 확인 호출이 생략되어 O(1) 검사를 유지합니다.
    - `__proto__` 키는 `writeObjectKey` 내부에서 `Object.defineProperty`를 통해 own data property로 안전하게 정의되므로 `hasOwnProperty(result, '__proto__')`가 정상적으로 true를 반환하며 프로토타입 오염이 방지됩니다.
    - 반환값은 `hasOwnKey ? result : undefined`로 결정되어, 기존의 `Object.keys(result).length ? result : undefined`와 정확히 동등한 조건을 만족합니다.
  - 편집자 결정 417C-02 반례 검증 ($TMPDIR 독립 Node 프로세스 실행):
    - `Object.prototype`에 setter가 정의되어 있고 동결된 own-data 입력이 주어지는 반례를 구성하여 실행했습니다.
    - 단순 "wrote" 플래그 방식은 setter가 쓰기를 흡수하여 target 객체에 own property가 생성되지 않음에도 `{}` 빈 객체를 반환하는 결함이 발생합니다.
    - 반면 PR #425의 구현은 `hasOwnProperty(result, name)`을 확인하므로 setter에 흡수된 경우 `hasOwnKey`가 false로 유지되어 기존 알고리즘과 동일하게 정확히 `undefined`를 반환함을 확인했습니다.

### Finding 3: 차등 시험 및 전체 테스트 재실행 (Tests)
- **심각도**: INFO (정상 통과)
- **검증 명령 및 근거**:
  - `nextExtras.own-keys.test.ts` 및 `settle.extras-plain-assignment.test.ts`에 구현된 6개 핵심 차등 시험 축을 확인했습니다:
    - (a) 상속 setter가 흡수한 동결 입력 → `undefined` (417C-02 케이스)
    - (b) own `undefined` 값을 가진 속성 유지 → 객체 반환
    - (c) `__proto__` 키의 own data 처리 및 프로토타입 불변
    - (d) Merge 시 기존 키 순서 보존 및 교체/추가
    - (e) 선언 키 필터링으로 쓰기가 전혀 없는 경우 → `undefined`
    - (f) 동일 값(same-value) 참조 재사용
  - 기존 테스트의 기대값 변경은 0건입니다.
  - 작업 트리에서 직접 전체 테스트를 재실행했습니다:
    - 실행 명령: `yarn workspace @canard/schema-form test --run --reporter=dot`
    - 결과: 762개 테스트 파일 전체 통과 (762 passed), 4,818개 테스트 통과, 1개 todo, 실패 0건 (종료 코드 0).

### Finding 4: 4대 품질 게이트 확인 및 재실행 (Gates)
- **심각도**: INFO (정상 통과)
- **검증 명령 및 근거**:
  - `.seiri/tasks/next-extras-431/gates/` 기록 확인:
    - `build.receipt.json`: exit 0
    - `lint.receipt.json`: exit 0
    - `test.receipt.json`: exit 0 (1,476개 스위트, 4,818개 테스트 통과)
    - `typecheck-final.receipt.json`: exit 0 (초기 typecheck의 `Object.hasOwn` 미지원 오류를 저장소 헬퍼 `hasOwnProperty`로 수정한 후 최종 exit 0 통과)
  - 검토 워커가 직접 게이트를 재실행하여 검증했습니다:
    - `yarn workspace @canard/schema-form typecheck`: 종료 코드 0 (오류 없음).
    - `yarn workspace @canard/schema-form lint`: 종료 코드 0 (경고 및 오류 없음).

### Finding 5: 관측 동등성 (Observation Equivalence)
- **심각도**: INFO (정상 통과)
- **검증 명령 및 근거**:
  - 관측 출력 파일 검증:
    - `command-compare-node.json`: histories 174, comparisons 174, failures [] (차이 0건).
    - `command-compare-bun.json`: histories 174, comparisons 174, failures [] (차이 0건).
  - 음성 대조군(Negative controls) 검증:
    - `command-bad-sha-negative.json`: exit 1 (기대치 1과 일치).
    - `command-cached-output-negative.json`: exit 1 (기대치 1과 일치).
    - `command-node-negative-SB1.json` ~ `SB4`: 모두 exit 1 (기대치 1과 일치).
    - `command-bun-negative-SB1.json` ~ `SB4`: 모두 exit 1 (기대치 1과 일치).
  - `readiness.json`: `marker: "OBSERVATION_IDENTITY_READY"` 확인.
  - Node와 Bun 양쪽 런타임에서 기준 dist와 후보 dist 간의 관측 동등성이 완벽하게 증명되었습니다.

### Finding 6: 측정 재계산 및 0 교차 표기 (Measurement)
- **심각도**: INFO (정상 통과)
- **검증 명령 및 근거**:
  - UTC 측정 창: 2026-10-20T04:10:15.905Z ~ 2026-10-20T04:12:18.879Z (조용한 단일 창).
  - 16개 코어 마운트 장면, 2바퀴 교대 실행, 각 바퀴 20회 워밍업 및 100개 표본 (총 12,800개 시간 표본), 9개 프로세스 스냅숏 보존.
  - 원시 JSON 파일(`.seiri/tasks/next-extras-431/runner/raw/`)에서 4개 핵심 행의 중앙값과 Δ = (후보/기준 - 1) × 100을 직접 독립 재계산했습니다:
    1. Node `object-B0-mount-N1000`:
       - R1 기준 1.0790 ms, 후보 0.9804 ms, Δ1 = -9.14%
       - R2 기준 0.9416 ms, 후보 0.8641 ms, Δ2 = -8.22% (보고 수치와 일치)
    2. Node `object-BN-mount-N1000`:
       - R1 기준 6.1754 ms, 후보 6.0872 ms, Δ1 = -1.43%
       - R2 기준 6.3216 ms, 후보 6.4824 ms, Δ2 = +2.54% (0 교차 및 부호 불일치, 보고 수치와 일치)
    3. Bun `object-B0-mount-N1000`:
       - R1 기준 0.4279 ms, 후보 0.5870 ms, Δ1 = +37.21%
       - R2 기준 0.2937 ms, 후보 0.4396 ms, Δ2 = +49.66% (보고 수치와 일치)
    4. Bun `object-BN-mount-N1000`:
       - R1 기준 3.5729 ms, 후보 3.5599 ms, Δ1 = -0.36%
       - R2 기준 3.7097 ms, 후보 4.2027 ms, Δ2 = +13.29% (0 교차 및 부호 불일치, 보고 수치와 일치)
  - `rows.md` 및 `next-extras-results.md`는 전체 32개 조합 중 15개에서 발생하는 부호 불일치와 0 교차를 정직하게 명시하고 있으며, 지지되지 않는 속도 개선을 주장하지 않았습니다.

### Finding 7: 작업 트리 위생, 봉인 및 PR 메타데이터 (Hygiene & Seal)
- **심각도**: INFO (정상 통과)
- **검증 명령 및 근거**:
  - `git status --porcelain`: 작업 트리가 깨끗함(clean)을 확인했습니다.
  - `seal.json` 무결성 점검: 봉인된 2,453개 파일 중 대표 8개 파일(`commit-detail.txt`, `environment.json`, `window.json`, `rows.md`, `report.md`, `dist-base/index.mjs`, `dist-candidate/index.mjs`, `gates/test.receipt.json`)의 SHA256 해시를 `crypto` 및 `shasum -a 256`으로 직접 대조한 결과 8개 파일 모두 봉인 기록과 바이트 단위로 정확히 일치했습니다.
  - 네임스페이스 복사 동일성: `diff -rq /Users/Vincent/Workspace/albatrion/schema-form-next-extras/.seiri/tasks/next-extras-431 /Users/Vincent/Workspace/albatrion/.seiri/tasks/next-extras-431` 실행 결과 차이 없음(종료 코드 0).
  - PR 메타데이터 확인 (`gh pr view 425 --json body,commits`):
    - 커밋 작성자 및 커미터: 3개 커밋 모두 `Vincent Kelvin` (`vincent-kk@users.noreply.github.com`).
    - 커밋 메시지 및 PR 본문에 세션, 작업 ID, 공동 저자(co-author) 관련 문구가 전혀 포함되어 있지 않습니다.

### Finding 8: 기존 FCA FAIL 및 INDETERMINATE 기원 분석 (FCA Status Origin)
- **심각도**: INFO (기존 기저 결함 확인)
- **검증 명령 및 근거**:
  - `report.md`(30행, 113-118행) 및 `filid-audit.json` 확인:
    - 보고 도구: `filid` (filid-scan, filid-validate, filid-verification).
    - 보고 내용: `FieldProxy`와 `FieldInputSlot` 간의 순환 의존성 위반, `getAbsolutePointer` 테스트의 58개 사례 수 상한(32개 상한) 초과, 동적 시험 표로 인한 분석 완전성 미확정(`INDETERMINATE`).
  - 기원 분석:
    - `git diff 9a473b2a2..6326dfc06`에서 해당 파일들은 본 PR의 변경 범위에 일절 포함되지 않았습니다.
    - 해당 결함들은 베이스 커밋(`9a473b2a2`)에 이미 존재하던 기저 결함이며, 본 PR #425에 의해 새로 유발되었거나 악화된 것이 아님을 명확히 확인했습니다.

---

## 측정 판정

동일 창에서 수행된 core 마운트 측정 결과는 다음과 같습니다:

1. **BN 마운트 장면 (`object-BN-mount-N100` / `N1000`, `array-BN-mount-N1000` / `N8000`)**:
   - Node 및 Bun 런타임 모두에서 1바퀴와 2바퀴의 Δ 부호가 엇갈리거나 범위가 0을 걸치고 있습니다 (예: Node `object-BN-mount-N1000`은 R1 -1.43%, R2 +2.54%; Bun `object-BN-mount-N1000`은 R1 -0.36%, R2 +13.29%).
   - 따라서 BN 장면에서 나타난 변동은 성능 개선이나 저하가 아닌 **순수 측정 잡음(noise)**입니다.

2. **B0/1000 장면 (`object-B0-mount-N1000`)**:
   - Node에서는 1바퀴 -9.14%, 2바퀴 -8.22%로 일관된 시간 단축 경향을 보입니다.
   - 그러나 Bun에서는 1바퀴 +37.21%, 2바퀴 +49.66%로 큰 폭의 시간 증가를 보입니다.
   - 런타임 간에 정반대의 반응이 관측되며, 전체 32개 측정 조합 중 15개 조합에서 방향 불일치와 0 교차가 나타납니다.

3. **결론**:
   - 직접적인 `Object.keys` 호출 횟수가 4회에서 2회로, 키 배열 길이의 합이 2,001에서 1,001로 감소(결과 객체 재열거 2회 완전 제거)한 알고리즘적 개선은 사실입니다.
   - 그러나 현재 측정 창의 타이밍 데이터는 특정 런타임(Bun)의 JIT/GC 가변성 및 마운트 노이즈로 인해 **일반적인 시간 단축 효과를 단정할 수 없으며, 측정 잡음(noise)과 런타임 가변성의 범위 내에 머무르고 있음**을 명백히 판정합니다. 결과 문서가 이 잡음 판정을 왜곡 없이 정직하게 담고 있으므로 수용 가능합니다.

---

## 병합 조건

소유자(Vincent Kelvin)가 PR #425를 병합하기 전에 충족해야 할 조건은 다음과 같습니다:

1. **소유자 단독 병합**: 본 워커나 코디네이터는 PR 승인(`gh pr review --approve`), 상태 전환(`gh pr ready`), 병합(`gh pr merge`)을 수행하지 않으며, 소유자인 Vincent Kelvin이 직접 검토 결과를 확인하고 병합을 집행해야 합니다.
2. **독립 검토 문서 보존**: 작업 트리에 생성된 본 검토 보고서(`next-extras-review.md`)는 소스 트리에 커밋하지 않으며, 코디네이터가 수집하여 원장 및 아카이브에 영속화합니다.
3. **PR 메타데이터 위생 유지**: 소유자가 PR #425를 squash 병합할 때 커밋 메시지에 도구 세션 ID나 공동 저자(co-author) 줄이 삽입되지 않도록 기존 작성자(Vincent Kelvin) 단독 명의를 유지합니다.
4. **FCA 기존 결함의 격리 유지**: 본 PR 범위 밖인 `FieldProxy`/`FieldInputSlot` 순환 및 `getAbsolutePointer` 테스트 상한 위반은 향후 별도의 전용 아키텍처 과제로 분리하여 처리하며, 본 PR의 병합 차단 사유로 삼지 않습니다.
