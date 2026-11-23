# `equals`와 `cloneLite`의 남은 비용은 순환 거부와 스택 안전에 필요한 작업입니다

- **종류** — 수정 비용입니다. 줄일 수 있는 부분은 줄였고, 남은 차이는 측정으로 귀속을 확인했습니다. 수용 여부는 Vincent의 확인 대상입니다.
- **행과 경과** — 우선순위 1의 깊은 비교와 깊은 복제 행입니다. 기준 시간은 6.85마이크로초와 14.26마이크로초이고 기준은 1.03입니다. 24라운드, 최솟값 / 10번째 백분위입니다.

  | 행                    | 개선 전       | 개선 후       | 대조군        |
  | --------------------- | ------------- | ------------- | ------------- |
  | `equals` 깊은 비교    | 2.636 / 2.667 | 1.466 / 1.470 | 0.997 / 1.000 |
  | `cloneLite` 깊은 복제 | 1.274 / 1.280 | 1.160 / 1.157 | 1.000 / 0.999 |

- **남은 차이의 귀속** — 진단 빌드를 12라운드로 재고 버렸습니다.
  - `equals`에서 활성 쌍 추적을 빼면 0.928 / 0.925가 됩니다(대조군 1.000 / 0.999). 남은 차이 전부가 이 추적입니다. 빼면 `publicCycleBoundaries.test.ts`와 `cyclicBoundaries.round4.test.ts`의 "equals rejects a repeated active comparison within the watchdog"와 "equals can revisit the same left object with a different right object"가 실패합니다. 순환 입력에서 `RangeError` 대신 제한 시간 초과가 납니다.
  - `cloneLite`에서 활성 집합을 빼면 1.058 / 1.060이 됩니다(대조군 0.997 / 1.004). "cloneLite rejects an unbounded cycle within the watchdog"가 실패합니다.
  - `cloneLite`에서 깊이 256의 깊은 경로 전환까지 빼면 1.026 / 1.026으로 기준 안에 들어옵니다(대조군 0.999 / 1.001). 깊은 입력 테스트 15개(`cloneLite.depth.round2`, `depth.round5`, `publicDepth.round5`, `deepProfiles.round5`)가 실패합니다. 2만 단계 입력에서 스택이 넘칩니다.
- **판단** — 수정 비용의 세 조건을 충족합니다. 두 행의 입력은 순환 추적과 깊은 경로를 지나고, 남은 작업은 컨테이너마다 한 번씩만 수행되며, 귀속은 진단 빌드 측정으로 보였습니다.
- **결정** — Vincent이 수정 비용으로 수용했습니다.
