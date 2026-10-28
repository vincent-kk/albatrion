# B12 — 나감 보존값 resolver

제품 후보는 `652ddf6eede10a1852f9b568444b935712fc0dc0`, 기준은 B11 병합 머리 `4d0fa4a12d5a9062a83c705076f2928e600d671c`입니다. 자동 쓰기 합집합 시험을 포함한 최종 머리의 제품 관문은 모두 통과했습니다. 첫 창은 후보 결함으로 무효 중단했으며 두 번째 창은 외부 CPU로 환경 중단됐으며 창 3도 장치 경로 검사에서 표본 없이 중단됐으며 장치 수정 뒤 창 4는 완주하여 필수 채택 관문을 모두 통과했습니다. 독립 차분 검토는 P1·P2 없이 CONDITIONAL PASS입니다.

## 구현과 계약

| 항목 | 결과와 근거 |
| --- | --- |
| 1. 타입·키 | `InactiveValue<V>`·`InactiveValueResolver<V>`·`InactiveValueContext`를 공개했습니다. node·fields·fragment에 열 번째 키 `inactiveValue`를 허용하고 문자열은 리터럴로 유지합니다. 동일 층의 literal true `unsetOnInactive`와 동거하면 전용 경고를 냅니다. 청사진 시험 9개는 구현 전 `UNKNOWN_GROUP_KEY`로 실패하고 구현 뒤 통과했습니다. |
| 2. 보존값 | 직전 커밋의 값·부모/루트 값·스키마·폼 context로 해석하고 retain 뒤, restored raw 전 슬롯 JSON whole replace로 적용합니다. node→fields→fragment, 조상→자손 순서를 지킵니다. 리터럴·함수·undefined·층·재진입·합성·명시값 시험 13개가 통과했습니다. |
| 3. 등록 | `node.onInactive`는 인스턴스별 Map/Set과 idempotent 해제를 사용합니다. 등록 순서대로 모두 실행하고 마지막 정의된 결과를 채택하며 모두 undefined이면 선언을 적용합니다. throw는 노드 override 전체를 취소합니다. 수명·context 시험 10개, 해석 경로 미진입 비용 시험 2개가 통과했습니다. |
| 4. 거부·실패 | resolver 중 setValue·배열 여섯 동사·batch·resetSubtree를 진입 전에 거부합니다. 개발 경고와 운영 침묵을 구별하며 예외는 정착 실패로 기록하고 나감은 커밋합니다. 거부 시험은 가드 전 2개가 batch 실행으로 실패했고, 가드 뒤 예외 격리·보고 재귀까지 6개가 통과했습니다. production은 ESM·Node ESM·CJS의 침묵을 직접 확인했습니다. |
| 5. 배달 | 기존 79장면·429관측점의 A/B 차이 0, 마운트 6장면·12관측점 차이 0입니다. 새 기능 7장면·21관측점은 후보 계약으로 별도 단언했습니다. |
| 6. 문서·공개 계약 | 한·영 SPECIFICATION의 controls·노드·마이그레이션을 갱신했습니다. 공개 이름·노드 멤버 목록·controls 형·ERROR-164 기대값에 새 계약을 명시했습니다. 원장 정본은 코디네이터의 라운드 마감 대상입니다. |

자동 쓰기 억제, 실패·예산 억제, load/reset 범위, throwing gate, 같은 정착에서만 진입했던 인스턴스의 퇴장에서는 두 resolver를 실행하지 않습니다. 폼 dispose·언마운트·배열 아이템 삭제·재진입 소멸에서도 실행하지 않습니다. 지움 배열의 keep 자손은 새 결과가 빈 원본을 채울 때도 보존하고 압축된 새 주소에 결과를 씁니다. 이 경계 시험 11개와 공개 렌더 시험 2개가 통과했습니다.

## 최종 제품 관문

