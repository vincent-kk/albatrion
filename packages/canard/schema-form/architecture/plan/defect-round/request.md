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
