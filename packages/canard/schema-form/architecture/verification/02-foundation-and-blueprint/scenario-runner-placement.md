# 시나리오 러너 소유권 검증

## 원장과 변경

TEST-023에 따라 비공개 시나리오 패키지는 순수 데이터, `FormScenario`,
화면 어댑터와 감싸개를 소유합니다. 코어 러너는 제품의 코어 시험이 소유합니다.
TEST-014·TEST-077의 후속 엔진 시나리오는 이번 뼈대 변경으로 구현했다고
계산하지 않습니다.

- `runScenario`와 기존 시험 3건을 제품의
  `src/core/__tests__/scenarios/utils/`로 함께 옮겼습니다. 공유 패키지는
  코어 러너를 더 이상 내보내거나 내부에서 사용하지 않습니다.
- `playScenario`는 등록된 화면 어댑터로 단계를 실행합니다. 등록 조회의
  동기 오류를 유지하고 실행 → 정착 → 기대 검사 순서를 기다립니다.
- 빈 패밀리 시험은 데이터가 비었는지만 확인합니다. union·fill·narrowing의
  실제 엔진 시나리오는 여전히 0개입니다.
- 독립 fractal이나 가짜 엔진을 추가하지 않았습니다.

## 검증

2026-09-27 작업 트리에서 실행했습니다. 문서 선행 커밋은 `ce5961b0`입니다.

| 검사 | 결과 |
| --- | --- |
| 변경 전 `yarn workspace @aileron/schema-form-scenarios test` | 4파일·10건 통과 |
| 변경 후 같은 패키지 시험 | 4파일·10건 통과 |
| `yarn workspace @canard/schema-form test --project unit src/core/__tests__/scenarios/utils/__tests__/runScenario.test.ts` | 1파일·3건 통과 |
| `yarn workspace @aileron/schema-form-scenarios typecheck` | strict 통과 |
| `yarn workspace @aileron/schema-form-scenarios lint` | 통과 |
| 기존 코어 러너 시험의 import 제외 TypeScript AST 비교 | 동일 |
| 시나리오 패키지의 `runScenario` 참조 검색 | 0개 |

옮긴 코어 시험 3건의 단언은 유지했습니다. 화면 실행의 빈 입력·정착 순서·
실패 전파 시험 3건을 더해 두 실행 계층의 계약을 각각 검사했습니다.
제품 전체 게이트와 PR 경계 filid 스캔은 상위 검증 보고서에서 기록합니다.

파일 이동 때 filid 구조 훅은 `utils/__tests__`에 대해 organ 하위 디렉터리
경고를 냈습니다. 이는 검증 파일을 검증 대상 내부에 두라는 저장소 규칙에
따른 배치이며, 새 fractal 생성으로 우회하지 않았습니다. 최종 스캔의
판정과 혼동하지 않습니다.
