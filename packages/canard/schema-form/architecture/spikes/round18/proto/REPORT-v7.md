# v7 프로토타입 실행 보고서

실행일: 2026-09-27. 환경: macOS arm64, Node.js v26.10.0. 제품 엔진을 연결하지 않은 독립 프로토타입입니다. `loop-v7.mjs`는 명시적 입력을 받는 모형 진입점, `build-v7.mjs`는 회귀 스키마를 모형으로 만드는 어댑터입니다. v5·v6 런타임을 가져오지 않으며 과거 프로토타입 소스는 수정하지 않았습니다.

## 실행과 결과

저장소 루트에서 다음 명령으로 신규 규범 프로브와 이식 회귀를 함께 실행합니다.

```sh
node --test packages/canard/schema-form/architecture/spikes/round18/proto/__tests__/*.test.mjs
```

최종 실행: **35 tests, 35 pass, 0 fail, 0 skip**, 4,826.40 ms. 그중 25개는 현행 규범 프로브, 10개는 아래의 전체 역사적 하니스 실행·결과 검증입니다. 하니스가 내부에서 실행하는 단언 수를 35개 테스트 수에 더하여 부풀리지 않습니다.

| 회귀 원본 | v7에서 확인한 범위 | 결과 |
| --- | --- | --- |
| round9/regress/selfcheck-v5.mjs new | 8라운드에서 이식한 63개 단언 | 63/63 |
| round9/regress/selfcheck-v5.mjs old | 같은 63개 단언의 역사적 레벨 모드 | 63/63 |
| round9/r9.mjs | Q8, 21개 관측행·108개 단언 | 108/108 |
| round9/regress/edge-cases.mjs | 경계 탐침 | 26/26 |
| round9/r9b.mjs | 검증 뒤 수정 13개 탐침 | 52/52 |
| round9/regress/r7-port.mjs new/old | 두 모드 관측행 전체 대조 | 설명한 차이만 존재 |
| round9/regress/r8-port.mjs | 31개 프로세스 구성, 41개 SUMMARY 전체 대조 | X16 4행 외 동일 |
| round10/r10.mjs | 역사적 v6 정책 48조합 | 376/376 |
| round10/policy-check.mjs | 역사적 정책 관측 가능성 | 10/10 |

v6의 386개 단언은 **역사적 정책 실험 호환** 근거입니다. `EXPERIMENT=true`의 순위/재시도 변형을 현재 규범의 정답으로 세지 않습니다. 현행 규범 프로브는 `EXPERIMENT=false`와 기본 정착 기준을 사용합니다. Q8은 일반 실행에서 옛 `WRITE_CONFLICT=first/last`를 바꿔도 고정순위가 유지되는지도 검증합니다.

원본 하니스 전체 드라이버의 소스 재생성·옛 결과 덮어쓰기는 실행하지 않습니다. 대신 `regression.test.mjs`가 원본 하니스별 실행을 빠짐없이 재현합니다. Node import hook은 모델 경계만 v7으로 연결하고, 과거 결과 파일 쓰기를 막고, 현행 원장으로 바뀐 기대를 메모리에서 정확히 한 번 치환합니다. 각 치환은 원장 ID와 원문을 보유하며 원문이 달라지거나 중복되면 실패합니다. 원본 `.mjs`·기존 결과 파일은 그대로 보존됩니다.

개별 재실행 예:

```sh
node --import ./packages/canard/schema-form/architecture/spikes/round18/proto/__tests__/registerRegression.mjs packages/canard/schema-form/architecture/spikes/round9/r9.mjs
```

## 현재 원장에 따른 기대 변경

TEST-060은 9라운드 결과의 `현행(기록)`입니다. 뒤 라운드에서 확정한 규범을 덮지 않습니다. 과거 시험 파일의 단언은 수정하지 않았습니다.

| 사례 | 과거 기대 | v7 기대와 근거 |
| --- | --- | --- |
| selfcheck A3-4B·A3-4-omit, r7 E13 | 빈 객체 루트 undefined | `{}` — VALUE-034. old 모드의 과거 출력 일치 집계도 26/28에서 25/28로 변합니다. |
| Q8 P5 충돌 | 단계 순서·first/last에 따라 I:2 또는 D:1 | 항상 D:1 — SETTLE-004의 derived > injectTo. 4개 조합 전부 실행합니다. |
| 경계 stage order | 단계 순서에 따라 undefined 또는 4 | 항상 undefined — SETTLE-004의 unset > derived. |
| Q8 P6 reset | true가 유지되면 loaded 보존 | undefined — CONTROLS-028의 로드 값 평가, WRITE-090/SETTLE-048의 새 수명과 에지 기준 초기화. |
| selfcheck A4b(edge), r9b final-shape-feedback-budget, r7/r8 X16 | 예산 초과 후 빈 원본 B, 혹은 마지막 라운드 | stable, `t='from-C'`; 중간 `c` 채움만 철회 — FRAGMENT-050. r9b는 4라운드, 생김은 `/`와 `/t`뿐입니다. |
| r7 X15 | 같은 최종 값에 5라운드 | 3라운드 — FRAGMENT-050에 따라 나간 원천의 에지는 후보가 아니며 적용한 파생 쓰기를 철회하지 않습니다. |
| r7 X3의 역사적 EDGE_REF=entry 변형 | 진입 안 순차 쓰기 뒤 tgt=mine | tgt=f(y) — 이전 정착의 파생 쓰기를 유지합니다. 이 변형은 직전 커밋을 기준으로 삼는 SETTLE-028·048의 현행 모드가 아니며 별도 역사적 관측입니다. 같은 사례의 기본 settle 모드 결과는 동일합니다. |

