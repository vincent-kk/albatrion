# W4·W1 구현 검증 — 469라운드

2026-11-02. 제품 소스 기준은 `a9dccbea90356b4b6db5954eb2c9837c0e85dff9`입니다. #519 기록 병합 뒤 원장·FCA 비교 기준은 `a962c942d10b37c8f508750f2735f1919c36f576`이며, 성능 측정 기준은 제품 변경이 없는 원래 `55055f65b52f952cd934eeec641314171e1ff253`입니다. 이 문서는 구현과 측정 준비 결과입니다. **수락 측정은 대기 중입니다.**

## 조사와 선택 근거

- W4 직접 oracle의 merged1000 중앙값482.9ms 중 반복 active Set 생성123.5ms(25.6%)가 상한으로 관측되었습니다. W1은 C1000 전체 wave24.99ms 중 snapshot23.80ms, engine1.17ms였고 C300은2.97ms 중 snapshot2.55ms였습니다. 이는 이번 구현의 절감 측정값이 아닙니다.
- W5 bulk1000은57.7831→54.0374ms, 6.48%로 사전10% 기준에 미달했습니다. W2 bulk1000은57.2568→58.2726ms로 절감이 없었습니다. W3는 가정한 항목별 find 경로가 일반 ChildFields 제품 경로에 없고 empty minItems 슬롯만 find를 사용하여 닫았습니다. C2의 이전 두 절감값은0.904ms·0.861ms로 모두1ms 기준 미달이며 C1은 #519 기록으로 종결되었습니다.
- 조사 수치와 원본 probe는 `raw/oracle-*.json.gz`에 보존합니다. 소유자 원문65·79와 결정469C-01·02는 `reviews/round-469-owner-answers.md`·`reviews/round-469-closing.md`, 계약은 `plan/lazy-memo/` 및 소스 DETAIL에 있습니다.

## 변경과 동치 확인

- W4는 pending targets를 한 번 라우팅하여 active ID Set과 issue 경로 해석을 각각 최대 한 번 수행합니다. 단일 대상은 원래 predicate를 쓰고, 복수 대상은 객체 동일성과 엄격히 짧은 조상 경로를 사용합니다. 같은 경로의 다른 stale 키는 제외하며 이탈한 target의 기록 경로는 유효합니다. 부모 경로 계산은 기존 `resolvePointer`의 Parent 분기를 사용합니다.
- W1 저장소는 `[node, ...(children ?? [])]`를 같은 사건 mask로 구독합니다. 구독 시 revision join을 한 번 계산하며 listener가 version을 먼저 올리고 통지합니다. 구독 중은 base 또는 base#version, 비구독 중은 원래 join이며 모든 listener를 해제합니다. node·children·disabled가 저장소 수명을 결정합니다.
- 순차 구현을 시험 파일 안의 oracle로 복사하고 disjoint·nested·root·stale 동주소·실제 detached target·inactive union/rejected host를 대조했습니다. validationErrors 내용과 순서·배열 참조, changed 합집합, combined 캐시 삭제, routed/global 참조를 비교합니다. 기존 라우팅 단위 시험 두 파일도 함께 통과합니다.
- W1은 render/subscribe 사이 변경·StrictMode·children 변경 및 이탈 listener·disabled 전환·부모 UpdateChildren·scripted render 횟수를 render와 react18 모두에서 확인합니다. 원래 같은 배열은 no-op이고 같은 issue의 새 배열은 추가 render를 발생시키는 관측을 유지합니다.

## 기준 red·특성화·mutation

- 기준 characterization18개 통과입니다. W4 active Set 생성 count는6, W1 전체 snapshot count는16으로 각각 `<=1` 검사가 실패했습니다. 구현 후 focused21개가 통과했습니다.
- M1 반복 target 라우팅 복구는 count6으로 실패, M2 동주소 포함 predicate는 stale-key 포함 여부로 실패, M3 부모 구독 제거는 UpdateChildren render 누락으로 실패, M4 unchanged base는 render 누락으로 실패했습니다. 각 변경을 byte hash로 복원하고 최종 소스로 다시 통과했습니다.
- 최초 hook 특성화는 새 배열까지 no-op으로 가정하여 실패했습니다. 코디네이터 승인 뒤 같은 배열과 새 배열을 나누어 실제 기준 횟수를 고정했습니다. 최초 W1 count probe의 provider 누락 실행은 유효 red로 쓰지 않으며, provider를 넣은 기준16회 실패를 사용합니다.
- 최초 M2의 순환 객체 diff 출력 지연 중 두 Vitest 실행이 잠깐 겹쳤습니다. 해당 실행을 중단하고 M2·M3·M4를 순차 재실행한 JSON만 최종 mutation 증거로 사용했습니다. 이후 모든 전체 테스트는 앞 프로세스 종료를 확인하고 하나씩 실행했습니다.
- 최초 전체 unit의 pointer isolation 실패3건은 기존 Parent 해석 재사용과 비포인터 snapshot 문자열의 template literal로 수정했습니다. 규칙은 바꾸지 않았으며 최초 실패와 집중 green·전체 재실행을 모두 보존합니다.

