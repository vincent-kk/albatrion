# L3-b — items 없는 배열의 끝 덧붙임

이 문서는 완료된 L3 실험의 원본 보고서와 수치를 보존한 기록입니다. 아래 구현 변경량·시험·빌드·FCA 결과는 당시 구현 작업의 결과이며, 이번 문서 작업은 지정된 결과 문서 다섯 개만 변경합니다. 제품 소스·시험·매니페스트·빌드 산출물·어댑터·INTENT·DETAIL 변경은 0건이고 새 측정·제품 게이트는 실행하지 않았습니다.

items와 prefixItems가 모두 없는 정적 branch 배열의 단독 push·insert(N)는 기존 배제 조건과 빈 children·사건·revision·스냅숏·extras 관측을 유지하면서, 호출 한정 덧붙임 증명으로 새 끝 자리만 확인하고 접두를 다시 증명하지 않습니다.

## 기준과 변경

- 작업 가지: `perf/schema-form-array-append-shortcut`
- 기준: `a55071005eeb3bb239e9717d7069749413d6299e` (`origin/feat/schema-form-08-review-and-perf`에서 새 가지 생성, yarn install 완료)
- 계약 커밋: `a8a71b65fb12b017a265dbe438ee0b1f31498aeb`
- 구현 커밋: `67964cc2106e2a2f262c83c058d741c36e32a7a3`
- 구현 PR: [#417](https://github.com/vincent-kk/albatrion/pull/417), `8e35b01fc`로 병합되었습니다.
- 기존 시험 기대값·파일 변경: **0건**. 새 시험은 16건입니다.
- 런타임: 6파일 **+61/−23줄**. 새 시험: 1파일 **+184/−0줄**. DETAIL: 3파일 +7/−7줄. 전체 10파일 +252/−30줄입니다.
- 공개 runtime export 목록은 전후 동일하며 캐시·전역 상태·노드/런타임 필드를 추가하지 않았습니다.

조정자의 명시적 답변에 따라 assembleArray의 extras append 분기와 대응 DETAIL 문장까지 범위를 확장했습니다. DETAIL 셋을 모두 코드보다 먼저 계약 커밋에 넣었습니다. 템플릿이 있는 배열의 기존 합성 경로는 유지합니다.

| 변경 파일 (`packages/canard/schema-form/` 기준) | 역할 |
| --- | --- |
| `src/core/engine/settle/DETAIL.md` | extras 배열의 빈 자식 선택 증명과 선택 공표 자격 |
| `src/core/engine/settle/arrangeFieldNodeItems/DETAIL.md` | append 자격·증명·수용 사본과 관련 거절 문장 |
| `src/core/engine/behaviors/arrayBehavior/DETAIL.md` | extras-only append hint의 합성 자격 |
| `src/core/engine/settle/arrangeFieldNodeItems/utils/arraySlots/admitsStaticArrayTail.ts` | append만 명시적으로 extras-only 자격을 요청 |
| `src/core/engine/settle/arrangeFieldNodeItems/utils/arraySlots/prepareArrayAppend.ts` | 아이템 없는 새 자리를 노드 생성 없이 증명 |
| `src/core/engine/settle/types/settlement.ts` | extras-only proof에서 entry/schema 부재 허용 |
| `src/core/engine/settle/utils/compute/childSelection/canReuseAppendedChild.ts` | 빈 children·새 extras 길이·dirty 부재의 고정 수 검사 |
| `src/core/engine/settle/utils/compute/childSelection/reuseArrayChildren.ts` | 아이템 없는 경우 새 선언을 공표하지 않음 |
| `src/core/engine/behaviors/arrayBehavior/utils/value/assembleArray.ts` | extras 끝 값 하나만 기존 local의 사본에 덧붙임 |
| `src/core/engine/settle/arrangeFieldNodeItems/__tests__/settle.array-extras-append.test.ts` | 호출 상한·전체 배달 비교·관측·제외 조건 |

## 경로 근거와 제한

기준 구현의 거절 지점은 `admitsStaticArrayTail.ts:34–38`의 extras 존재·item 템플릿 부재·children/itemCount 불일치, `prepareArrayAppend.ts:35–36`의 entry 부재입니다. 이후 `canApplyArrayTail.ts:23–35`와 `canReuseArrayChildren.ts:65`의 자리 순회가 접두를 다시 증명합니다. `assembleArray.ts:80`의 append hint 역시 템플릿과 노드를 요구하여 일반 합성의 전체 자리 순회로 돌아갔습니다.

변경 후 `admitsStaticArrayTail.ts:22`의 extrasOnly 분기는 append가 인수 true를 넘긴 경우만 허용합니다. pop·가운데 insert/remove는 기본 false 자격을 그대로 사용합니다. `canReuseAppendedChild.ts:41`은 아이템 없는 새 자리·빈 children·N+1 extras·dirty 자식 부재만 확인하고, `reuseArrayChildren.ts:25`는 공표할 자식 없이 반환합니다. `assembleArray.ts:78`의 새 분기는 아이템과 prefixItems가 모두 없고 children이 비어 있는 경우에만 끝 값을 읽습니다. applyArrayTail의 기존 빈 children 공표와 스냅숏·extras 복사는 유지합니다.

prefixItems 튜플 뒤의 extras 꼬리, 아직 선언된 튜플 자리, 게이트·식·파생·감시·의존·상태 키·가상·union·터미널 호스트·리터럴 아닌 기본값·제어 기본값·unsetValue·injectTo·재귀 확장, 통째 raw, 잠복/미공표 잠복 변경, misfit, 배치·방문, 떼어진/비활성/배달 미초기화 호스트, omitTrailing, 배열이 아닌 직전 local/emit 등의 기존 제외 조건은 유지합니다. 로드·자동 쓰기는 이 단독 공개 동사 자격으로 넓히지 않습니다. remove(0)의 extras splice는 수정하지 않았습니다.

## 검증

| 명령 | 결과 |
| --- | --- |
| `yarn workspace @canard/schema-form typecheck` | 종료 코드 0 |
| `yarn workspace @canard/schema-form lint` | 종료 코드 0 |
| `yarn workspace @canard/schema-form test --run` | 753파일 통과, 4,747시험 통과, 기존 todo 1건; 114.26초 |
| `yarn workspace @canard/schema-form build` | 종료 코드 0, ESM/CJS·타입·해시 생성 |

새 시험은 변경 전 extras append 자격이 거절되어 8건이 실패하는 것을 먼저 확인했습니다. 최종 16건이 통과하며 기존 `compareArrayAppend` 픽스처로 일반 길을 강제한 트리와 **전체 배달 기록 차이 0**입니다. 빈 배열·undefined/NaN·성긴 입력, 중첩 호스트의 조상 배달, sparse snapshot, push·insert(N) 연속 쓰기를 포함합니다. 값·순서·반환값·이벤트 종류/payload/순서·revision·default 원천과 보관한 children/local/emit/snapshot의 내용 불변을 비교합니다. 새 빈 children 참조, UpdateChildren 비트와 revision 증가, 새 extras·snapshot 참조는 별도 단언합니다. 호출자 입력과 payload 내용도 유지됩니다.

첫 전체 실행은 Storybook IME 두 사례가 입력 클릭 단계에서 약 14.7초 시간 초과되어 751파일 통과/2파일 실패였습니다. 코드·시험 변경 없이 해당 두 파일 단독 재실행은 2파일·5시험 모두 통과했고(2.60초), 이어 다른 무거운 검증이나 소스 변경 없이 같은 전체 명령을 다시 실행해 위의 완전 통과를 확인했습니다. 최초 실패를 배달 차이로 분류하지 않으며 시험 기대값은 수정하지 않았습니다.

## 상수 작업 계측

수용된 출력·로드 스냅숏·extras 배열 사본은 O(N)으로 남습니다. 새 빈 children 배열도 계속 공표합니다. 없앤 것은 사본을 위한 원소 복사가 아니라 자리별 템플릿·접두 선택 재증명입니다.

| 쓰기 | N | 수정 전 getItemEntries | 수정 후 getItemEntries |
| --- | ---: | ---: | ---: |
| push | 1,000 | 3,003 | 2 |
| push | 8,000 | 24,003 | 2 |
| insert(N) | 1,000 | 3,003 | 2 |
| insert(N) | 8,000 | 24,003 | 2 |

계측은 Node의 별도 빌드 사본에서 시간 구간의 getItemEntries 진입을 센 것입니다. 새 시험은 정확한 숫자를 단언하지 않고 1천·8천 모두 getItemEntry/getItemEntries ≤4와 일반 접두 증명 호출 ≤0의 같은 상한을 검증합니다.

## 시간 측정

2026-10-18 arm64, Node **v26.12.0** (`{node-home}/bin/node`), Bun **1.4.3**, `NODE_ENV=production`입니다. 기준 dist는 a55071005에서, 수정 dist는 현재 작업 폴더에서 지정 build로 새로 만들었습니다. 원본 first-batch README와 A3를 읽고 `first-batch/b-a2`의 config·bench-common을 변경 없이 복사했습니다. A의 B0 스키마 `{h: {type: 'array'}}`, 입력·정답·drain·별도 작은 트리 warm·writeOnce의 동기 완료/값/children/onChange 검사를 그대로 사용합니다. insert(N)은 push와 같은 기대 끝 배열·반환 길이를 쓰고 customInvoke만 host.insert(N, N)로 제공합니다.

준비 20회·표본 100회/레인, Node 1차→Bun 1차→Node 2차→Bun 2차 순서입니다. 2차에는 판·N·동사 순서를 뒤집었습니다. 측정 창에는 다른 게이트·빌드를 실행하지 않았습니다. 모든 표본의 시간 밖 정답 검사가 통과했고 동기 onChange는 한 번입니다. 표의 ms는 두 바퀴 200표본의 합친 중앙값이며 대괄호는 바퀴별 중앙값의 min–max입니다. 계측 사본의 시간은 성능 근거에 포함하지 않습니다.

### Node v26.12.0

| 장면 | N | 쓰기 | 수정 전 ms [두 바퀴 min–max] | 수정 후 ms [두 바퀴 min–max] | 줄어든 % |
| --- | ---: | --- | --- | --- | ---: |
| B0 | 1,000 | push | 0.10796 [0.09825–0.13338] | 0.03046 [0.02087–0.04229] | 71.8 |
| B0 | 1,000 | insert(N) | 0.10100 [0.09487–0.10700] | 0.02429 [0.02119–0.02527] | 75.9 |
| B0 | 8,000 | push | 0.65329 [0.64965–0.65910] | 0.06269 [0.06160–0.06329] | 90.4 |
| B0 | 8,000 | insert(N) | 0.66306 [0.65123–0.67944] | 0.07192 [0.05798–0.08929] | 89.2 |

### Bun 1.4.3

| 장면 | N | 쓰기 | 수정 전 ms [두 바퀴 min–max] | 수정 후 ms [두 바퀴 min–max] | 줄어든 % |
| --- | ---: | --- | --- | --- | ---: |
| B0 | 1,000 | push | 0.11800 [0.10815–0.12990] | 0.02829 [0.02167–0.03437] | 76.0 |
| B0 | 1,000 | insert(N) | 0.11050 [0.10723–0.11369] | 0.03087 [0.02721–0.03304] | 72.1 |
| B0 | 8,000 | push | 1.81648 [1.76121–1.84685] | 0.07977 [0.07362–0.08544] | 95.6 |
| B0 | 8,000 | insert(N) | 1.77442 [1.75108–1.78894] | 0.08067 [0.06952–0.09700] | 95.5 |

전체 쓰기 시간은 O(1)이 아닙니다. 수용 사본 비용은 길이에 비례하고, 그 외 자리별 접두 재증명 호출은 1천과 8천에서 동일한 2회입니다.

원시 결과·측정 사본·진입 스크립트는 작업 폴더의 `.seiri/tasks/l3b-array-append-shortcut/run/`에 있으며 `node-1.json`, `bun-1.json`, `node-2.json`, `bun-2.json`, `counts.json`입니다. `timing.mjs`를 각 런타임에서 1차 기본·2차 `--reverse`, 별도 Node 계측은 `--counted`로 실행했습니다. Seiri 임시 자료는 정리 대상이므로 이 문서가 영속 측정표이며 임시 원자료의 영속 보관을 뜻하지는 않습니다.

원본 dist SHA-256:

- 기준: `3a1ddc54614e8677ccc6d7ef4456c5ceb7b73c39b3a70a36e6a2e8320f456b43`
- 수정: `c84c2ca56e69f4e9952117ad12352a037ecab2f6ec63c8f4cd4e2346f0517c24`

## FCA 점검

facts 2,590개가 exact인 상태에서 전체 scan·6-scope validate·verification을 같은 snapshot `a94b25944bb6e88eef2394a0790939a3dbfe2c3cd935ee80bfd44254e0c5d0a0`으로 실행했습니다. 중복 제거 finding은 384건으로 앞 작업과 같은 수이며, 이번 변경 파일의 finding은 0건입니다. 새 시험은 정확한 16건의 test-record로 소유 fractal 안에 분류되었습니다. 저장소 전반의 문서 계약·미해석/미소유 의존 진단 130건과 확인된 위반 때문에 전체 판정 FAIL/분석 완전성 indeterminate이며 통과로 보고하지 않습니다. 범위 밖 문서는 수정하지 않았습니다.

Scan complete: 384 findings

## 비교 형식과 측정 한계

[368라운드](../../reviews/round-368-owner-answers.md)의 열 순서와 부호에 맞춘 표입니다. 기존 감소율 표는 원본 그대로 보존하며, 아래에서는 느려짐을 +, 빨라짐을 −로 씁니다. ms와 점 변화율은 기존 표와 같은 두 바퀴 200표본의 합친 중앙값에서 계산합니다. 점 변화율은 `(수정 후 합친 중앙값 / 수정 전 합친 중앙값 − 1) × 100`입니다. 대괄호는 ms에서는 바퀴별 중앙값의 최소–최대, 변화율에서는 같은 바퀴끼리 계산한 `(후/전 − 1) × 100`의 최소–최대입니다. 합친 중앙값의 비율은 바퀴 비율의 평균이 아니므로 점 변화율이 바퀴 범위 밖일 수 있습니다. 범위는 신뢰구간이 아니며, 바퀴 변화율이 0을 가로지르면 측정 가능한 차이가 없는 것으로 읽습니다.

옛 판 `0.16.1`은 이 장면의 items 없는 배열 스키마를 지원하지 않아 옛 판 ms와 옛 판 대비 비율을 `미지원`으로 구별합니다. 근거는 [첫 묶음 측정의 A3 조사](first-batch-measurement.md)와 [400라운드](../../reviews/round-400-closing.md)입니다. 지원되는 장면의 세 판 완전 비교는 같은 창의 옛 판 표본이 없어 미검증입니다.

| 런타임 | 장면 | 옛 판 0.16.1 ms | 수정 전 ms [바퀴 min–max] | 수정 후 ms [바퀴 min–max] | 수정 전/옛 판 ±% | 수정 후/옛 판 ±% | 수정 후/수정 전 ±% [바퀴 min–max] |
| --- | --- | --- | --- | --- | --- | --- | --- |
| Node v26.12.0 | B0 N=1,000 push | 미지원 | 0.10796 [0.09825–0.13338] | 0.03046 [0.02087–0.04229] | 미지원 | 미지원 | -71.8 [-78.8–-68.3] |
| Node v26.12.0 | B0 N=1,000 insert(N) | 미지원 | 0.10100 [0.09487–0.10700] | 0.02429 [0.02119–0.02527] | 미지원 | 미지원 | -75.9 [-77.7–-76.4] |
| Node v26.12.0 | B0 N=8,000 push | 미지원 | 0.65329 [0.64965–0.65910] | 0.06269 [0.06160–0.06329] | 미지원 | 미지원 | -90.4 [-90.7–-90.3] |
| Node v26.12.0 | B0 N=8,000 insert(N) | 미지원 | 0.66306 [0.65123–0.67944] | 0.07192 [0.05798–0.08929] | 미지원 | 미지원 | -89.2 [-91.1–-86.9] |
| Bun 1.4.3 | B0 N=1,000 push | 미지원 | 0.11800 [0.10815–0.12990] | 0.02829 [0.02167–0.03437] | 미지원 | 미지원 | -76.0 [-80.0–-73.5] |
| Bun 1.4.3 | B0 N=1,000 insert(N) | 미지원 | 0.11050 [0.10723–0.11369] | 0.03087 [0.02721–0.03304] | 미지원 | 미지원 | -72.1 [-74.6–-70.9] |
| Bun 1.4.3 | B0 N=8,000 push | 미지원 | 1.81648 [1.76121–1.84685] | 0.07977 [0.07362–0.08544] | 미지원 | 미지원 | -95.6 [-95.8–-95.4] |
| Bun 1.4.3 | B0 N=8,000 insert(N) | 미지원 | 1.77442 [1.75108–1.78894] | 0.08067 [0.06952–0.09700] | 미지원 | 미지원 | -95.5 [-96.0–-94.6] |

이 표의 전후 비율은 이 실험의 교대 두 바퀴 안에서만 유효합니다. 다른 L3 실험·첫 묶음·재측정 창의 절대 시간과 이어 붙이거나 개선율을 누적하지 않습니다. 내부 export 사본·계측 사본·원본 dist는 서로 구별하고, 함수별 계측 점유율은 달성 가능한 절감량으로 읽지 않습니다.

비계측 내부 export 사본의 SHA-256은 기준 `7245fdaaf98b6db92d4215179715001c8331274c5697c7015c9e21a9aa14a139`, 수정 `47ac2e42358841b4372c5482c8ceb897289278c7db7345317690810dba6ce9b8`입니다. 보존된 원본 사본에서 문서화 시 다시 계산했으며 원본 dist 해시와 구별합니다. 당시 Winglet 공통 dist 해시의 별도 기록은 미검증이므로 현재 설치물의 해시로 과거 기록을 대신하지 않습니다.

[369라운드](../../reviews/round-369-owner-answers.md)의 옛 판 종료 기준은 기대 onChange와 루트·변경 자식의 값·경로가 적용된 시점 중 늦은 쪽입니다. 이번 실험에는 그 기준의 동일 창 옛 판 행이 없어 세 판 비교를 완료했다고 주장하지 않습니다. 새 판의 종료 경계와 정답 검사는 위의 해당 러너 기록에 한정합니다.

## 근거와 남은 검증

구현 병합과 결과 해석의 근거는 [404라운드 닫기](../../reviews/round-404-closing.md)의 8e35b01fc, [첫 묶음 측정](first-batch-measurement.md), [400C-02](../../reviews/round-400-closing.md), [인계 문서](../../AGENT-HANDOFF.md)입니다. 구현 당시 커밋과 실제 측정 사본의 SHA-256을 구별하며, 구현 PR 본문·검토 기록은 보강 근거로만 사용합니다.

보존된 원시 JSON의 표본을 다시 계산해 기존 표를 대조했으며 새 표본을 만들거나 누락 표본을 복원하지 않았습니다. 기존 보고서의 ms·비율·바퀴 범위·호출 수·시험 수·해시와 실패 기록은 유지했습니다. 원시 자료는 위의 작업 폴더 임시 경로에 있고 이 문서 PR에 포함되지 않으므로, 체크아웃만으로 원자료까지 확보된다고 주장하지 않습니다. 정확한 UTC 측정 시작·종료 시각은 기존 보고서와 JSON에 없어 미검증입니다.

M3 소유자 수용은 아직 남아 있습니다. 동일 창의 옛 판·수정 전·수정 후 dist를 같은 관측 완료 기준으로 재는 368·369의 완전 비교와 정상동작 종합 검증은 M3에서 수행해야 합니다. 옛 판 대비 회귀나 계약상 남는 비용을 이 문서로 새로 수용하지 않으며, 문서 독립 검증과 최종 병합은 조정자에게 남깁니다.
