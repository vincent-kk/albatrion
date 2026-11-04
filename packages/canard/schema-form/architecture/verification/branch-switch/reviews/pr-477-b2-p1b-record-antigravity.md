# B2-P1b 최종 기록 검토 보고서 (Record Review)

- **검토 커밋 범위**: `422b1b195..b0a085045`
- **대상 패키지**: `packages/canard/schema-form`
- **작업 브랜치**: `perf/schema-form-b2-p1b-lazy-inactive`
- **작업 트리**: `branch-switch-b2-p1`
- **저장소 소유자**: Vincent
- **검토자**: Antigravity (독립 읽기 전용 검토자)

---

## 1. 검증 종합표

| 검증 항목 | 판정 | 세부 근거 (path:line) |
| :--- | :---: | :--- |
| **(1) 변경 경로 최소화 및 제품 코드 완전 복원** | PASS | `git diff --stat 422b1b195..b0a085045` 결과 정확히 지정된 8개 파일만 변경됨 (결과 문서 1, 도구 4, 공개 계약 시험/픽스처 3). `packages/canard/schema-form/src/` 내 `__tests__` 제외 제품 소스코드 diff 0건 및 `DETAIL.md` diff 0건으로 base(`422b1b195`)와 바이트 단위로 100% 동일함 확인. |
| **(2) 계약 시험의 공개 동작 검증 및 구현 비의존성** | PASS | 복원된 base 빌드 상태에서 vitest 실행 시 3개 파일 13개 테스트 전수 통과 (137ms/175ms). 신규 시험(`settle.inactive-lifecycle-contract.test.ts:5-103`, `settle.inactive-read-contract.test.ts:11-99`, `createInactiveContractTree.ts:8-27`)은 `inactiveValues`, `find`, `setValue`, `resetSubtree` 등 공개 인터페이스의 불변식·동결·캐시 동작만 검증하며, 폐기된 B2-P1b 구현(저널, InactiveValuesState 등)에 전혀 의존하지 않음. 기존 시험 단언 수정 0건, 과거 시제/이력 주석 0건. |
| **(3) 측정 도구 확장의 기본 21행 동작 불변** | PASS | `buildAlternatingRows.mjs:4-28`에서 `includePayload12 = false`를 기본값으로 유지하여 기본 21행 canonical fixture 반환. `alternate.mjs:18-21`는 `--only` 또는 worker에 `switch-payload-12`가 명시될 때만 22행으로 확장. `checkAlternatingDevice.mjs:250-255`에서 기본 호출 시 `length === 21` 단언과 payload 명시 시 `length === 22`, legacy 18행 검증을 통과하도록 보장. `README.md:352-358`에 명시 행 규칙 문서화 완료. |
| **(4) 결과 문서 수치와 원시 판정 자료의 완전 일치** | PASS | `b2-p1b-results.md`의 대표 수치가 `{scratch}/b2-p1b-20261027/post-review/judgement.json` 및 raw 교번 측정치와 소수점 끝자리까지 정확히 일치함 (품질 중앙값, memo 단계, totals, TEST-073, Node/Bun 힙). |

---

## 2. 상세 검증 증거

### (1) 경로 및 제품 소스 불변 검증
- `git diff --stat 422b1b195..b0a085045`:
  - `packages/canard/schema-form/architecture/verification/branch-switch/b2-p1b-results.md` (+39)
  - `packages/canard/schema-form/architecture/verification/design-optimization/tools/README.md` (+8)
  - `packages/canard/schema-form/architecture/verification/design-optimization/tools/alternate.mjs` (+4, -1)
  - `packages/canard/schema-form/architecture/verification/design-optimization/tools/helpers/buildAlternatingRows.mjs` (+5, -2)
  - `packages/canard/schema-form/architecture/verification/design-optimization/tools/helpers/checkAlternatingDevice.mjs` (+7)
  - `packages/canard/schema-form/src/core/engine/settle/__tests__/fixtures/createInactiveContractTree.ts` (+27)
  - `packages/canard/schema-form/src/core/engine/settle/__tests__/settle.inactive-lifecycle-contract.test.ts` (+104)
  - `packages/canard/schema-form/src/core/engine/settle/__tests__/settle.inactive-read-contract.test.ts` (+100)
- `git diff 422b1b195..b0a085045 -- 'packages/canard/schema-form/src/**' ':!packages/canard/schema-form/src/**/__tests__/**'`: 출력 없음 (0 lines changed).
- `git diff 422b1b195..b0a085045 -- '**/DETAIL.md'`: 출력 없음 (0 lines changed).