## 전체 관문

| 프로젝트 | passed | failed | pending | todo |
| --- | ---: | ---: | ---: | ---: |
| unit | 4249 | 0 | 0 | 1 |
| render | 1025 | 0 | 7 | 0 |
| react18 | 1023 | 0 | 9 | 0 |
| storybook | 254 | 0 | 0 | 0 |
| production | 21 | 0 | 0 | 0 |
| verify-unit | 4293 | 0 | 0 | 1 |
| verify-render | 1025 | 0 | 7 | 0 |

별도 importModel은2개 통과했습니다. lint는 `--max-warnings 0`, typecheck와 정식 build가 exit0입니다. build의 DEVELOPMENT_FLAG 및 세 GATE_SELECTION 출력 검사를 통과했습니다. dist는 저장소에서 추적하지 않는 생성물이며 소스 커밋에 넣지 않았습니다. 최종 번들 해시는 `raw/static-gates.json.gz`에 있습니다.

원장26개 검사의 기준 대비 새 불일치는0, 미인용은0→0입니다. 기존 tokens397 누락·plan ERROR-038 문제1개·문서 coverage 경고는 그대로입니다. FCA는 새 finding0·새 diagnostic0이며 기존566 findings,26 failed 및 indeterminate 축을 보존하므로 절대 PASS라고 판정하지 않습니다. verification 위반30도 기준과 같습니다. 기계 경로는 gzip 내용을 풀어 검사하여0건,23개 manifest 버전은 불변입니다.

의존성 설치 없이 기존 로컬 node_modules와 네 Winglet dist를 연결했고 package-local AJV8·플러그인 링크를 복구했습니다. 기존 Storybook addon bytes를 로컬에 두어 외부 setup URL 문제를 해결했습니다. 환경 변경과 최초 실패는 `raw/environment.json.gz` 및 진단 증거에 기록하며 제품 설정은 변경하지 않았습니다.

## 수락 측정 — 대기

W4 merged1000·single1000, W1 all1000·200회 single wave의 per-wave·비구독 snapshot의5셀을 준비했습니다. 최종 소스로15개 파일럿 프로세스가 정상 종료했고 baseline/control 번들 해시는 같습니다. 파일럿은3 warmup·5 runs의 실행 확인이며 수락 판정에 사용하지 않습니다. 전체12 warmup·60 runs 행렬은 실행하지 않았습니다.

측정 작업자는 scratch `accept/run.py --full`을 실행합니다. 최초15프로세스 약2–4분, 부적합 그룹을 모두 한 번씩 재시도하면 약4–8분을 예상합니다. 각 셀 control gap은 max(0.3ms,3%) 이내여야 하며 두 번째 부적합은 VOID입니다. W4와 W1은 각각 주 셀 중앙값10%·1ms 이상이며 control gap의2배를 엄격히 넘는 절감, 모든 보조 셀 max(0.05ms,5%) 이내 회귀라는 사전 규칙으로 독립 판정합니다. 닫힌 후보는 후속 지시에 따라 되돌립니다.

수락 결과: **PENDING — 코디네이터가 전체 측정의 수치·유효성·후보별 수용/종결을 기입합니다.**

## 증거 보존

`artifacts.json`은 원본·기계 경로 정규화본·gzip의 SHA256을 연결합니다. 숫자 표본·검사 상태·assertion은 유지합니다. 원본 경로는 로컬 scratch에 있고 영속 사본의 기계 경로만 정규화했습니다. 공개 API·버전·stamp·판정·reveal 정책은 그대로이며 push·게시·병합은 수행하지 않았습니다.