최종 제품 바이트에서 build·typecheck·lint, 다섯 프로젝트, verify와 격리·첫 파서 검사를 실행했습니다. 최종 다섯 프로젝트는 순차 실행했습니다. 초기 context fixture와 import 누락, 시험 배치 오류는 수정한 뒤 새 후보 전체 관문을 다시 실행했습니다. 실행 인자·시각·종료값과 번들 해시는 개수 기록에 묶었습니다.

| 관문 | 결과 |
| --- | --- |
| build·typecheck | 통과, development flag·shipping mode 검사 포함 |
| lint | 통과 |
| unit | 594파일, 3,949 통과·기존 todo 1 |
| render | 132파일, 768 통과 |
| storybook | 100파일, 251 통과 |
| react18 | 132파일, 768 통과 |
| production | 10파일, 21 통과 |
| test:verify | 731파일, 4,761 통과·기존 todo 1 |
| 격리·첫 쓰기 | 2파일, 10 통과 |

근거는 [관문 원시](raw/b12/gates/)와 [개수 기록](raw/b12/gates/counts.json)에 있습니다. 추적되는 dist 파일은 0개이므로 생성 산출물 커밋은 없습니다.

## 선언 차분

분산 d.ts의 재수출을 따라 공개 이름 94→97개를 확인했습니다. 추가 이름은 resolver 타입 셋이며 제거는 없습니다. 기존 이름 중 `FormWarningCode`에 `InactiveValueWithUnsetOnInactive`·`WriteInInactiveResolver`가 더해졌습니다. FieldNode의 `onInactive`, JSONSchema controls의 `inactiveValue`도 선언 checker로 확인했습니다. 릴리스 전 선언 차분에는 인라인 함수 문맥 형을 유지하는 리터럴 종류·resolver 합집합도 기록했습니다. 선언 차분 0 관문은 승인된 면제이며 실제 차분은 [선언 원시](raw/b12/declarations/)에 있습니다.

## 배달 코퍼스

최종 후보의 확장 러너가 보존한 기존 79장면·429관측점의 A/B 차이는 0입니다. 새 literal·function·listener·both·ancestor/descendant·clear-warning·rekey의 7장면은 before·exit-after-drain·reentry-after-drain을 관측합니다. 기준 머리는 새 키와 멤버를 작성할 수 없으므로 이 21관측은 후보 공개 계약의 단언이며 기존 A/B 동일성 수에 합산하지 않습니다. 총 관측 범위는 86장면·450관측점, 별도 mount는 6장면·12관측점입니다. [최종 확장 러너 원시](raw/b12/delivery/)에 기록했습니다. 초기 후보의 기존 러너 원시는 [초기 후보 기록](raw/b12/candidate-f69aa13/delivery-before/)에 따로 보존합니다.

## FCA 점검

전체 facts 1,649개를 추출·수용한 뒤 documents·nodes·entry-points·boundaries·dag·verification을 점검했습니다. snapshot hash는 세 점검에서 일치합니다. 판정은 **indeterminate**이며 검증 규칙 12건이 실패하여 미통과입니다. B11 기록과 같은 202개 finding이며, 정확히 확인된 오류는 변경하지 않은 FieldProxy→FieldInputSlot→FieldProxy 순환입니다. 변경 코드에서 새로 보고된 finding은 0입니다. 변경 문서에 남은 `#/` 토큰 진단도 기존 문장입니다. 이를 PASS로 바꾸지 않았으며 [FCA 원시](raw/b12/fca/)에 보존했습니다.

## 측정 창

UTC 2026-10-28에 코디네이터 허가를 받고 시작했습니다. A/B 불변 입력과 해시, 무시간 A44/B44·legacy36 적재, AJV8 dist를 확인한 뒤 B11 정식 마커와 B8 개별 PID 시작 지연을 재사용했습니다. 22행·레인별 10프로세스·20예열/100표본·legacy quality 구성입니다.

