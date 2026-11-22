# 버그 바운티 최종 수정 자료 색인

## 1. 목적

최종 수정은 버그 바운티의 수정을 `1.0.0-beta` 기준으로 바로잡고 검증된 수정만 남기는 작업이었습니다. 모든 발견 사항은 수정됨(FIXED) 또는 외부 의존성(EXTERNAL) 중 하나로 정리했고, 바운티에서 결정된 모든 동작은 각 패키지 진입점을 통한 공개 진입점 테스트로 고정했습니다. 속도만을 위한 커밋은 이 브랜치에서 제거했습니다.

이 브랜치 `1.0.0/bugbounty`는 `1.0.0-beta`로 병합하기 위한 것입니다. 병합한 뒤 속도 작업은 `1.0.0-beta`에서 [`../SPEED-TARGETS.md`](../SPEED-TARGETS.md)를 따라 진행합니다.

## 2. 자료 목록

| 자료 | 위치 | 무엇인가 | 어떻게 쓰는가 |
|---|---|---|---|
| 라운드 기록 | [`../round-1/`](../round-1/) ~ [`../round-6/`](../round-6/) | 라운드별 바운티 기록입니다. 수정 내역(FIXES.md)과 패키지별 판정 파일이 있습니다. 최종 판정은 PR #680에서 정리했습니다. | 발견 사항의 근거와 판정을 찾을 때 읽습니다. 수정 절차는 [`../FIX-PROCEDURE.md`](../FIX-PROCEDURE.md)에 있습니다. |
| 속도 재측정 목표 | [`../SPEED-TARGETS.md`](../SPEED-TARGETS.md) | beta보다 느려진 행의 목록과 측정 규칙, 우선순위입니다. 모든 행의 상태는 재측정 필요입니다. | 속도 작업의 출발 지도로 씁니다. 이전 비율은 낡은 값이므로 행의 식별과 힌트로만 씁니다. |
| 결정 기록 | [`DECISIONS.md`](DECISIONS.md) | 소유자 판정 V1~V6, 합의 결정 C1~C24, 인터페이스 변경 기록입니다. | 동작을 그렇게 정한 이유와 소비자에게 보이는 변경, 이행 방법을 확인할 때 읽습니다. |
| 계약 원장 | [`contract-ledger/`](contract-ledger/) | 바운티가 결정한 동작 707행을 패키지별 파일로 나눈 목록입니다. [`ledger.md`](contract-ledger/ledger.md)가 집계 요약이고, `required` 행이 인수 기준입니다. | 동작을 바꾸는 작업 전에 해당 패키지 파일에서 관련 행을 찾아 확인합니다. |
| 속도 원자료 | [`speed-overview.md`](speed-overview.md) | SPEED-TARGETS의 바탕이 된 스트림별 속도 행입니다. 값은 속도 커밋을 제거하기 전에 측정했으므로 낡았습니다. | 행의 출처를 추적할 때만 참고하고 값은 재측정합니다. |
| 엔진 설계 | [`engine-design.md`](engine-design.md) | 코어 엔진 수정의 설계 문서입니다(272줄). | 엔진 동작의 설계 의도를 확인할 때 읽습니다. |
| 엔진 보고 | [`engine-report.md`](engine-report.md) | 코어 엔진 구현 보고서입니다(622줄). | 구현 결정과 검증 결과를 확인할 때 읽습니다. |
| 풀 리퀘스트 | GitHub `vincent-kk/albatrion` #673 포커스 앵커, #675 AJV, #676 코어, #677 UI, #678 유틸리티, #679 엔진, #680 기록과 속도 목표 | 각 PR 본문에 해당 스트림에서 beta 대비 소비자에게 보이는 변경이 있습니다. #646은 `1.0.0-beta`로 향하는 통합 PR이며 마무리 요약 댓글이 있습니다. | 스트림별 변경 범위를 볼 때 PR 본문을 읽습니다. |
| 속도 후보 브랜치 | 원격 `archive/speed-candidates-core`, `-ajv`, `-utils`, `-engine` | 스펙 PR에서 제거한 속도 전용 커밋 26개를 후보로 보관한 브랜치입니다. 아래 목록을 참고하십시오. | 속도 작업에서 재사용을 검토하되, 모든 경계 테스트가 통과할 때만 가져옵니다. |
| 변경 기록 | [`../../.changeset/`](../../.changeset/) | changesets가 배포 시 사용하는 소비자용 변경 기록입니다. | 배포될 변경을 확인하거나 새 변경 기록을 추가할 때 사용합니다. |
| 공개 진입점 경계 테스트 | 각 패키지의 `src/__tests__/` (패키지 최상위) | 필수 원장 행을 패키지 진입점을 통해 고정하는 테스트입니다. | 속도 작업은 이 테스트를 그대로 통과해야 합니다. |
| 벤치마크 | 아래 목록의 `__benchmarks__` 디렉터리, [`performance-benchmarks.yml`](../../.github/workflows/performance-benchmarks.yml), [`browser-benchmark.yml`](../../.github/workflows/browser-benchmark.yml) | 속도 측정 도구와 CI 워크플로입니다. | 재측정에 사용합니다. |

