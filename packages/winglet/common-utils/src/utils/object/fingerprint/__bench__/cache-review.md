# Immutable cache-hit 성능 재검토

## 결론

2026-09-19 재측정에서는 새 factory의 캐시 적중이 기존 stableSerialize보다 빨랐습니다. 앞선 혼합 벤치마크의 dense 결과(0.117 µs 대 0.085 µs)를 함수 자체의 회귀로 단정한 해석을 철회합니다. 그 측정값 자체를 삭제하거나 새 수치로 덮어쓰지는 않습니다. 최초 계산·일반 혼합 호출·충분히 warm-up된 캐시 적중은 각각 다른 workload입니다.

## 방법과 결과

Node v24.20.0, 독립 프로세스 5개에서 각 후보 100,000회 warm-up 후 배치당 100,000회씩 30회 측정했습니다. 두 후보의 순서를 교대하고 같은 호출 래퍼를 거쳐 결과 길이 또는 Map 조회 결과를 소비했습니다. 입력·팩토리·Map 생성은 timing 밖입니다. 런타임 구현은 변경하지 않았습니다.

| 입력과 작업 | 기존 ns/호출 | 새 factory ns/호출 |
| --- | ---: | ---: |
| 작은 객체, 키 반환 | 16.28–16.96 | 7.46–7.83 |
| 작은 객체, Map 조회 포함 | 20.65–20.96 | 11.06–11.25 |
| 밀집 배열, 키 반환 | 19.81–20.21 | 10.79–11.18 |
| 밀집 배열, Map 조회 포함 | 25.83–26.71 | 16.45–16.68 |

범위는 다섯 프로세스 각각의 중앙값 최소–최대입니다. 동일한 객체를 반복하는 immutable 적중 조건이며 변경 입력이나 omit 처리 성능까지 일반화하지 않습니다. 원자료는 `.seiri/tasks/fingerprint-cache-review/before-0.json`부터 `before-4.json`까지이고 factory 소스 해시를 포함합니다.

## 거의 같은 알고리즘인데 차이가 나는 이유

캐시 적중에서는 직렬화 알고리즘을 실행하지 않습니다. 기존 함수는 타입 판정, 공용 WeakMap의 entry 조회, omitHash 비교를 거쳐 result를 반환합니다. 새 factory는 생성 시 정책을 고정한 closure의 root WeakMap에서 문자열을 읽습니다. 순회 로직이 비슷하다는 사실은 이 경로의 속도를 설명하지 못합니다.

이전 harness는 큰 입력에 20회 배치를 사용했고 여러 서로 다른 함수를 같은 호출 지점에서 섞었습니다. 100회 warm-up과 수 µs짜리 배치에서는 JIT 상태, 간접 호출, 타이머/루프 비용의 상대적 영향이 큽니다. 긴 배치의 분리 측정으로 순위가 뒤집힌 것은 확인했지만 각 엔진 내부 원인의 기여율까지 측정한 것은 아닙니다. 이를 단순히 배열 처리 회귀나 특정 분기 하나의 비용으로 설명하지 않습니다.

최초 계산에서는 새 safe의 mutation 반영을 위한 호출별 seen Map, 속성명 길이 표식, bigint/-0/symbol 구분 등이 기존과 다릅니다. 반면 기존은 중첩 객체 결과를 지속 캐시하므로 반복·공유 하위 트리 workload에서 유리할 수 있습니다. omit 변경을 정확히 반영하려면 새 factory는 omit 내용을 다시 정규화해야 합니다. 이 비용을 없애려면 별도 불변 옵션 계약이 필요하므로 현재 최적화 명목으로 생략하지 않습니다.

## 재현과 개선 판단

```sh
for fingerprint_process in 0 1 2 3 4; do
  TSX_TSCONFIG_PATH=packages/winglet/common-utils/tsconfig.json yarn exec tsx packages/winglet/common-utils/src/utils/object/fingerprint/__bench__/cacheHit.ts before "$fingerprint_process"
done
```

우선 개선할 대상은 cache-hit 전용 측정 방법입니다. 이미 더 빠른 경로에 중복 조회나 별도 분기를 추가할 근거는 확보되지 않아 runtime 코드는 유지했습니다. 정렬이 필요 없다면 sort:false, 깊은 불변성이 보장된다면 cache:immutable을 선택하는 것이 현재 계약 안에서 가능한 비용 절감입니다.