첫 창은 UTC 19:12:46.518 시작, UTC 19:17:10 후보 무효 중단했습니다. 부분 원시는 [무효 창 기록](raw/b12/window-1-invalid/)에 보존합니다. 두 번째 창은 31ff8741c로 UTC 20:07:32.912에 시작했으나 비교 6행·123프로세스 뒤 bulk-flat-2000/B 시작 전 외부 CPU 관문에서 중단됐습니다. mds PID394의 마지막 3초 평균은 57.85%이며 120001.996ms·15회 지연을 소진했습니다. 코디네이터는 환경 실패로 분류했습니다. 재시도하지 않았고 단계 계수·힙·retention에 도달하지 못했습니다. [부분 원시](raw/b12/window-2-incomplete/)를 참고 수치로 보존합니다.

장치 수정은 공용 tools/window가 소유합니다. 준비 루트와 별도 stage 원시 루트는 .noindex로 끝나며 원시는 그 안에서만 씁니다. 외부 CPU의 3초 평균30% 기준·5초 간격은 유지합니다. Spotlight 계열만 전체600초까지 기다리고 일반 외부 부하는 누적120초 한도를 동시에 적용합니다. 모든 대기는 benchmark 적재 전에만 수행하며 표본 재시도는 없습니다. 가상 시계 시험은 기존 mds120초 실패를 먼저 확인한 뒤 Spotlight600초·일반120초·혼합120초·복구·자기 PID 제외와 이전 경로 호환이 통과했습니다. 창 3은 아래와 같이 장치 실패로 끝났으며, 창 4는 장치 수정과 최종 관문·예행 뒤 새 허가를 받아 완주했습니다.

## 독립 검토

코디네이터에게 최종 제품 SHA와 관문 개수, 계약·규칙, 검토 범위와 위험을 전달했습니다. 독립 claude 검증의 Delta 5 판정은 CONDITIONAL PASS(P1 0·P2 0·P3 4)입니다. 필수 조건인 창 완주·채택을 충족했고 결과와 원시는 이 보고 커밋에 포함합니다. 판정 원문은 [독립 검토](raw/b12/independent-review.md.gz)에 보존했습니다.

첫 후보 f69aa1388의 창은 재키 시 n1 대신 n0를 읽는 회귀를 확인하여 코디네이터 허가로 candidate-invalid 중단했습니다. 환경 실패가 아닙니다. 이전 주소로 value·dataPath·parentValue를 읽도록 고친 시험 3개가 통과했습니다. schema 동일성과 rootValue 단언은 수정 전에도 통과하는 보조 단언입니다. 최초 주소 Map은 이동과 설정된 resolver가 함께 있는 호출에만 한 번 만들며 중복 스키마 포착은 제거했습니다. 별도 배열 모듈 시험은 applyArraySlots 1회·applyArraySplice 0회를 확인합니다.

독립 검토의 P2 인라인 resolver 문맥 형은 TS7006으로, 뒤 바퀴 지움 조상은 resolver 호출 1회로 실패를 재현했습니다. 수정 후 둘 다 통과했습니다. 오래된 해제 함수의 새 등록 삭제, 오류 보고기 재귀(628회), 종료 쓰기의 명시값 무시도 각각 실패 우선 시험 뒤 수정했습니다. 명시 종료값은 두 resolver보다 우선하며 batch 명시·생략과 루트 생략을 구별합니다. 나가는 group의 whole 입력 {}는 생략된 x까지 덮고 merge의 {}는 x를 덮지 않습니다. whole 회귀가 수정 전 resolver 1회로 실패했고 whole·merge 시험 각 하나가 수정 뒤 통과했습니다. wrong-kind 객체는 보존 후 재진입 misfit을 검증합니다. 숫자 42는 기존 string 해석에서 문자열로 변환되므로 이 회귀에는 객체 값을 사용했습니다.

P3의 상수 재사용·예외 throw와 거부 명령 범위 문서·비용 설명을 반영했습니다. 과거 60a4f3fb8은 test 표제에 무관한 import 서식과 동작 중립 cost 검사 재배치를 포함했으며, 새 후보에서 관련 import 서식을 원래대로 되돌렸습니다.

