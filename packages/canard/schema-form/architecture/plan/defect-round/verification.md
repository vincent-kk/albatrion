# 결함 검증 계획

## 재현과 판별력

D4·D5는 render/react18에서 red, D6·D7은 실제 onInactive 호출을 확인한 green guard입니다. 기준 JSON을 raw/defect-round에 gzip하고 커밋된 시험 텍스트의 sha256을 붙입니다. DR-1은 unmount된 슬롯의 async 판정 중 서로 다른 루트 9개 이상 compile/release, counts 복원·무검증기·같은 id pending 교체를 확인합니다. DR-2는 슬롯 ValidatorThrew의 onError 1·host 1과 MultipleErrors 원소 순서를 확인합니다. DR-3은 retained 충돌·해제 뒤 성공·제3 retained 루트·실패한 재시도의 원래 rejection·guard 정체성 및 ajv6·7·8을 확인합니다. pin 제거·host 전달 제거·재시도 전 same-id 축출 제거의 세 변이가 각 시험을 실패시켜야 합니다.

## 순차 관문

lint 경고 0 → typecheck → build → unit → render → react18 → verify → storybook → production → import-model 순서입니다. 그 뒤 공개 표면 불변, FCA 신규 finding 없음, 원장 신규 finding 없음, 추가 텍스트와 신규 gzip 해제본의 머신 경로 없음, 기존 skip·todo 불변을 확인합니다. 전체 관문은 Amendment 3 적용 뒤 실행합니다. 결과는 한국어 defect-round-results.md에 각 결함·재현·수정·red/green·변이·한계·관문을 기록합니다.


## Amendment 3·4 추가 관문

DR-8: Error·primitive의 rebuild와 schema-change reset, 최초 구성 실패 뒤 constructible schema 재렌더·reset, primitive props-reset의 load·render 두 기록, 기존 never-prepared 회귀를 확인합니다. DR-9: 부모 재렌더 없는 remove·insert·reorder, 같은 이름의 oneOf 교체, unresolved /2의 push 후 진입, StrictMode·React18 legacy root의 구독 해제·동기 wave, node 입력 무구독과 root 4리스너를 확인합니다. reported 제거와 구독 제거 두 변이를 검출한 뒤 전체 관문을 실행합니다.


## Amendment 5

DR-10은 inline errors 배열과 validator 교체 및 같은 batch reset·schema 변경의 stale root 쓰기를 재현한 뒤 errors effect를 store.load.root로 바꿉니다. DR-12는 reset의 applyFormErrors에 load origin을 명시하며 no-root recovery listener 기록으로 확인합니다. F1의 origin 문구·F2의 공개 주석 세 곳·존재하지 않는 onReady를 정정합니다. F2는 공개 선언의 주석만 승인된 차이이며 형은 유지합니다. DR-11은 두 React에서 non-native degraded submit의 caller rejection·onError0·host0과 native onError1(origin submit)·host1을 확인했으며 ERROR-019 항목 3·4 및 IR-9 정의를 코디네이터에게 보고하고 결정을 기다립니다.


## Amendment 6

DR-11은 ERROR-019 항목 3·4의 결함으로 수정합니다. 명시적 degraded submit은 onError 1(origin submit)·host 0·caller rejection이며 native는 onError 1·host 1입니다. degraded validate의 실행 실패는 이미 onError 1(origin validate)·caller rejection이므로 그대로 둡니다. 최종 결과는 push 없이 로컬 HEAD로 코디네이터에게 인계합니다.


## Amendment 7·8 보충

DR-13은 남은 로드 판정을 root 요청으로 충족하고 대체된 비동기 targets를 보존합니다. DR-14는 보고된 원인과 handler 예외만 담은 capture를 생략하며 degraded caller 거부는 bundle로 보존합니다. DR-15는 읽기 당시 scope와 입력 root의 수명을 지킵니다. 공개 batch/walk 이력 예외의 현행 문서를 정정합니다. IR-8의 쓰기 요청 root 가정은 [결정 보충](../../reviews/defect-round.md)으로 정정하며 기준 재현·React 두 버전·mutation·최종 관문으로 검증합니다.


## Amendment 9·10 — 결과 관문 정정

DR-13의 완료 시 대상 재삽입은 요청 시점 handoff로 대체합니다. cadence/root 실행 소유 객체를 자기 실행만 지우며 하위 validate는 건드리지 않습니다. DR-1은 구성 중 unpinned guard read의 설치 루트를 축출하지 않고 DR-2는 예약 load.retired만 늦은 host 보고의 은퇴 신호로 씁니다. DR-14는 nonempty dense known bundle만 생략합니다. DR-11의 degraded native handler 실패는 ERROR-028에 따라 하나의 bundle로 host에 전달하도록 바뀌었습니다. 슬롯의 원소별 host 형태와 native의 거부 그대로 전달을 통일하는 결정은 단계 마감으로 남깁니다. node/root 입력에는 추가 경로 탐색·리스너 배달이 없고 렌더마다 상수 시간 snapshot hook 하나가 있습니다. [정정 결정](../../reviews/defect-round.md)의 Amendment 9·10을 따르며 새 reds·변이·전체 관문은 결과 문서에 보충합니다.
