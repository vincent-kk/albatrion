# Notify Scenarios contract

## Requirements

이 부류는 재사용 가능한 통지 동작 데이터와 이름으로 내보내는 장면 목록을 소유한다(60C-01).
장면을 가져올 때 실행을 수행하거나 엔진 의존성을 도입하지 않는다(TEST-010).

코어 소비자의 `scenario-notify` 계약(EVENT-004·027, TEST-019·023)이 이 목록 전체를 관찰 어댑터로 실행한다.

## API Contracts

동일 값 재쓰기와 숫자 입력으로 표현할 수 없는 잘못된 형 쓰기는 `batch` 단계로 명령형 진입을 명시합니다. 화면 러너가 지우기·타이핑의 중간 쓰기를 끼워 넣거나 브라우저의 숫자 초안 거부로 경고 사례를 잃지 않게 합니다. 배달·오류 기대값은 유지합니다.

`notifyScenarios`는 `index.ts`를 통해 부류의 순서 있는 장면 목록을 내보낸다.
소비자는 주입한 어댑터로 각 스키마와 순서 있는 단계를 실행한다.
데이터는 배달 순서·`onChange` 횟수·검증 요청 횟수·`onError` 기록 코드를 관찰 가능한 기대값으로 기록하며, 엔진·렌더 단언은 소비자가 소유한다.

## Acceptance Criteria

### notify-scene-data — Shared data boundary

- 목록의 모든 장면은 데이터 전용이며 엔진·테스트 러너 가져오기와 독립적이다.
- 장면 이름은 실행 계층 전반에서 재사용 가능한 입력과 기대값을 식별한다.

### notify-scene-coverage — Scene evidence

아래 파일 참조는 60C-01이 요구하는 근거의 위치를 명시하며, 각 장면을 그 장면이 검증하는 동작과 원장 계약에 연결한다.
대시는 장면 주석, 장면을 소비하는 명세·렌더 시험, 장면 이름을 언급한 원장에서 장면별 원장 ID를 찾지 못했음을 뜻한다. 해당 장면은 ID를 추론하지 않고 동작만 기록하며, 부류 수준 원장은 Requirements의 코어 소비자 계약이 정한다.

| Scene file | Scene name | Behavior verified | Ledger evidence |
| --- | --- | --- | --- |
| `order.scenario.ts` | `notify.delivery-order` | 루트 통째 쓰기 한 번이 문서 순서로 배달하고 `onChange`와 검증 요청을 한 번씩 내며, 같은 값을 다시 쓰면 배달·콜백·검증 요청이 없다. | — |
| `batch.scenario.ts` | `notify.batch-change` | 묶음 안의 두 쓰기가 최종 출력 하나와 문서 순서 배달, `onChange`와 검증 요청 한 번씩으로 끝난다. | — |
| `warning.scenario.ts` | `notify.warning-record` | number 스키마에 문자열을 쓰면 소비자 `onError`가 구조화된 경고 코드 `SCHEMA_FORM_WARNING.TYPE_MISMATCH`를 받는다. | — |

## Last Updated

2026-10-03