## 환경과 커밋

제품 빌드·시험은 Node 24.20.0, 측정과 선언 비교는 Node 26.12.1을 사용했습니다. 의존 dist와 AJV8 plugin은 기존 workspace 소스로 로컬 빌드했으며 다운로드·설치는 수행하지 않았습니다. 측정 환경의 CPU·Bun·OS 값은 창 입력과 최종 요약에 기록합니다.

항목별 구현은 `93864e05a`(타입·키), `fafed7469`(보존값), `aedd19b5c`(등록), `76f7b4a70`(쓰기 거부), `60a4f3fb8`(문서·공개 계약), `22dd803c0`(배달·장치), `f69aa1388`(context 시험 fixture), `014946bbc`(재키 주소), `8caa76c23`(독립 검토 수정), `39629cd4d`(타입 import), `e9fe84669`(배열 시험 배치), `77a86d127`·`4ad8e49f0`(선언 형 증거), `31ff8741c`(whole/merge 명시값), `78b467b88`(입력 병합 coverage), `bd7fd658b`·`85b687d83`(Spotlight 격리 장치), `00ed5f3aa`(시험 fixture), `d84e74d5a`(noindex 입력 검증), `ea2bef3e1`(공용 정책 참조), `7af6a5d3c`(배치 덮임 합집합), `6d178eef8`(전체 CLI noindex 경로), `652ddf6ee`(자동 쓰기 합집합 시험·coverage TSDoc)로 나누었습니다.

## 후속 범위

- P3-14: 리터럴 object 멤버 때문에 명시적으로 매개변수 형을 붙인 다른 함수 시그니처도 키 형에 할당될 수 있습니다. 인라인 공통 문맥 형은 검증했으며 더 엄격한 리터럴 객체 형은 후속 검토로 남깁니다.
- P3-17: 기존 subscribe 해제 함수에도 오래된 해제가 새 등록 집합을 지울 수 있는 같은 패턴이 있습니다. B12 이전 코드이며 이번 범위에서는 바꾸지 않았습니다.

차분 2의 입력 병합(P2-3)은 resolver 0회, multi-write batch 병합(P3-13)은 1회로 실패를 재현했습니다. 수정 후 두 시험의 호출·재진입 단언과 관련 시험55개가 통과했습니다. 기본 merge 사례는 over-coverage 방지 회귀이며 이전 수정 없이도 통과하는 보조 시험입니다.

.noindex 경로의 입력 검증기 ENOENT도 읽기 전용 호출로 먼저 재현했고 getStageRoot 적용 뒤 동일 준비 입력의 14개 번들·해시 검증이 통과했습니다. 이 검사는 정식 마커나 측정 표본을 만들지 않았습니다.

## 배치 덮임 합집합

같은 배치의 whole 뒤 빈 merge가 오는 경우, 이전 후보는 resolver를1회 호출해 앞서 명시된 undefined를 새 값으로 되살렸습니다. 코디네이터가 덮임은 배치 합집합이라고 확정하여 기존 replacePaths의 실제 whole 범위를 우선하도록 고쳤습니다. 실패 우선 시험1개와 영향56개가 통과했으며 이 동작 수정은7af6a5d3c이며 최종 후보는652ddf6ee입니다.

최종 머리의 별도 격리·첫 쓰기 시험2파일10개가 통과했고 siblings-0·oneOf-80 첫 쓰기의 full-parser 호출은0입니다. 최종 선언94→97, 기존 배달79/429 차이0·새7/21 단언·mount6/12 차이0도 다시 확인했습니다.

세 번째 창은 `7af6a5d3c`로 UTC21:02:27.340에 시작했으나3초 뒤 alternate 단계에서 공용 readConfig가.noindex 실행 경로를 거부해 종료값1로 중단됐습니다. 비교 프로세스는0개이며 재시도하지 않았고 정식 마커는 소진됐습니다. 장치 경로 검증 실패로 분류했으며 [장치 실패 원시](raw/b12/window-3-device-failure/)에 보존합니다.

