# data-loader — 배치·캐시 비동기 로더

## Purpose

GraphQL DataLoader에서 영감을 받은 배치 수집·캐싱 클래스 `DataLoader`를 소유한다. 여러 개별 `load` 호출을 하나의 배치 함수 호출로 묶고, 키별 Promise 캐싱으로 중복 요청을 제거하며, 배치 결과의 부분 실패(개별 키가 값 대신 `Error`로 응답)를 지원한다.

## Boundaries

### Always do

- 생성자·메서드의 잘못된 입력은 항상 `DataLoaderError`로 던진다 — 일반 `Error`나 무처리 예외를 노출하지 않는다
- batchLoader의 동기 예외·잘못된 반환값도 그 배치에 걸려 있던 모든 키를 정상적으로 reject시켜 정리한다

### Ask first

- 기본값 변경: `batchScheduler`(현재 `scheduleNextTick`), `cacheKeyFn`(현재 identity), `maxBatchSize`(현재 `Infinity`)
- `DataLoaderOptions`에 새 필드 추가 또는 부분 실패(배열 원소가 `Error`인 경우) 시맨틱 변경

### Never do

- `prime()`이 이미 캐시된 키의 값을 덮어쓰게 만드는 변경
- 배치 응답 배열 길이가 키 개수와 다를 때 조용히 무시하고 진행하는 경로 추가