r8의 X16 4개 변형은 모두 최종 `raw=emit={t:'from-C'}`, 활성 조각 없음, stable로 확인했습니다. 나머지 37개 SUMMARY는 기존 결과와 정확히 같습니다.

## 18라운드 규범 프로브

| 범위 | 실제 확인 |
| --- | --- |
| 규칙 A, WRITE-093 | source/target 변환표 78칸, 정확한 수 표기·유한 수·안전한 정수 변환·integer 멤버십, 객체/배열 참조 유지, 없음/null 보존 |
| 동점·대수 성질 | 12개 모호한 조합에서 원래 숫자 보존; 63개 비어 있지 않은 종류 부분집합 × nullable 두 값 × 입력 29개에서 순서 무관·멱등 7,308단언 |
| U7, WRITE-098·099 | 직전 분기와 무관하게 a='42'→42, a=0→false; 원래 호출자 입력으로 두 번째 해석; 게이트만 바뀌면 값 유지·경고등 변경 |
| 전이 상한 | 수렴 반례 a='0'; 비수렴 반례는 B의 a=0, degraded, 전이 라운드 ≤3 |
| VALUE-034 | 빈 객체/배열 루트, 중첩 omitEmpty, 배열 중간 빈 객체/배열/null 자리, omitTrailing 꼬리, 마지막 칸을 비운 onChange의 `{}` |
| VALUE-002 | 조건에만 언급된 키는 extras로 게이트 입력에 남고, 비활성 조각의 정적 선언 키는 잠복 원본으로 제외 |
| SETTLE-004 | 원천 문서 순서·같은 원천의 선언 층·동일 층 조각 순서, 정착 앞 라운드의 높은 순위 보존 |
| FRAGMENT-050 | 나간 원천의 injectTo 무발화; unsetOnInactive만 나감 원본을 한 번 지움; 앞서 적용된 파생 쓰기 유지·중간 채움만 철회 |
| SETTLE-002·003 | 독립 자식 50개에서 한 칸 쓰기 시 재계산 방문 수 2(해당 자식과 루트) |

규칙 A 구현은 결과 후보 배열/Set을 만들지 않고 첫 후보와 모호성만 추적합니다. 이 항목은 구현 검토 근거이며 힙 할당량을 계측한 벤치라고 주장하지 않습니다. 전체 실행 시간은 회귀 프로세스 시작 비용을 포함하므로 제품 성능 비교에 사용하지 않습니다.

## 실패 후 통과와 정적 확인

- 이식 전 기대 그대로 v7에서 실행했을 때 selfcheck new 60/63, old 61/63이었으며 빈 루트·파생 보존 차이를 확인했습니다. Q8의 I:2, 경계의 4, r9b의 budget-exceeded 기대도 해당 이유로 실패했습니다. 위 표의 현행 원장 근거로 이식 기대를 분리했습니다.
- Q8의 현행 고정순위 기대를 먼저 적용하자 `WRITE_CONFLICT=first` 경로에서 실제 I:2, 기대 D:1로 실패했습니다. 일반 실행의 옛 순위 분기를 제거한 뒤 108개 단언 전부 통과했습니다. 단순히 과거 스위치를 강제로 변경해서 실패를 숨기지 않았습니다.
- 정본 `.mjs` 159개에 `node --check`를 실행하여 오류 0을 확인했습니다.
- v7 런타임에서 v3–v6 모델·제품 src·React를 가져오는 구문은 0개입니다. 테스트 import hook만 과거 하니스의 버전 경로를 해석합니다.
- `git diff --name-only -- .../spikes/round9 .../spikes/round10` 결과가 비어 있어 과거 소스·결과 파일 불변을 확인했습니다.
- filid 전체 스캔과 패키지 strict·lint·옛 시험 전체는 02 PR 경계의 통합 게이트이며 이 보고서만으로 통과를 주장하지 않습니다.

## 남은 범위

이 프로토타입은 제품 엔진·React·검증기 전체를 대신하지 않습니다. 스키마 어댑터의 조건 판정은 기존 회귀가 사용하는 주입 모형이며, 최종 노드/정착 기제와 실제 validator 결합은 03 이후 게이트에서 검증합니다. 여기서 요구된 v5/v6 회귀와 18라운드 프로브에는 미통과 사례가 없습니다.