장치 수정 `6d178eef8`은 공용 CLI·profile과 이전 장치의 검증기 및 stage 주소를 모두 같은 getStageRoot 계약에 맞췄습니다. 최종652ddf6ee에서 실제 alternate CLI를 별도 디렉터리의1행·1프로세스·예열1·표본1로 실행해 종료값0을 확인했습니다. 정식 마커는 생성하지 않았으며 무효 suffix도 읽기 전용 검사로 거부했습니다. 이는 채택 수치가 아닌 장치 예행입니다. 자동 쓰기 합집합 회귀를 포함한 명시값 시험은9개이며 최종 전체 관문과 선언·배달도 다시 통과했습니다.

## 창 4 최종 판정

후보 `652ddf6ee` 대 기준 `4d0fa4a12`를 UTC 2026-10-28 21:25:04.718부터 22:00:28.702까지 한 번 실행했습니다. 비교 22행·440프로세스, 단계 18·보조 단계 18프로세스, Node/Bun 힙 4프로세스, retention 3프로세스가 종료값 0으로 끝났고 창 종료 CPU 검사도 유효했습니다. Node 26.12.1·Bun 1.4.4·Apple M1 Max·arm64·Darwin 27.0.0 환경입니다. 정식 재시도는 없었습니다.

| 필수 관문 | 관측 | 판정 |
| --- | --- | --- |
| legacy quality | 18행 비율 0.999959 | 통과 |
| TEST-073 | 주 비교 회귀 0건 | 통과 |
| oneOf ledger | A 중앙값 177.834µs·폭 7.333µs, B 177.354µs | 통과 |
| siblings ledger | A 중앙값 83.895µs·폭 1.729µs, B 85.542µs≤85.625µs | 통과 |
| Node 힙 | B 중앙값 1,439.973 bytes/node≤A 최대 1,895.474 | 통과 |

ledger 관문은 B 중앙값이 A 중앙값+자체 폭 이내인지 봅니다. 최종 판정은 **채택**입니다. [정식 원시와 요약](raw/b12/window-4/)에 모든 비교 표본·명령·CPU 검사·단계 표본·힙 결과를 보존했습니다. 원본 V8 snapshots는 외부 장치에 보존하고 저장소에는 retention의 dominator 관측을 기록했습니다.

아래 값은 프로세스별 최소 지연의 중앙값(ms)입니다. 모든 행의 속도 개선 판정은 unproven이며 이를 개선으로 주장하지 않습니다. TEST-073의 주 비교 회귀와는 다른 지표입니다.

| 행 | A 전체 | B |
| --- | ---: | ---: |
| single-flat-1000 | 0.092062 | 0.087354 |
| mount-oneOf-80 | 2.328396 | 2.331520 |
| mount-flat-1000 | 2.152209 | 2.162771 |
| mount-nested-d6-f4 | 16.339771 | 16.321437 |
| single-nested-d6-f4 | 0.181896 | 0.182937 |
| switch-oneOf-80 | 0.347188 | 0.376375 |
| bulk-flat-2000 | 1.846667 | 1.785687 |
| bulk-nested-d6-f4 | 4.003542 | 4.045313 |
| switch-discriminator-80 | 0.240333 | 0.249562 |
| switch-if-80 | 0.392458 | 0.390187 |
| switch-nested-oneOf-20 | 0.578396 | 0.596063 |
| switch-siblings-0 | 0.104500 | 0.106500 |
| switch-siblings-100 | 0.286209 | 0.296250 |
| switch-siblings-1000 | 2.062999 | 2.092021 |
| switch-siblings-4000 | 6.760541 | 6.692500 |
| leaf-gate-250 | 0.033667 | 0.032916 |
| leaf-gate-1000 | 0.033833 | 0.034312 |
| leaf-gate-4000 | 0.898666 | 0.895853 |
| leaf-gate-8000 | 1.568333 | 1.566396 |
| wave-1000 | 1.707542 | 1.722125 |
| single-flat-1000-subscribed | 0.086646 | 0.089208 |
| switch-payload-12 | 0.583604 | 0.577396 |