### 속도 후보 커밋 (26개)

`git log --format='%h %s' -i --grep=^perf 09e194459..origin/archive/speed-candidates-<이름>`으로 얻은 목록입니다.

`core` (3개)

- `c0e4c6cb4` perf(schema-form): skip repeated empty validation routing
- `8fe9986a8` perf(schema-form): limit expression lookbehind to slash tokens
- `837e3ace1` perf(schema-form): skip graph traversal for plain errors

`ajv` (6개)

- `95cddae5a` perf(ajv7): defer synthetic root keys
- `c87f14a23` perf(ajv7): reuse detached application schemas
- `3e67590b0` perf(ajv6): share resource indexes for compiled schemas
- `708673f18` perf(ajv8): resolve authored rejected keys once
- `48e4168a8` perf(ajv8): reuse detached application registrations
- `3fe8f7173` perf(ajv6): preserve synchronous named validation

`utils` (6개)

- `613898883` perf(common-utils): copy deep object keys with frame positions
- `41d237199` perf(json-schema): index registered spellings and schemas together
- `ef44d2814` perf(common-utils): advance cloneLite with explicit copy frames
- `6476ea09f` perf(agents-assets-sync): read runtime asset snapshots concurrently
- `b40fcb199` perf(style-utils): reuse the injector active manager
- `f13441eed` perf(style-utils): batch simple CSS text using shared boundaries

`engine` (11개)

- `7531414da` perf(schema-form): reuse pruning for admitted virtual addresses
- `a80fa7e7e` perf(schema-form): read each relay candidate value once
- `82c15d746` perf(schema-form): reuse named source decision after fill removal
- `ee52f765b` perf(schema-form): skip redundant work for stable root writes
- `403dc63a5` perf(schema-form): reuse indexed alias topology and syntax
- `252110dda` perf(schema-form): reuse contiguous coverage for refused resets
- `514ba284d` perf(schema-form): compare two direct write addresses without sorting
- `0615fb080` perf(schema-form): reuse admitted addresses and fresh write ranks
- `12d6a3221` perf(schema-form): skip replay ranges when reset withholds no writes
- `d1088a79b` perf(schema-form): reuse admitted virtual storage targets
- `aec97b658` perf(schema-form): skip irrelevant retained candidate lookups

### 벤치마크 디렉터리

- `packages/winglet/style-utils/src/__benchmarks__`
- `packages/winglet/common-utils/src/utils/object/fingerprint/__benchmarks__`
- `packages/winglet/common-utils/src/utils/object/merge/__benchmarks__`
- `packages/lerx/promise-modal/src/bootstrap/__benchmarks__`
- `packages/canard/schema-form/src/core/__benchmarks__`
- `packages/canard/schema-form/src/components/Form/__benchmarks__`
- `packages/canard/schema-form/src/components/FieldProxy/components/FieldInputBridge/__benchmarks__`
- `packages/canard/schema-form/src/helpers/virtualization/VirtualizationManager/__benchmarks__`

## 3. 사라진 자료

작업자 보고서, 검토 및 관문 보고서, 결정 판정 파일은 `/tmp`와 세션 임시 작업 공간에 있었고 삭제되었습니다. 복사한 문서에 남아 있는 `/tmp/...`나 임시 작업 공간 경로는 이 삭제된 자료를 가리키며, 더 이상 열 수 없습니다. 그 결론은 [`DECISIONS.md`](DECISIONS.md), 각 PR 본문, 라운드 기록에 남아 있습니다.

## 4. 다음 단계

1. `1.0.0/bugbounty`를 `1.0.0-beta`로 병합합니다.
2. `1.0.0-beta`에서 [`../SPEED-TARGETS.md`](../SPEED-TARGETS.md)의 우선순위 1, 2, 3 순서로 진행합니다. 측정 기준선은 beta `1c77ced57`입니다.
3. 보관된 속도 후보는 공개 진입점 경계 테스트를 모두 통과시킬 때만 재사용합니다.
