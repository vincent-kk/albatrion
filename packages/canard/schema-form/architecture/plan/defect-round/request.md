# 결함 라운드 요청

## 소유자 지시와 맥락

- Quote 66: "기존 문제도 발견했으면 수정을 해야죠. 기록해두세요. 제가 확인하고 모든 수정 후 결함수정 라운드를 진행하죠"
  - 맥락: 코디네이터가 기존 결함을 범위 밖으로 기록한 뒤의 지시입니다.
- Quote 67: "문제 발생과 수정, 성능지표 최적화까지 너의 역할이다. 나에게 결정을 미루는 형태로 회피하지 말도록"
  - 맥락: 기술 판단은 코디네이터가 소유한다는 상시 지시입니다.

## 범위와 순서

기준 779713587에서 DR-5 재현을 먼저 수행합니다. D4·D5는 두 React 프로젝트에서 재현되어 red를 커밋하고 설계 보충 전 수정하지 않습니다. D6·D7은 비재현으로 닫으며 green guard를 보존합니다. 코디네이터의 후속 지시에 따라 DR-1·DR-2·DR-3과 D9 제한 기록의 계약→red→제품→변이 순서를 계속합니다. 전체 관문은 Amendment 3 적용 뒤 실행합니다.

VALIDATE-021·046·052, ERROR-019·201·023과 ADR 0004를 보충합니다. DR-4는 철회되었고 DR-6·DR-7·D8 측정·패키지 버전 변경은 이 worker 범위에서 제외합니다. 기존 원장·ADR·계획 줄은 보존하며 현행 명세만 정정합니다.


## 코디네이터 추가 지시

독립 검토를 통과한 Amendment 3·4에 따라 DR-8(D4)과 DR-9(D5)을 추가합니다. 조건은 Amendment 4를 우선하며 DR-1–3·DR-8·DR-9가 모두 green이면 전체 관문으로 진행합니다.


## Amendment 5

DR-10은 inline errors 배열과 validator 교체 및 같은 batch reset·schema 변경의 stale root 쓰기를 재현한 뒤 errors effect를 store.load.root로 바꿉니다. DR-12는 reset의 applyFormErrors에 load origin을 명시하며 no-root recovery listener 기록으로 확인합니다. F1의 origin 문구·F2의 공개 주석 세 곳·존재하지 않는 onReady를 정정합니다. F2는 공개 선언의 주석만 승인된 차이이며 형은 유지합니다. DR-11은 두 React에서 non-native degraded submit의 caller rejection·onError0·host0과 native onError1(origin submit)·host1을 확인했으며 ERROR-019 항목 3·4 및 IR-9 정의를 코디네이터에게 보고하고 결정을 기다립니다.


## Amendment 6

DR-11은 ERROR-019 항목 3·4의 결함으로 수정합니다. 명시적 degraded submit은 onError 1(origin submit)·host 0·caller rejection이며 native는 onError 1·host 1입니다. degraded validate의 실행 실패는 이미 onError 1(origin validate)·caller rejection이므로 그대로 둡니다. 최종 결과는 push 없이 로컬 HEAD로 코디네이터에게 인계합니다.


## Amendment 7·8 보충

DR-13은 남은 로드 판정을 root 요청으로 충족하고 대체된 비동기 targets를 보존합니다. DR-14는 보고된 원인과 handler 예외만 담은 capture를 생략하며 degraded caller 거부는 bundle로 보존합니다. DR-15는 읽기 당시 scope와 입력 root의 수명을 지킵니다. 공개 batch/walk 이력 예외의 현행 문서를 정정합니다. IR-8의 쓰기 요청 root 가정은 [결정 보충](../../reviews/defect-round.md)으로 정정하며 기준 재현·React 두 버전·mutation·최종 관문으로 검증합니다.


## Amendment 9·10 — 결과 관문 정정

DR-13의 완료 시 대상 재삽입은 요청 시점 handoff로 대체합니다. cadence/root 실행 소유 객체를 자기 실행만 지우며 하위 validate는 건드리지 않습니다. DR-1은 구성 중 unpinned guard read의 설치 루트를 축출하지 않고 DR-2는 예약 load.retired만 늦은 host 보고의 은퇴 신호로 씁니다. DR-14는 nonempty dense known bundle만 생략합니다. DR-11의 degraded native handler 실패는 ERROR-028에 따라 하나의 bundle로 host에 전달하도록 바뀌었습니다. 슬롯의 원소별 host 형태와 native의 거부 그대로 전달을 통일하는 결정은 단계 마감으로 남깁니다. node/root 입력에는 추가 경로 탐색·리스너 배달이 없고 렌더마다 상수 시간 snapshot hook 하나가 있습니다. [정정 결정](../../reviews/defect-round.md)의 Amendment 9·10을 따르며 새 reds·변이·전체 관문은 결과 문서에 보충합니다.