보조 진단: siblings unwrapped 중앙값은 A 72.500µs·폭 0.521µs, B 75.291µs로 폭을 넘었습니다. Bun 힙은 B 2,245.174 bytes/node>A 최대 2,245.061로 0.114 bytes/node 초과했습니다. 개별 stage의 자체 폭 초과는 markWrite(oneOf·siblings), everythingElse(oneOf·siblings), assembleObject(payload), selectChildren(siblings)의 6건입니다. 모두 필수 채택 관문과 구분하여 judgement 원시에 보존했습니다.

| finalizeExits self | A 중앙값 µs | B 중앙값 µs | 변화 |
| --- | ---: | ---: | ---: |
| switch-oneOf-80 | 10.667500 | 10.958500 | 2.728% |
| switch-payload-12 | 17.603000 | 17.499500 | -0.588% |
| switch-siblings-0 | 0.000000 | 0.000000 | 0µs |

self는 보조 타이머를 포함한 진단값이며 개선 요구 관문이 아닙니다. retention에서 unread→read의 slot Map 독점 보존 bytes는 oneOf 4,784→5,104, payload 16,616→17,192, siblings 0→0이며 reset 뒤 host는 모두 0개입니다. 독립 snapshot의 숫자 heap ID 일치는 객체 생존을 증명하지 않으며 외부에서 보존한 detached node와 공유 blueprint는 이 추정 밖입니다.

## Delta 5 후속 정리

- P3-26: 공용 readConfig는 /pair·/stages 뒤의 .noindex도 받아들입니다. 이 경로를 만드는 호출자는 없으며 규칙을 좁히는 수정은 후속으로 남깁니다.
- P3-27: 창 종료 뒤 최종 머리에서 B4-2·B6 합성 검사와 공용 quiet 가상 시계 검사를 다시 실행해 모두 통과했습니다. 현재 머리의 로그를 review-fixes에 별도 보존했습니다.
- P3-28: 자동 쓰기 합집합 시험은 7af6a5d3c의 동작을 고정하는 시험이며 실패 재현 없이 추적으로 확인했습니다. 최종 머리에서 녹색 9개에 포함됐습니다.
- P3-29: 예행 명령은 아래에 기록합니다. 잘못된 suffix에 대한 오류 matcher 강화와 예행 자체의 추가 경로 사례는 후속으로 남깁니다.

`node packages/canard/schema-form/architecture/verification/branch-switch/tools/window/preflight.mjs <준비된 .noindex 루트>`는 정식 마커가 없는 준비 루트에서 창 전에 실행하는 비정식 예행입니다. 별도 -preflight.noindex 디렉터리의 실제 alternate CLI를 1행·1프로세스·예열1·표본1로 실행하며 공용 경로 해석과 profile context도 확인합니다.

## 단계 머리 병합

PR #489 충돌 해소를 위해 단계 머리 `cd4e3b78b9eff68369099f333d820782060ec165`를 병합했습니다. 도구 다섯 충돌을 해결하면서 이동한 공용 CPU 관측기 import 한 곳도 수정했습니다. 일반120초·Spotlight600초·.noindex stage 경로와 단계의 공용 preload를 함께 보존했습니다. 제품 소스·빌드 설정은 기존 후보와 동일합니다. 다시 build·typecheck를 통과했고 ESM·Node ESM·CJS의 SHA-256 세 개와 루트 d.ts 해시는 측정 후보652ddf6ee와 모두 같습니다. 공용 가상 시계·B9-0·B4-2·B6 합성 검사 및 변경 MJS26개의 문법·상대 import 검사가 통과했습니다. 기존 전체 제품 관문과 정식 창 결과를 재사용하며 새 정식 창은 실행하지 않았습니다. [병합 검증](raw/b12/merge-stage/)에 근거를 보존했습니다.
