# Fingerprint 대체 성능 검토

## 결론

기존 serializer를 기반으로 개발하는 방향이 가장 유망합니다. graph 보존용 encode를 fingerprint에서 재사용하는 현재 구현은 대체 성능 목표에 미달합니다. 기존 stableSerialize의 정렬·segment join·순환 placeholder·WeakMap 방식을 옮긴 후보가 주요 workload에서 전용 compact writer 및 32-bit hash보다 빠릅니다.

다만 이번 후보도 모든 기존 serializer보다 빠르지는 않습니다. 신규 API로 교체하거나 기존 함수 제거를 확정할 합격 상태가 아닙니다. 이번 작업은 사용자 지정 object/fingerprint에서 후보를 구현하고 검토한 단계이며, package 공개 API는 아직 기존 구현을 사용합니다.

## 실제 측정

Node 24.20.0 / V8 13.6 / Apple M1 Max, 독립 프로세스 5개, 664개 조합, 99,600개 batch 평균 sample입니다. 표는 키 생성 p50 µs/op이며 낮을수록 빠릅니다. cold는 양쪽 모두 새 identity를 사용하며 입력 생성은 시간 밖입니다.

| 경로                           | small |   wide | schema | dense array |
| ------------------------------ | ----: | -----: | -----: | ----------: |
| 현재 fingerprint, cold         | 1.348 | 46.052 |  5.069 |     199.875 |
| 기존 stableSerialize, cold     | 0.774 | 24.202 |  3.910 |      30.458 |
| legacy 기반 factory 후보, cold | 0.698 | 20.719 |  3.527 |      24.550 |
| 기존 serializeObject           | 0.280 | 18.267 |  0.975 |      47.858 |
| 기존 full-sorted               | 0.447 | 21.331 |  1.929 |      68.890 |

legacy 후보/stable cold의 process 중앙값 비율은 small 0.902 [95% CI 0.879–0.925], wide 0.853 [0.847–0.860], schema 0.903 [0.877–0.928], dense 0.811 [0.795–0.827]입니다. deep cold의 sample p50은 27.850 대 기존 26.902 µs이며 process 비율 CI는 0.937–1.064로 개선을 입증하지 못했습니다. schema 생성+Map 조회의 비율 CI도 0.881–1.010으로 개선 확정에 부족합니다.

immutable cache 적중 small은 legacy 후보 0.026, 기존 stable 0.030 µs입니다. 이는 입력을 재계산하는 경로의 속도가 아닙니다. 기존 stable의 omit cache와 섞여 hit가 miss가 되지 않도록 omit용 입력은 별도로 두었습니다.

## 후보별 판단

- **기존 알고리즘 기반:** 우선 개발 기반으로 선택합니다. graph token table, descriptor 검사, UTF-8 후처리를 강제하지 않고 기존 segment 생성 및 cache fast path를 살립니다. mutable factory의 동일 cycle 반복 호출에서 marker가 바뀌는 문제는 red test 확인 후 참조 ID 저장으로 수정했습니다. omit/prefix까지 완성한 공개 대체 구현은 아닙니다.
- **compact/direct writer:** graph 중간 배열을 제거하면 현재 fingerprint보다 개선되지만 기존 간단한 serializer의 속도까지 달성하지 못했습니다.
- **검사 생략 trusted 후보:** 다른 계약의 비용 하한입니다. 이를 동등 기능의 성능 향상으로 계산하지 않습니다.
- **32-bit streaming hash:** 출력은 짧아졌지만 small 생성 1.326 µs로 기존 기반 후보보다 느렸습니다. 충돌 허용 정책도 필요하므로 채택하지 않습니다. 다른 hash 알고리즘까지 느리다고 일반화하지 않습니다.

## 대체 계약과 구조

기존 세 함수도 같은 동작은 아닙니다. serializeObject의 단순 키 생성, full-sorted의 경로 정렬, stableSerialize의 순환·identity·cache 처리에는 서로 다른 비용이 있습니다. 가장 무거운 정책을 기본으로 통일하면 가장 가벼운 기존 함수의 속도를 잃기 쉽습니다.

다음 구현은 각 기존 hot path를 유지하는 방식이 적절합니다. shallow 또는 flatten 경로까지 강제로 재귀 구조·참조 topology 검사를 수행하지 않습니다. 기존 출력 모호성이나 opaque Map/Set 처리 등을 강화하려면 성능과 동등성 변경을 별도 판정해야 합니다. legacy 후보는 bigint/number 일부 구분과 shared/copy 구분을 하지 않으므로 현재 graph 기반 fingerprint의 완전한 호환 대체라고 주장하지 않습니다.

저장·복원은 사용자가 정리한 object/serialization에 남기고, 객체 키 생성은 object/fingerprint가 소유합니다. 최종 fingerprint는 graph encoder를 import하지 않습니다. 기존 방식 기반 후보는 이미 graph 의존성이 없습니다. 엄격한 이전 계약과 비교하는 실험만 기존 byte 검사 함수를 사용합니다. 실제 공유 소비자가 사라진 graph 순회 코드는 serialization 내부에 유지하면 됩니다.

공개 함수 전환은 성능 기준 통과 뒤 수행합니다. 중복 구현을 정식 API로 영구 제공하는 설계가 아닙니다.

## 검증과 재현

- 후보 검증 8개 test, 500개 추가 구조 표본 및 기존 fixture를 확인했습니다. 표본 검증이며 수학적 무충돌 증명은 아닙니다.
- common-utils 전체 150개 파일 / 1,186개 테스트, lint, typecheck, build가 통과했습니다.
- benchmark 파일은 declaration build에서도 제외하며 배포 결과에 포함되지 않는 것을 확인했습니다.
- 사용자가 재배치한 serialization parser 테스트의 이전 graph 경로 import를 수정했습니다.
- runtime API와 기존 serializer 실행 코드는 변경하지 않았습니다. 사용자 staged 변경은 보존했고 commit하지 않았습니다.

raw process별 결과, source SHA-256, 신뢰구간과 전체 표는 저장소 루트의 `.seiri/tasks/fingerprint-performance/`에 있습니다. runner는 저장소 루트에서 실행합니다.

```sh
for fingerprint_process in 0 1 2 3 4; do
  TSX_TSCONFIG_PATH=packages/winglet/common-utils/tsconfig.json yarn exec node --expose-gc --import tsx packages/winglet/common-utils/src/utils/object/fingerprint/__bench__/sample.ts "$fingerprint_process" || break
done
yarn exec tsx packages/winglet/common-utils/src/utils/object/fingerprint/__bench__/report.ts
```
