이번 세션에서는 1c와 변경 2를 모두 REJECT로 판정했습니다. 변경 2가 기각되었으므로 F3는 조건에 따라 실행하지 않았습니다. F-A의 기준은 HEAD였으며, F-A도 REJECT로 판정했습니다. 채택되어 다음 기준에 누적된 코어 변경은 없습니다.

측정 대상은 `packages/canard/schema-form`입니다. 이번 측정용 번들·캐시·원시 파일의 루트 S는 `/private/tmp/claude-501/-Users-Vincent-Workspace-albatrion/c8aaf054-1ea7-43d3-b3c1-a4196f8407e1/scratchpad`입니다.

HEAD는 `439fda3219ec6b42efbef4d7fa0f02a40111453f`이고, 모든 실행은 `/opt/homebrew/bin/node`의 Node v26.10.0를 사용했습니다. 실제 바이너리는 `/opt/homebrew/Cellar/node/26.10.0_2/bin/node`이며 V8은 14.6.202.34-node.35, CPU는 Apple M1 Max, 메모리는 64 GiB였습니다. 실제 측정 기록은 2026-10-08 02:36:12 KST부터 2026-10-08 08:05:11 KST까지입니다.

측정 worker 1,209개를 순차 실행했습니다. 모든 유효 측정 worker가 종료 코드 0과 signal null로 자체 종료했습니다. 측정 명령의 최장 기록은 228.185초로 8분 이내였습니다. 측정 중에는 별도 빌드·분석·패키지 관리자 명령을 실행하지 않았습니다. 저장소 Git 쓰기, 설치와 제품 소스 변경은 하지 않았으며, 번들과 캐시 및 원시 파일은 지정된 S에만 두었습니다.

코어는 설정별 새 프로세스 아홉 개에서 예열 20회와 표본 101개로 측정했습니다. 95C-01과 F4에 따라 두 번들의 순서를 표본·반복마다 교대하고, 강제 GC는 시계 밖에 두었으며 GC 뒤 첫 빈 호출 쌍을 버렸습니다. 같은 큐의 end-to-end sentinel과 microtask 종료점을 기록했고 ON 경로에는 지정된 두 차례 sentinel을 사용했습니다. 검증 경로별 고정 빈 호출 보정값은 짝의 양쪽에 동일하게 적용했고 음수 clipping은 하지 않았습니다.

105C-01의 회귀는 대응 차이의 99% 구간 전체가 0 아래이며, 차이 중앙값의 절댓값이 새 A/A 크기와 기준 중앙값의 0.5% 중 큰 값보다 클 때로 판정했습니다. 유의한 이득은 99% 구간 전체가 0 위이며 차이 중앙값이 새 A/A 크기보다 클 때입니다. 대응 중앙값 구간은 session-119와 같은 xorshift seed 101, 1,999회 재표집, nearest-rank 99% bootstrap을 사용했습니다. 각 행의 대응 표본은 909개입니다.

(0) 새 A/A는 `c-head`와 주석 한 줄만 다른 `c-headx`를 비교했습니다. 공식 행 92개와 고정 분기 축 12개를 합친 104개 판정 행에서 A/A 크기의 중앙값은 0.875µs였고, 119 세션의 같은 번들 A/A는 0.667µs였습니다. 최댓값은 각각 175.084µs와 32.541µs였으며, 59/104행에서 새 값이 더 컸습니다. 각 행의 두 A/A 값과 GC 없는 첫 쓰기 27개 기록 행은 [코어 A/A 표](profile-122-session/core-AA.md)에 나란히 적었습니다. GC 없는 기록은 채택 판정에 사용하지 않았습니다.

(1) 1c는 `c-1c` 대 `c-head`로 비교했으며 4개 회귀 때문에 REJECT입니다. 유의한 이득은 40행이었습니다. (2) 1c가 기각되어 변경 2는 `c-2` 대 `c-head`로 비교했으며 2개 회귀 때문에 REJECT입니다. 유의한 이득은 44행이었습니다. (3) 변경 2가 기각되었으므로 F3의 시간 측정과 채택 판정은 실행하지 않았습니다.

다음 표의 차이는 기준−변경이며 단위는 µs입니다. 음수는 변경이 느려졌음을 뜻합니다. 회귀 하한은 max(새 A/A, 기준 중앙값의 0.5%)입니다.

| 변경 | 회귀 행 | 차이 중앙값 µs | 기준 대비 차이 | 99% 구간 µs | 새 A/A µs | 회귀 하한 µs |
| --- | --- | ---: | ---: | ---: | ---: | ---: |
| 1c | if-then/off/update | -2.165 | -1.447% | [-3.583, -0.749] | 1.251 | 1.251 |
| 1c | if-then/off/update-first | -1.791 | -1.785% | [-3.292, -0.792] | 1.000 | 1.000 |
| 1c | if-then/on/update | -2.000 | -0.667% | [-3.375, -0.667] | 1.667 | 1.667 |
| 1c | if-then/on/update-first | -2.084 | -0.991% | [-3.500, -0.916] | 1.499 | 1.499 |
| 2 | if-then/off/mount | -3.416 | -0.623% | [-5.709, -1.542] | 2.166 | 2.743 |
| 2 | if-then/off/update-first | -1.292 | -1.300% | [-2.041, -0.208] | 1.000 | 1.000 |

