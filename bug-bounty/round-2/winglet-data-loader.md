# @winglet/data-loader 버그 바운티 2라운드 결과

2라운드에서 새로 확인된 문제는 1건입니다. 1라운드 문서([`../round-1/winglet-data-loader.md`](../round-1/winglet-data-loader.md))의 2건은 고쳐진 것으로 보고 제외했습니다. 재현 테스트는 메인 세션에서 다시 실행해 같은 실패를 확인했습니다.

재현 테스트: [`probes/winglet-data-loader/`](probes/winglet-data-loader/)

- 실행하려면 파일을 `packages/winglet/data-loader/src/__bounty__/r2-periphery/`에 복사한 뒤 `yarn workspace @winglet/data-loader test --run src/__bounty__/r2-periphery/`를 실행합니다.
- `maxBatchSize.probe.test.ts`는 2개 모두 실패합니다. `dataLoader.diff.test.ts`는 참조 패키지와 비교하는 차등 테스트이며 통과합니다. 이 테스트는 실행에 약 70초가 걸립니다.

## 1. `maxBatchSize`에 `NaN`이나 `2.5`를 넣어도 받아들이고, `NaN`이면 배치가 조용히 꺼집니다

- 심각도: 낮음. 참조 패키지 `dataloader`에도 같은 검증 빈틈이 있습니다.
- 영향받는 공개 API: `new DataLoader(fn, { maxBatchSize })`.
- 어긋난 계약: `docs/en/SPECIFICATION.md:211`은 양의 정수여야 한다고 적고 있고, `src/utils/prepare.ts`의 오류 문구도 "must be a positive integer"입니다. `src/DETAIL.md`는 숫자가 아닌 값이 예외를 던진다고 적고 있습니다.
- 원인: `src/utils/prepare.ts:42`가 `typeof !== 'number' || < 1`만 검사합니다. `NaN < 1`은 거짓이므로 통과하고, 이후 `keys.length < NaN`이 항상 거짓이 되어 `load`마다 배치가 따로 열립니다.
- 1라운드와의 관계: 새로운 종류입니다(입력 검증).
- 재현:
  - "rejects a non-integer maxBatchSize (docs: must be a positive integer)": 예외가 나지 않습니다.
  - "NaN maxBatchSize: three loads in one tick form one batch or throw": 실제 배치는 `[[1], [2], [3]]`이고, 기대값은 `[[1, 2, 3]]`이거나 생성 시점의 예외입니다.
- 확신도: 높음.

## 버그가 아니라고 확인한 가설

- 참조 패키지 `dataloader@1.4.0`(저장소에 설치된 유일한 버전)과의 차등 테스트: 설정 5가지(기본, `cache: false`, `maxBatchSize: 2`, 사용자 정의 `Map`, `cacheKeyFn`)마다 seed로 만든 무작위 연산 순서 150개, 모두 750개를 실행했습니다. 연산에는 `load`, `clear`, `clearAll`, `prime`(값과 `Error`)이 있었고, 배치 전체 실패와 키별 `Error`를 무작위로 섞었습니다. 배치 키 목록과 모든 호출 결과가 일치했습니다. 1.4는 `loadMany`가 통째로 거부되므로 2 버전 의미로 맞춰 비교했습니다. `prime`한 `Error`는 이 패키지에서 처리되지 않은 거부를 만들지 않지만, 참조 1.4는 만듭니다.
- `failedDispatch`가 같은 키의 더 새로운 캐시 항목을 지우는 동작, 그리고 없는 키에 `null`을 반환하는 사용자 정의 캐시에 대한 `prime` 동작은 참조 패키지와 같습니다. `MapLike` 타입은 없는 키에 `undefined`를 반환한다고 정합니다.
- `isArrayLike`가 문자열을 거부하므로 `loadMany('abc')`는 문서대로 예외를 던집니다.