### (2) 공개 계약 시험 검증
- `packages/canard/schema-form/src/core/engine/settle/__tests__/fixtures/createInactiveContractTree.ts:8-27`: `makeFieldNodeTree`와 공개 `setValue`만 사용하여 다중 분기 트리를 생성.
- `packages/canard/schema-form/src/core/engine/settle/__tests__/settle.inactive-lifecycle-contract.test.ts`:
  - `5-43`: 배열 재색인 및 clear 후 소멸 스냅샷 보존 검증.
  - `45-72`: 리셋 및 교체 후에도 캡처된 미읽기 세대의 독립성 보존 검증.
  - `74-103`: 미읽기 동일 이름 이탈 시 교체/unset 규칙 보존 검증.
- `packages/canard/schema-form/src/core/engine/settle/__tests__/settle.inactive-read-contract.test.ts`:
  - `11-24`: 중간 읽기 없는 N회 전환 후 최종 읽기 동치성 및 동결 배열 검증.
  - `26-33`: 경로 진입 후 미읽기 탈출 시 과거 객체 식별자 부활 방지 검증.
  - `35-63`: 이탈 세대 구체화 및 무관 호스트 참조 식별자 보존 검증.
  - `65-99`: 무관 호스트 읽기 재사용 시 Map 순회(values/keys) 부재 스파이 검증.
- vitest 실행 결과: 3개 파일 13개 테스트 전수 통과 (`✓ 13 passed`). 기존 파일 단언 수정 및 이력 주석 전무.

### (3) 도구 확장 검증
- `alternate.mjs:18-21`: `buildAlternatingRows(config.only?.includes('switch-payload-12') || config.worker === 'switch-payload-12')`로 옵션 명시 시에만 전달.
- `buildAlternatingRows.mjs:4, 24-28`: 기본 매개변수 `includePayload12 = false` 시 기존 21개 canonical fixture만 반환하며, `true`일 때만 `switch-payload-12` 추가.
- `checkAlternatingDevice.mjs:250-255`: 기본 21행 길이 불변(`assert.equal(buildAlternatingRows().length, 21)`), payload 포함 시 22행(`assert.equal(payloadRows.length, 22)`), legacy 18행(`assert.equal(payloadRows.filter((row) => !row.currentOnly).length, 18)`) 검증 단언 일치.
- `README.md:352-358`: 기본 21행 레지스트리와 검사 기대값 유지 및 `--only`를 통한 22행 확장 동작 정확히 문서화.

### (4) 결과 문서 수치 정합성 검증 (`b2-p1b-results.md` vs `judgement.json`)
- **품질비**: legacy 0.16.1 호환 18행 B10/A10 비의 중앙값 `1.00074968` (`b2-p1b-results.md:24` ↔ `judgement.json:12` `1.0007496817180543`, `assessedRows: 18`).
- **메모 단계 inclusive 평균 및 압축**:
  - `switch-oneOf-80`: A `22.828` µs (raw `22.82778`), B `26.136` µs (raw `26.13582`), B 압축 `6/300` (`b2-p1b-results.md:12` ↔ `judgement.json:stages[0,2]`).
  - `switch-payload-12`: A `44.162` µs (raw `44.16207`), B `64.483` µs (raw `64.48346`), B 압축 `27/300` (`b2-p1b-results.md:13` ↔ `judgement.json:stages[1,3]`).
- **목표 총합 (totals)**:
  - `switch-oneOf-80`: A `0.502666` ms (`502.666` µs), B `0.466917` ms (`466.917` µs), A′ `0.422500` ms (`422.500` µs), 폭 `0.190417` ms (`190.417` µs) (`b2-p1b-results.md:7` ↔ `judgement.json:rows[5]`).
  - `switch-payload-12`: A `0.810750` ms (`810.750` µs), B `0.8838125` ms (`883.812` µs), A′ `0.877792` ms (`877.792` µs), 폭 `0.331083` ms (`331.083` µs) (`b2-p1b-results.md:8` ↔ `judgement.json:rows[21]`).
- **TEST-073**: 인접 10쌍 22행 Welch 검정 회귀 `0/22행` (`b2-p1b-results.md:26` ↔ `judgement.json:regressions: []`).
- **힙 (5,001 노드)**:
  - Node: A 중앙 `1439.10`, A 최대 `1890.78`, B 중앙 `1443.22` (B median `1443.22` ≤ A max `1890.78`, `b2-p1b-results.md:17` ↔ `judgement.json:heap[0]`).
  - Bun: A 중앙 `2234.26`, B 중앙 `2232.35` (`2234.26→2232.35`, `b2-p1b-results.md:18` ↔ `judgement.json:heap[1]`).

---

최종 판정: PASS