고정 분기 축은 검증 OFF에서 oneOf-5·10·20·40의 kind_0→kind_4→kind_0을 사용했습니다. BF는 두 쓰기 합이고 first·later는 각각 단일 쓰기입니다. 각 비교의 분기 수 5·10·20·40 중앙값에 최소제곱 직선을 맞춘 기울기는 다음과 같습니다.

| 변경 | 작업 | 기준 µs/branch | 변경 µs/branch |
| --- | --- | ---: | ---: |
| 1c | BF | 48.825 | 40.197 |
| 1c | first | 32.699 | 27.245 |
| 1c | later | 15.741 | 12.505 |
| 2 | BF | 48.213 | 38.820 |
| 2 | first | 32.310 | 26.109 |
| 2 | later | 15.640 | 12.440 |

모든 공식 행·분기 축·if-then OFF/ON 및 GC 없는 첫 쓰기 결과는 [1c 표](profile-122-session/core-head-1c.md)와 [변경 2 표](profile-122-session/core-head-2.md)에 적었습니다.

(4) HEAD와 @canard/schema-form 0.16.0의 React 19개 fixture는 production profiling 빌드에서 세 반복으로 비교했습니다. fixture·버전·반복·측정 방식마다 새 worker를 사용하고 예열은 20회, 표본은 101개로 유지했습니다. 버전 순서는 반복마다 교대했습니다. update wall은 flushSync 쓰기부터 setImmediate 네 번까지이며 활성 시간은 같은 구간의 eventLoopUtilization active입니다. mount는 지정된 mountEquivalentForm의 handle-ready drainUntilReady와 drainTicks 종료점을 유지하고 같은 구간의 활성 시간을 기록했습니다. 기존 drainTicks(2) wall은 별도 새 프로세스의 기록 열입니다.

배율은 HEAD/0.16.0입니다. mount 목표는 1.2 이하로 판정했습니다. update 목표는 1.0 이하이며, 94C-02에 따라 세 반복 배율이 모두 1.0 초과일 때만 미달로 판정하고 혼합 결과는 tie로 충족 처리했습니다. 두 새 시간 열은 각각 38행 중 같은 14행이 미달입니다.

| 시간 열 | 미달 mount 행 | 미달 update 행 |
| --- | --- | --- |
| 네 setImmediate wall | oneOf-5, oneOf-10, oneOf-20 | sample-1, sample-3, nested-d3-f4, nested-d5-f4, array-push-100, array-replace-200, array-push-remove-100, computed-visible-derived, oneOf-5, oneOf-10, oneOf-20 |
| 이벤트 루프 활성 시간 | oneOf-5, oneOf-10, oneOf-20 | sample-1, sample-3, nested-d3-f4, nested-d5-f4, array-push-100, array-replace-200, array-push-remove-100, computed-visible-derived, oneOf-5, oneOf-10, oneOf-20 |

React 커밋 수 단언은 532,884개 쓰기에서 실패 0개였습니다. HEAD는 모든 쓰기에서 1회였고 0.16.0은 fixture별 보정값을 사용했습니다. 119 세션에서 제외했던 다섯 update 행도 모두 포함했습니다. 그 다섯 fixture의 쓰기 순서별 보정값은 다음과 같습니다.

| fixture | 0.16.0 커밋 수/쓰기 | HEAD 커밋 수/쓰기 | 검증 결과 |
| --- | --- | --- | --- |
| oneOf-5 | 3, 3 | 1, 1 | 세 반복과 두 측정 방식에서 모두 일치합니다. |
| oneOf-10 | 3, 3 | 1, 1 | 세 반복과 두 측정 방식에서 모두 일치합니다. |
| oneOf-20 | 3, 3 | 1, 1 | 세 반복과 두 측정 방식에서 모두 일치합니다. |
| array-replace-200 | 1 | 1 | 세 반복과 두 측정 방식에서 모두 일치합니다. |
| computed-visible-derived | 3, 2, 2 | 1, 1, 1 | 세 반복과 두 측정 방식에서 모두 일치합니다. |

각 행의 wall·활성 시간 배율, 세 반복 배율, 목표 충족 여부, 중앙값·p99와 기존 wall 기록은 [React 전체 표](profile-122-session/react-table.md)에 적었습니다.

(5) F-A의 기준은 채택된 코어 변경이 없는 HEAD였습니다. 원본 fa.patch의 제품 소스 변경 8개 파일이 기준 복사본에 적용되는 것을 S에서 확인했고, 삭제된 파일을 제외한 7개 변경 파일이 번들에 포함됨을 확인했습니다. 원본 패치에 함께 있는 테스트·소유권 문서·기존 측정 도구·기존 보고서는 실행 소스 overlay에서 제외했습니다. 이 적용 범위를 [입력·번들 근거](profile-122-session/session-evidence.json)에 기록했습니다.

