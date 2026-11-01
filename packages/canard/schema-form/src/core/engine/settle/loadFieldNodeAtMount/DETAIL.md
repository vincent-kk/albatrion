# loadFieldNodeAtMount 계약

## Requirements

- 경로 조상의 계산은 jsonPointer의 resolvePointer에 위임하고 정적 적재의 순회·배달 할당 수는 유지합니다.

- 적재는 일반 슬롯과 overlay를 초기화하며 잠복 원본 저장소나 원본 그림자를 만들지 않는다. 슬롯 없는 호스트의 실행 경로는 준비 때 고정하고 정적 첫 적재와 일반 적재의 기존 커밋·배달 순서를 유지한다.

- H5b의 일반 로드와 정적 첫 적재는 동일한 bit-only 자격(공개 최외곽 entryDepth=1·전체 미구독·revision 읽기 없음·노드 기존 pending 없음)을 쓴다. revision을 처음 읽은 뒤에는 계속 관측 경로를 유지한다. 자격이 있을 때만 payload를 만들지 않고 같은 이전 원장+mask의 불변 다음 원장을 공유하며, 자격이 없으면 기존 payload·constructor를 유지한다. 전체 비트 계수와 옛 원장 snapshot은 같고 메모는 로드 정상·예외 종료에 해제한다. 정적 자격과 예약 배달 순서는 바꾸지 않는다(EVENT-006, NODE-060, TEST-080 D1-H5b).

- 최초 마운트의 정적 자격을 증명하고 로드 입력·스냅숏·커밋을 확정한다. 범용 경로와 같은 값·형상·배달 계약을 지키며 일반 쓰기의 정착은 부모가 소유한다(SETTLE-001·003·017, 89C-01·02).

## API Contracts

- 진입점은 `loadFieldNodeAtMount<Self>(root: FieldNodeRecord<Self>, value: unknown, option: WriteOption): void`를 이름으로 내보낸다. 부모 settle의 진입점이 이를 다시 내보내고 write의 마운트 진입이 소비한다.

- 첫 루트 load의 정적 경로는 기존 branchless capability와 선언 수집·형상 분석에서 얻은 내부 자격 증명을 사용한다. 게이트·식·잠복·기존 커밋이 없는 유한 객체·배열·스칼라와 literal `default`만 처리하며 `DisableAutomaticWrites`를 같은 값 선택에 적용한다. `controls.default`·virtual·재귀 배열·whole-value 전략·`controls.unsetValue`·`injectTo` 및 아직 증명하지 않은 호출자 입력은 노드 변경과 커밋 번호 예약 전에 범용 경로로 보낸다. 자격 확정 뒤에만 범용 경로와 같은 번호 하나를 예약한다(89C-01·02).
- 정적 첫 로드는 진입에서 기존 배달 Set의 자리를 예약하고, 부모 default의 명시 분배와 자손 default를 부모 우선으로 해석한 뒤 자식 완료 시 출력·required·페이로드·revision을 확정한다. 루트 완료 전 리스너·보고기를 호출하지 않으며 최외곽 디스패처가 예약 순서로 배달한다. 같은 값의 반복 읽기는 같은 참조이다. 노드별 계산·assembly는 각 1회이며 노드 재계산과 필수 배달 순회를 따로 기록한다. 기존 배달 Set의 O(N) 순서 셀과 O(D) DFS 스택을 유지하고, 발생별 선택 선언·dirty 등록·빈 automatic/exit/disposal 집합·형상 재선택·`initialOutputs` 목록을 만들지 않는다. 새 순서 셀은 없으며 기존 셀당 바이트와 범용 scratch 감소를 별도로 측정한다. 시간·메모리 비용은 93라운드 (i)의 HEAD/작업트리 쌍 측정으로 기록한다(89C-04·05, GOAL-071, SETTLE-001·003·017, EVENT-005·007).

## Acceptance Criteria

### settle-static-gate-selection-preparation — 정적 첫 로드의 준비 생략

- 정적 로더는 분기·식 없는 청사진만 받으므로 선택 계획과 표를 준비하지 않습니다. 정적 로더에 실제 도달하며 관련 캐시는 비어 있는지 확인합니다.

### settle-static-first-load — 정적 첫 로드의 범용 경로 동등성

- 동일 행렬에서 범용 oracle과 정적 첫 로드의 최종 값·오류·진단·순서·revision·commit·전역 상태·리스너 페이로드·경고가 같다. 자격 밖 경로는 커밋 번호를 소비하지 않고 범용 경로로 간다.
- 배열 D가 만든 아이템 자손의 채움은 한 라운드이며 노드별 계산·assembly는 각 1회이다. 범용 경로에서 먼저 같은 단언을 통과한다(90C-01·92C-03).
- 리스너는 전체 revision 확정 뒤에만 실행되고 첫 로드 중 동기 보고기는 중간 상태를 관측하지 않는다. 시간 표본과 구조·출력 횟수 진단은 별도 실행한다.

### settle-static-first-load-residual-scaling — 기본값 부재 탐색과 dirty 에지 복구

- 깊이 3·5의 기본값 없는 가지는 하위 원본 탐색을 생략하고 깊이 4·16·64의 무게이트 갱신은 조상마다 에지 하나를 색인하는지 확인한다. 일반 삭제 순서·미해결 경로의 조상 복구·부모 기본값과 기존 자손 원본의 우선순위·변환 뒤 frontier 순서 및 clear 뒤 일반 모드 복원을 확인한다.


### settle-static-first-load-assembly — 정적 마운트의 한 번 조립과 사전 판정

- 정적 발생은 자식 우선으로 한 번씩 조립되고 작성·배달 순서, 입력·기본값·억제의 우선순위, 노드·값·자식 참조와 비구독 revision을 유지하며 범용 scratch·발생별 선언 색인과 빈 조회 직렬화를 만들지 않는지 확인한다. 빈 배달 커밋의 참조·revision은 그대로이고 기존 자식·잠재 원본·호출자 입력은 노드 변경과 커밋 예약 전에 정적 경로에서 거절되는지 확인한다.

## Last Updated

2026-10-28