prepare-react-bundles.mjs의 원본 코드는 바꾸지 않고 S의 어댑터로 현재 HEAD 고정, 패치 overlay, 두 계측 진입점 결합, production profiling 해석과 mount 활성 시간 시계를 연결했습니다. 기준과 변경 번들은 지정된 fa2-base.cjs와 fa2-change.cjs에 만들었습니다. React A/A는 기준과 주석 한 줄만 다른 fa2-basex.cjs를 비교한 아홉 반복으로 먼저 고정했고, 그 뒤 변경과 기준을 같은 19개 fixture에서 아홉 반복으로 비교했습니다.

React A/A와 F-A 변경 비교는 각각 171개 새 worker, 799,326개 쓰기에서 커밋 수 단언 실패 0개였습니다. mount·update의 두 시간 열을 합친 76개 판정 조합 중 유의한 이득은 30개였지만 다음 2개 회귀가 있어 F-A는 REJECT입니다.

| 회귀 행 | 차이 중앙값 µs | 기준 대비 차이 | 99% 구간 µs | 새 A/A µs | 회귀 하한 µs |
| --- | ---: | ---: | ---: | ---: | ---: |
| array-100/update-wall | -9.834 | -1.273% | [-15.083, -5.500] | 5.125 | 5.125 |
| array-100/update-active | -10.125 | -1.307% | [-14.750, -4.958] | 5.126 | 5.126 |

행별 새 A/A 한계와 모든 105C-01 판정은 [F-A A/A 표](profile-122-session/fa-AA.md)와 [F-A 변경 표](profile-122-session/fa-verdict.md)에 적었습니다.

measure-react-render-counts의 메모리 내 React 함수·클래스 및 fiber 계측은 버전별 새 worker 아홉 개에서 별도로 수행했습니다. 필드별 fiber와 쓰기별 렌더·재마운트 수는 각 버전의 모든 반복에서 동일했습니다. 평면 폼의 필드별 fiber는 24→21, 배열 폼은 21→18로 줄었습니다. 자체 필드 /a 쓰기의 대상 경로 렌더는 제어·비제어 모두 10→10회이고 전체 렌더는 20→20회였습니다. 배열 push의 새 필드 렌더는 13→10회, 전체 렌더는 40→37회였습니다.

재마운트 수는 기준과 변경에서 같았습니다. 평면 폼의 input 자체 쓰기와 동일 값 쓰기는 0회이고, 외부 leaf·부모·전체 값 쓰기 및 명시적 refresh는 대상 경로에서 1회였으며 reset은 4회였습니다. 배열 push·remove·한 항목 추가 교체의 기존 경로 재마운트는 0회이고 전체 새 값 교체는 4회였습니다. 새 배열 항목의 신규 마운트는 따로 기록했습니다.

갱신 지연은 외부 leaf setValue부터 commit 안의 DOM input 값 setter 또는 배치까지이며, 각 시나리오·버전에서 72개 표본의 중앙값을 기록했습니다. 이 지연 계측은 105C-01 시간 판정에 더하지 않은 별도 기록입니다.

| 시나리오 | 기준 지연 µs | 변경 지연 µs | 변경/기준 |
| --- | ---: | ---: | ---: |
| flat/제어 | 349.271 | 337.063 | 0.9650 |
| flat/비제어 | 276.500 | 284.542 | 1.0291 |
| array/제어 | 305.187 | 293.417 | 0.9614 |
| array/비제어 | 303.188 | 304.042 | 1.0028 |

모든 컴포넌트·경로의 쓰기별 렌더 행렬, 방문·생성 fiber, 재마운트·신규 마운트와 지연 p99는 [F-A 렌더 계측 표](profile-122-session/fa-counts.md)에 적었습니다.

원시 파일 4,277개는 모두 `S/profile-122-raw/`에 보존했고, 각 파일의 SHA-256은 [원시 SHA-256 목록](profile-122-session/raw-sha256.txt)에 적었습니다. Node·패치·원본 도구·어댑터·번들 SHA-256은 [세션 근거](profile-122-session/session-evidence.json)에 적었습니다. 최종 산출물과 작업 트리 검증 결과는 [검증 기록](profile-122-session/session-verification.json)에 적습니다. 저장소 산출물은 개별 5 MB 이하로 제한했습니다.

준비 단계에서는 scratch wrapper의 소문자 전용 이름 검사 때문에 oneOf-5가 worker 시작 전에 한 차례 차단되었습니다. 대문자 O를 허용하도록 wrapper만 정정했으며 기존 16개 측정과 시계 코드는 유지했습니다. 이 비측정 종료 기록도 원시 SHA-256 목록에 포함했습니다. 이번 보고서는 해당 준비 오류를 유효 측정 실패로 집계하지 않았습니다.

판정 근거로 95C-01·105C-01·94C-02와 origin/1.0.0-beta의 118–121 회차 및 120 회차 부록을 읽었습니다. 이 원문들의 SHA-256은 초기 preflight와 세션 근거에 기록했습니다. 이번 보고서는 이번 측정 결과를 기록하며, 이전 수치는 요청된 119 세션의 같은 번들 A/A 비교에만 사용했습니다.
